import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Link } from "react-router-dom";
import Turnstile from "react-turnstile";

axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
axios.defaults.withCredentials = true;

interface NotepadProps {
  noteId: string;
}

function generateRandomId(length = 8): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

const Notepad: React.FC<NotepadProps> = ({ noteId }) => {
  const [content, setContent] = useState("");
  const [savedContent, setSavedContent] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false);
  const [showVerifyPasswordModal, setShowVerifyPasswordModal] = useState(false);
  const [showHumanVerification, setShowHumanVerification] = useState(true);
  const [humanToken, setHumanToken] = useState("");
  const [password, setPassword] = useState("");
  const [verifiedPassword, setVerifiedPassword] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState("");
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(false);
  const [monospaceEnabled, setMonospaceEnabled] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isIpadSize, setIsIpadSize] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [saveError, setSaveError] = useState("");
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [notification, setNotification] = useState("");
  const navigate = useNavigate();
  const saveTimeout = useRef<number | null>(null);
  const [tokenKey, setTokenKey] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const tokenResolveRef = useRef<((token: string) => void) | null>(null);
  const tokenRejectRef = useRef<((reason?: any) => void) | null>(null);

  useEffect(() => {
    if (noteId !== noteId.toLowerCase()) {
      navigate(`/${noteId.toLowerCase()}`);
    }
  }, [noteId, navigate]);

  useEffect(() => {
    if (showHumanVerification) return;

    const fetchNote = async () => {
      try {
        const response = await axios.get(`/api/notes/${noteId}`, {
          params: { "cf-turnstile-response": humanToken },
        });
        const requiresPassword = response.data.requiresPassword;
        setIsPasswordSet(requiresPassword);
        if (requiresPassword) {
          setShowVerifyPasswordModal(true);
        } else {
          setContent(response.data.content || "");
          setSavedContent(response.data.content || "");
          updateCounts(response.data.content || "");
          setVerifiedPassword(null);
        }
        setRetryCount(0);
      } catch (error) {
        console.error("Error fetching note:", error);
        setContent("");
        setSavedContent("");
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 403 &&
          retryCount < 3
        ) {
          setRetryCount((prev) => prev + 1);
          setHumanToken("");
          setShowHumanVerification(true);
          setSaveError("Verification failed, retrying...");
        } else if (
          axios.isAxiosError(error) &&
          error.response?.status === 500
        ) {
          setSaveError("Server error - please try again later.");
        }
      }
    };
    fetchNote();
  }, [noteId, showHumanVerification, humanToken, retryCount]);

  const getTurnstileToken = () => {
    setTokenKey((prev) => prev + 1);
    return new Promise<string>((resolve, reject) => {
      tokenResolveRef.current = resolve;
      tokenRejectRef.current = reject;
    });
  };

  useEffect(() => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    if (savedContent === null || content === savedContent) {
      return;
    }

    saveTimeout.current = window.setTimeout(async () => {
      try {
        const token = await getTurnstileToken();
        const saveData = verifiedPassword
          ? {
              content: content || "",
              password: verifiedPassword,
              "cf-turnstile-response": token,
            }
          : { content: content || "", "cf-turnstile-response": token };
        await axios.post(`/api/notes/${noteId}`, saveData);
        setSavedContent(content);
        setSaveError("");
      } catch (error) {
        console.error("Error saving note:", error);
        if (
          axios.isAxiosError(error) &&
          error.response?.status === 403 &&
          retryCount < 3
        ) {
          setRetryCount((prev) => prev + 1);
          setSaveError("CAPTCHA failed, retrying...");
        } else if (
          axios.isAxiosError(error) &&
          error.response?.status === 401
        ) {
          setVerifyError(
            "Password required or incorrect. Please verify again."
          );
          setShowVerifyPasswordModal(true);
          setVerifiedPassword(null);
        } else if (
          axios.isAxiosError(error) &&
          error.response?.status === 500
        ) {
          setSaveError("Server error - please try again later.");
        } else {
          setSaveError("Failed to save note. Please try again.");
        }
      }
    }, 500);

    return () => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }
    };
  }, [content, noteId, verifiedPassword, savedContent, retryCount]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateCounts(newContent);
  };

  const updateCounts = (text: string) => {
    setCharCount(text.length);
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
  };

  const createNewNote = () => {
    const newId = generateRandomId();
    navigate(`/${newId}`);
  };

  const handleSetPassword = async () => {
    if (password) {
      try {
        const token = await getTurnstileToken();
        await axios.post(`/api/notes/${noteId}/set-password`, {
          password,
          "cf-turnstile-response": token,
        });
        setVerifiedPassword(password);
        setIsPasswordSet(true);
        setShowSetPasswordModal(false);
        setPassword("");
        setVerifyError("");
      } catch (error) {
        console.error("Error setting password:", error);
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          setVerifyError("CAPTCHA validation failed. Try again.");
        } else {
          setVerifyError("Failed to set password. Try again.");
        }
      }
    } else {
      console.error("Missing password");
    }
  };

  const handleVerifyPassword = async () => {
    try {
      const token = await getTurnstileToken();
      const response = await axios.post(`/api/notes/${noteId}/verify`, {
        password,
        "cf-turnstile-response": token,
      });
      setContent(response.data.content || "");
      setSavedContent(response.data.content || "");
      updateCounts(response.data.content || "");
      setVerifiedPassword(password);
      setShowVerifyPasswordModal(false);
      setPassword("");
      setVerifyError("");
    } catch (error) {
      console.error("Error verifying password:", error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setVerifyError("CAPTCHA validation failed. Try again.");
      } else {
        setVerifyError("Wrong password. Try Again.");
      }
    }
  };

  const handleCancelPassword = () => {
    setShowSetPasswordModal(false);
    setShowVerifyPasswordModal(false);
    setPassword("");
    setVerifyError("");
  };

  const openSetPasswordModal = () => {
    if (isPasswordSet) {
      setNotification("Password is already set and cannot be changed.");
      setTimeout(() => setNotification(""), 2000);
    } else {
      setShowSetPasswordModal(true);
    }
  };

  const toggleSpellCheck = () => {
    setSpellCheckEnabled(!spellCheckEnabled);
  };

  const toggleMonospace = () => {
    setMonospaceEnabled(!monospaceEnabled);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const toggleIpadSize = () => {
    setIsIpadSize(!isIpadSize);
  };

  const increaseFontSize = () => {
    setFontSize((prev) => prev + 2);
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 2, 8));
  };

  const viewRaw = () => {
    window.open(`/Raw/${noteId}`, "_blank");
  };

  const viewMarkdown = () => {
    window.open(`/Markdown/${noteId}`, "_blank");
  };

  const viewCode = () => {
    window.open(`/Code/${noteId}`, "_blank");
  };

  return (
    <>
      <div
        className={`app-container ${theme} ${isIpadSize ? "ipad-size" : ""}`}>
        <header className="top-bar">
          <div className="logo">safenote</div>
          <div className="icons">
            <div className="tooltip" onClick={createNewNote}>
              <i className="fas fa-plus"></i>
              <span className="tooltiptext">New Note</span>
            </div>
            <div className="tooltip" onClick={openSetPasswordModal}>
              <i className="fas fa-lock"></i>
              <span className="tooltiptext">Password Option</span>
            </div>
            <div
              className={`tooltip${spellCheckEnabled ? " active" : ""}`}
              onClick={toggleSpellCheck}>
              <span>SP</span>
              <span className="tooltiptext">Spell Check</span>
            </div>
            <div
              className={`tooltip${monospaceEnabled ? " active" : ""}`}
              onClick={toggleMonospace}>
              <span>MO</span>
              <span className="tooltiptext">Monospace font</span>
            </div>
            <div
              className={`tooltip${theme === "dark" ? " active" : ""}`}
              onClick={toggleTheme}>
              <i className="far fa-lightbulb"></i>
              <span className="tooltiptext">Light switch</span>
            </div>
          </div>
        </header>
        <main className="edit-area">
          <textarea
            value={content}
            onChange={handleChange}
            placeholder="Start typing..."
            spellCheck={spellCheckEnabled}
            style={{
              fontFamily: monospaceEnabled
                ? "monospace"
                : '"Poppins", sans-serif',
              fontSize: `${fontSize}px`,
              fontWeight: 300,
            }}
          />
          {showHumanVerification && (
            <div className="password-modal">
              <div className="password-modal-content">
                <h3>Verify you're a Human</h3>
                <Turnstile
                  sitekey={import.meta.env.VITE_CF_TURNSTILE_SITEKEY}
                  appearance="always"
                  size="normal"
                  onVerify={(token: string) => {
                    setHumanToken(token);
                    setShowHumanVerification(false);
                  }}
                  onError={(errorCode: string) => {
                    console.error("Turnstile error:", errorCode);
                    setVerifyError("Verification failed. Please try again.");
                  }}
                  onExpire={() => {
                    console.warn("Turnstile token expired");
                    setVerifyError("Verification expired. Please try again.");
                  }}
                />
                {verifyError && <p className="error-message">{verifyError}</p>}
              </div>
            </div>
          )}
          {showSetPasswordModal && (
            <div className="password-modal">
              <div className="password-modal-content">
                <h3>Set Password</h3>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
                {verifyError && <p className="error-message">{verifyError}</p>}
                <div className="password-modal-buttons">
                  <button onClick={handleSetPassword}>Save</button>
                  <button onClick={handleCancelPassword}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {showVerifyPasswordModal && (
            <div className="password-modal">
              <div className="password-modal-content">
                <h3>Enter Password</h3>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to access note"
                />
                {verifyError && <p className="error-message">{verifyError}</p>}
                <div className="password-modal-buttons">
                  <button onClick={handleVerifyPassword}>Verify</button>
                  <button onClick={handleCancelPassword}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {saveError && <p className="error-message">{saveError}</p>}
          <div className="edit-tools">
            <div
              className={`tooltip tooltip-bottom${
                isIpadSize ? " active" : ""
              }`}>
              <button className="tool-button" onClick={toggleIpadSize}>
                <i className="fas fa-arrows-alt-v"></i>
              </button>
              <span className="tooltiptext">Resize window</span>
            </div>
            <div className="tooltip tooltip-bottom">
              <button className="tool-button" onClick={increaseFontSize}>
                <i className="fas fa-plus"></i>
              </button>
              <span className="tooltiptext">Increase font-size</span>
            </div>
            <div className="tooltip tooltip-bottom">
              <button className="tool-button" onClick={decreaseFontSize}>
                <i className="fas fa-minus"></i>
              </button>
              <span className="tooltiptext">Decrease font-size</span>
            </div>
            <div className="tooltip tooltip-bottom">
              <button className="tool-button" onClick={viewRaw}>
                Raw
              </button>
              <span className="tooltiptext">View in plain-text</span>
            </div>
            <div className="tooltip tooltip-bottom">
              <button className="tool-button" onClick={viewMarkdown}>
                Markdown
              </button>
              <span className="tooltiptext">View in markdown</span>
            </div>
            <div className="tooltip tooltip-bottom">
              <button className="tool-button" onClick={viewCode}>
                Code
              </button>
              <span className="tooltiptext">View in line numbers</span>
            </div>
          </div>
        </main>
        <footer className="bottom-bar">
          <div className="center-content">
            <div className="links">
              <button className="link-button">
                <i className="fas fa-link"></i> Editable Link
              </button>
              <button className="link-button">
                <i className="fas fa-share-alt"></i> Share Link
              </button>
            </div>
            <div className="counts">
              <span>
                Words: {wordCount} | Chars: {charCount}
              </span>
            </div>
          </div>
        </footer>
      </div>
      <div className="footer-links">
        <Link to="/privacy" target="_blank" rel="noopener noreferrer">
          Privacy
        </Link>
        <Link to="/terms" target="_blank" rel="noopener noreferrer">
          Terms
        </Link>
        <Link to="/contact" target="_blank" rel="noopener noreferrer">
          Contact
        </Link>
        <Link to="/about" target="_blank" rel="noopener noreferrer">
          About Us
        </Link>
      </div>
      {notification && <div className="slide-notification">{notification}</div>}
      <Turnstile
        key={tokenKey}
        sitekey={import.meta.env.VITE_CF_TURNSTILE_SITEKEY}
        appearance="interaction-only"
        onVerify={(token: string) => tokenResolveRef.current?.(token)}
        onError={(errorCode: string) => {
          console.error("Turnstile error:", errorCode);
          tokenRejectRef.current?.(new Error(`Turnstile error: ${errorCode}`));
        }}
        onExpire={() => {
          console.warn("Turnstile token expired");
          tokenRejectRef.current?.(new Error("Turnstile token expired"));
        }}
        style={{ display: "none" }}
      />
    </>
  );
};

export default Notepad;
