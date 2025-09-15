import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import Turnstile from "react-turnstile";

axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

interface MarkdownViewProps {
  noteId: string;
}

const MarkdownView: React.FC<MarkdownViewProps> = ({ noteId }) => {
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showVerifyPasswordModal, setShowVerifyPasswordModal] = useState(false);
  const [showHumanVerification, setShowHumanVerification] = useState(true);
  const [humanToken, setHumanToken] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [password, setPassword] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [tokenKey, setTokenKey] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const tokenResolveRef = useRef<((token: string) => void) | null>(null);
  const tokenRejectRef = useRef<((reason?: any) => void) | null>(null);

  useEffect(() => {
    if (showHumanVerification) return;

    const fetchNote = async () => {
      try {
        const response = await axios.get(`/api/notes/${noteId}`, {
          params: { "cf-turnstile-response": humanToken },
        });
        if (response.data.requiresPassword) {
          setShowVerifyPasswordModal(true);
        } else {
          setContent(response.data.content || "");
        }
        setRetryCount(0);
      } catch (err) {
        if (
          axios.isAxiosError(err) &&
          err.response?.status === 403 &&
          retryCount < 3
        ) {
          setRetryCount((prev) => prev + 1);
          setHumanToken("");
          setShowHumanVerification(true);
          setError("Verification failed, retrying...");
        } else {
          console.error("Error fetching note:", err);
          setError("Failed to load content.");
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

  const handleVerifyPassword = async () => {
    try {
      const token = await getTurnstileToken();
      const response = await axios.post(`/api/notes/${noteId}/verify`, {
        password,
        "cf-turnstile-response": token,
      });
      setContent(response.data.content || "");
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
      {showHumanVerification && (
        <div className="password-modal">
          <div className="password-modal-content">
            <h3>Verify you're a Human</h3>
            <Turnstile
              sitekey={import.meta.env.VITE_CF_TURNSTILE_SITEKEY}
              appearance="always"
              size="normal"
              onVerify={(token) => {
                setHumanToken(token);
                setShowHumanVerification(false);
              }}
              onError={(errorCode) => {
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
      <Turnstile
        key={tokenKey}
        sitekey={import.meta.env.VITE_CF_TURNSTILE_SITEKEY}
        appearance="interaction-only"
        onVerify={(token) => tokenResolveRef.current?.(token)}
        onError={(errorCode) => tokenRejectRef.current?.(errorCode)}
        onExpire={() => tokenRejectRef.current?.("Token expired")}
        style={{ display: "none" }}
      />
    </>
  );
};

export default MarkdownView;
