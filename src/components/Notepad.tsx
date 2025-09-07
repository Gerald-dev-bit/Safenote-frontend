// src/components/Notepad.tsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

interface NotepadProps {
  noteId: string;
}

function generateRandomId(length = 8) {
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
  const [password, setPassword] = useState("");
  const [verifiedPassword, setVerifiedPassword] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState("");
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(false);
  const [monospaceEnabled, setMonospaceEnabled] = useState(false);
  const [theme, setTheme] = useState("light");
  const [isIpadSize, setIsIpadSize] = useState(false);
  const [fontSize, setFontSize] = useState(14);
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
        if (response.data.requiresPassword) {
          setShowVerifyPasswordModal(true);
        } else {
          setContent(response.data.content || "");
          setSavedContent(response.data.content || "");
          setVerifiedPassword(null); // No password needed
        }
      } catch (error) {
        console.error("Error fetching note:", error);
        setContent("");
        setSavedContent("");
      }
    };
    fetchNote();
  }, [noteId]);

  useEffect(() => {
    if (saveTimeout.current) {
      window.clearTimeout(saveTimeout.current);
    }

    if (savedContent === null || content === savedContent) {
      return;
    }

    saveTimeout.current = window.setTimeout(() => {
      const saveData = verifiedPassword
        ? { content, password: verifiedPassword }
        : { content };
      axios
        .post(`/api/notes/${noteId}`, saveData)
        .then(() => {
          setSavedContent(content);
        })
        .catch((error) => {
          console.error("Error saving note:", error);
          if (error.response?.status === 401) {
            setVerifyError(
              "Password required or incorrect. Please verify again."
            );
            setShowVerifyPasswordModal(true);
            setVerifiedPassword(null);
          }
        });
    }, 500);

    return () => {
      if (saveTimeout.current) {
        window.clearTimeout(saveTimeout.current);
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

  const handleSetPassword = () => {
    if (password) {
      axios
        .post(`/api/notes/${noteId}/set-password`, { password })
        .then(() => {
          setVerifiedPassword(password); // Store for future saves
        })
        .catch((error) => console.error("Error setting password:", error));
    }
    setShowSetPasswordModal(false);
    setPassword("");
  };

  const handleVerifyPassword = () => {
    axios
      .post(`/api/notes/${noteId}/verify`, { password })
      .then((response) => {
        setContent(response.data.content || "");
        setSavedContent(response.data.content || "");
        setVerifiedPassword(password);
        setShowVerifyPasswordModal(false);
        setPassword("");
        setVerifyError("");
      })
      .catch((error) => {
        console.error("Error verifying password:", error);
        setVerifyError("Wrong password. Try Again.");
      });
  };

  const handleCancelPassword = () => {
    setShowSetPasswordModal(false);
    setShowVerifyPasswordModal(false);
    setPassword("");
    setVerifyError("");
  };

  const openSetPasswordModal = () => {
    setShowSetPasswordModal(true);
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
        <span>Privacy</span> - <span>Terms</span> - <span>Contact</span> -{" "}
        <span>About Us</span>
      </div>
    </>
  );
};
export default Notepad;
