// src/components/RawView.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

interface RawViewProps {
  noteId: string;
}

const RawView: React.FC<RawViewProps> = ({ noteId }) => {
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
      <pre
        style={{
          whiteSpace: "pre-wrap",
          wordWrap: "break-word",
          padding: "0 20px",
          fontFamily: "monospace",
          fontSize: "14px",
        }}>
        {content}
      </pre>
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

export default RawView;
