// src/components/MarkdownView.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

axios.defaults.baseURL = "http://localhost:5000"; // Change to your backend URL in production

interface MarkdownViewProps {
  noteId: string;
}

const MarkdownView: React.FC<MarkdownViewProps> = ({ noteId }) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showVerifyPasswordModal, setShowVerifyPasswordModal] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [password, setPassword] = useState("");
  const [verifyError, setVerifyError] = useState("");

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(`/api/notes/${noteId}`);
        if (response.data.requiresPassword) {
          setShowVerifyPasswordModal(true);
        } else {
          setContent(response.data.content || "");
        }
      } catch (err) {
        console.error("Error fetching note:", err);
        setError("Failed to load content.");
      }
    };
    fetchNote();
  }, [noteId]);

  const handleVerifyPassword = async () => {
    try {
      const response = await axios.post(`/api/notes/${noteId}/verify`, {
        password,
      });
      setContent(response.data.content || "");
      setShowVerifyPasswordModal(false);
      setPassword("");
      setVerifyError("");
    } catch (error) {
      console.error("Error verifying password:", error);
      setVerifyError("Wrong password. Try Again.");
    }
  };

  const handleCancelPassword = () => {
    setShowVerifyPasswordModal(false);
    setAccessDenied(true);
    setPassword("");
    setVerifyError("");
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (accessDenied) {
    return <div>Access denied.</div>;
  }

  return (
    <>
      <div
        style={{
          padding: "20px",
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          margin: "20px auto",
          maxWidth: "800px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          fontFamily: "monospace",
          fontSize: "14px",
        }}>
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
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
    </>
  );
};

export default MarkdownView;
