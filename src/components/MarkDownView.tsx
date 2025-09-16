//src/components/MarkDownView.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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
        if (axios.isAxiosError(err) && err.response?.status === 500) {
          setError("Server error - please try again later.");
        } else {
          console.error("Error fetching note:", err);
          setError("Failed to load content. Please try again.");
        }
      }
    };
    fetchNote();
  }, [noteId]);

  const handleVerifyPassword = async () => {
    try {
      const response = await axios.post(`/api/notes/${noteId}/verify`, {
        password,
      });
      if (response.status === 200) {
        setContent(response.data.content || "");
        setShowVerifyPasswordModal(false);
        setPassword("");
        setVerifyError("");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setVerifyError("Wrong password. Try again.");
      } else if (axios.isAxiosError(error) && error.response?.status === 400) {
        setVerifyError("No password set for this note.");
      } else if (axios.isAxiosError(error) && error.response?.status === 500) {
        setVerifyError("Server error - please try again later.");
      } else {
        setVerifyError("Failed to verify password. Try again.");
      }
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
      <div className="markdown-view-container">
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
