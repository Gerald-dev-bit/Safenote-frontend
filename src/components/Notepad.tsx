import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  const [showShareModal, setShowShareModal] = useState(false);
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
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const navigate = useNavigate();
  const saveTimeout = useRef<number | null>(null);

  useEffect(() => {
    if (noteId !== noteId.toLowerCase()) {
      navigate(`/${noteId.toLowerCase()}`);
    }
  }, [noteId, navigate]);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(`/api/notes/${noteId}`);
        const requiresPassword = response.data.requiresPassword;
        setIsPasswordSet(requiresPassword);
        if (requiresPassword) {
          setShowVerifyPasswordModal(true);
          const verifyModal = document.getElementById("password-verify-modal");
          if (verifyModal) verifyModal.style.display = "block";
        } else {
          setContent(response.data.content || "");
          setSavedContent(response.data.content || "");
          updateCounts(response.data.content || "");
          setVerifiedPassword(null);
        }
      } catch (error) {
        console.error("Error fetching note:", error);
        setContent("");
        setSavedContent("");
        if (axios.isAxiosError(error) && error.response?.status === 500) {
          setSaveError("Server error - please try again later.");
        } else {
          setSaveError("Failed to load note. Please try again.");
        }
      }
    };
    fetchNote();
  }, [noteId]);

  useEffect(() => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    if (savedContent === null || content === savedContent) {
      return;
    }

    saveTimeout.current = window.setTimeout(async () => {
      try {
        const saveData = verifiedPassword
          ? {
              content: content || "",
              password: verifiedPassword,
            }
          : { content: content || "" };
        const response = await axios.post(`/api/notes/${noteId}`, saveData);
        if (response.status === 200) {
          setSavedContent(content);
          setSaveError("");
        }
      } catch (error) {
        console.error("Error saving note:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          setVerifyError(
            "Password required or incorrect. Please verify again."
          );
          setShowVerifyPasswordModal(true);
          const verifyModal = document.getElementById("password-verify-modal");
          if (verifyModal) verifyModal.style.display = "block";
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
  }, [content, noteId, verifiedPassword, savedContent]);

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
        const response = await axios.post(`/api/notes/${noteId}/set-password`, {
          password,
        });
        if (response.status === 200) {
          setVerifiedPassword(password);
          setIsPasswordSet(true);
          setShowSetPasswordModal(false);
          const setModal = document.getElementById("password-set-modal");
          if (setModal) setModal.style.display = "none";
          setPassword("");
          setVerifyError("");
        }
      } catch (error) {
        console.error("Error setting password:", error);
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          setVerifyError("Password already set for this note.");
        } else {
          setVerifyError("Failed to set password. Try again.");
        }
      }
    } else {
      setVerifyError("Password cannot be empty.");
    }
  };

  const handleVerifyPassword = async () => {
    try {
      const response = await axios.post(`/api/notes/${noteId}/verify`, {
        password,
      });
      setContent(response.data.content || "");
      setSavedContent(response.data.content || "");
      updateCounts(response.data.content || "");
      setVerifiedPassword(password);
      setShowVerifyPasswordModal(false);
      const verifyModal = document.getElementById("password-verify-modal");
      if (verifyModal) verifyModal.style.display = "none";
      setPassword("");
      setVerifyError("");
    } catch (error) {
      console.error("Error verifying password:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setVerifyError("Wrong password. Try again.");
      } else if (axios.isAxiosError(error) && error.response?.status === 400) {
        setVerifyError("No password set for this note.");
      } else {
        setVerifyError("Failed to verify password. Try again.");
      }
    }
  };

  const handleCancelPassword = () => {
    setShowSetPasswordModal(false);
    setShowVerifyPasswordModal(false);
    const setModal = document.getElementById("password-set-modal");
    if (setModal) setModal.style.display = "none";
    const verifyModal = document.getElementById("password-verify-modal");
    if (verifyModal) verifyModal.style.display = "none";
    setPassword("");
    setVerifyError("");
  };

  const openSetPasswordModal = () => {
    if (isPasswordSet) {
      setNotification("Password is already set and cannot be changed.");
      setTimeout(() => setNotification(""), 2000);
    } else {
      setShowSetPasswordModal(true);
      const setModal = document.getElementById("password-set-modal");
      if (setModal) setModal.style.display = "block";
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

  const handleCopyEditableLink = () => {
    const editableLink = `${window.location.origin}/${noteId}`;
    navigator.clipboard
      .writeText(editableLink)
      .then(() => {
        setNotification("Editable link copied to clipboard!");
        setTimeout(() => setNotification(""), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy editable link: ", err);
        setNotification("Failed to copy link.");
        setTimeout(() => setNotification(""), 2000);
      });
  };

  const handleShareLink = () => {
    setShowShareModal(true);
    const shareModal = document.getElementById("share-modal");
    if (shareModal) shareModal.style.display = "block";
  };

  const handleCopyShareLink = (format: string) => {
    const baseUrl = window.location.origin;
    let shareLink: string;
    switch (format) {
      case "raw":
        shareLink = `${baseUrl}/Raw/${noteId}`;
        break;
      case "markdown":
        shareLink = `${baseUrl}/Markdown/${noteId}`;
        break;
      case "code":
        shareLink = `${baseUrl}/Code/${noteId}`;
        break;
      default:
        shareLink = `${baseUrl}/Raw/${noteId}`;
    }
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        setNotification(
          `${
            format.charAt(0).toUpperCase() + format.slice(1)
          } view link copied to clipboard!`
        );
        setShowShareModal(false);
        const shareModal = document.getElementById("share-modal");
        if (shareModal) shareModal.style.display = "none";
        setTimeout(() => setNotification(""), 2000);
      })
      .catch((err) => {
        console.error(`Failed to copy ${format} link: `, err);
        setNotification("Failed to copy link.");
        setShowShareModal(false);
        const shareModal = document.getElementById("share-modal");
        if (shareModal) shareModal.style.display = "none";
        setTimeout(() => setNotification(""), 2000);
      });
  };

  const handleCancelShare = () => {
    setShowShareModal(false);
    const shareModal = document.getElementById("share-modal");
    if (shareModal) shareModal.style.display = "none";
  };

  const togglePasswordVisibility = (type: "set" | "verify") => {
    if (type === "set") {
      setShowSetPassword(!showSetPassword);
    } else {
      setShowVerifyPassword(!showVerifyPassword);
    }
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
          {saveError && <p className="error-message">{saveError}</p>}
          {showSetPasswordModal && (
            <div id="password-set-modal" className="password-modal">
              <div className="password-modal-content">
                <h3>Set Password</h3>
                <p>Choose a strong password to secure your note.</p>
                <div className="password-input-wrapper">
                  <input
                    type={showSetPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                  <i
                    className={`fas fa-eye${
                      !showSetPassword ? "-slash" : ""
                    } toggle-password`}
                    onClick={() => togglePasswordVisibility("set")}></i>
                </div>
                {verifyError && <p className="error-message">{verifyError}</p>}
                <div className="password-modal-buttons">
                  <button onClick={handleSetPassword}>Save</button>
                  <button onClick={handleCancelPassword}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {showVerifyPasswordModal && (
            <div id="password-verify-modal" className="password-modal">
              <div className="password-modal-content">
                <h3>Enter Password</h3>
                <p>Enter the password to access this secure note.</p>
                <div className="password-input-wrapper">
                  <input
                    type={showVerifyPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                  <i
                    className={`fas fa-eye${
                      !showVerifyPassword ? "-slash" : ""
                    } toggle-password`}
                    onClick={() => togglePasswordVisibility("verify")}></i>
                </div>
                {verifyError && <p className="error-message">{verifyError}</p>}
                <div className="password-modal-buttons">
                  <button onClick={handleVerifyPassword}>Verify</button>
                  <button onClick={handleCancelPassword}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {showShareModal && (
            <div id="share-modal" className="share-modal">
              <div className="share-modal-content">
                <h3>Share Note</h3>
                <p>Select a view to share this note.</p>
                <div className="share-modal-buttons">
                  <button
                    className="view-raw"
                    onClick={() => handleCopyShareLink("raw")}>
                    Raw View
                  </button>
                  <button
                    className="view-markdown"
                    onClick={() => handleCopyShareLink("markdown")}>
                    Markdown View
                  </button>
                  <button
                    className="view-code"
                    onClick={() => handleCopyShareLink("code")}>
                    Code View
                  </button>
                </div>
                <button onClick={handleCancelShare}>Cancel</button>
              </div>
            </div>
          )}
          <div className="edit-tools">
            <button className="tool-button" onClick={toggleIpadSize}>
              <i className="fas fa-tablet-alt"></i>
            </button>
            <button className="tool-button" onClick={increaseFontSize}>
              <i className="fas fa-plus"></i>
            </button>
            <button className="tool-button" onClick={decreaseFontSize}>
              <i className="fas fa-minus"></i>
            </button>
            <button className="tool-button view-raw" onClick={viewRaw}>
              <i className="fas fa-file"></i>
            </button>
            <button
              className="tool-button view-markdown"
              onClick={viewMarkdown}>
              <i className="fab fa-markdown"></i>
            </button>
            <button className="tool-button view-code" onClick={viewCode}>
              <i className="fas fa-code"></i>
            </button>
          </div>
        </main>
        <footer className="bottom-bar">
          <div className="center-content">
            <div className="links">
              <button className="link-button" onClick={handleCopyEditableLink}>
                <i className="fas fa-link"></i> Editable Link
              </button>
              <button className="link-button" onClick={handleShareLink}>
                <i className="fas fa-share"></i> Share
              </button>
            </div>
            <div className="counts">
              <span>Words: {wordCount}</span>
              <span>Chars: {charCount}</span>
            </div>
          </div>
        </footer>
      </div>
      {notification && <div className="slide-notification">{notification}</div>}
    </>
  );
};

export default Notepad;
