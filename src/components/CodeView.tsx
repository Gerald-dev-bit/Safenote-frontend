import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Turnstile from "react-turnstile";

axios.defaults.baseURL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

interface CodeViewProps {
  noteId: string;
}

const CodeView: React.FC<CodeViewProps> = ({ noteId }) => {
  const [content, setContent] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyPasswordModal, setShowVerifyPasswordModal] = useState(false);
  const [showHumanVerification, setShowHumanVerification] = useState(true);
  const [humanToken, setHumanToken] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [password, setPassword] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const preRef = useRef<HTMLPreElement>(null);
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
          setHumanToken(""); // Reset to force new token
          setShowHumanVerification(true);
          setError(
            `Verification failed, retrying... (Attempt ${retryCount + 1}/3)`
          );
        } else if (axios.isAxiosError(err) && err.response?.status === 500) {
          setError("Server error - please try again later.");
        } else {
          console.error("Error fetching note:", err);
          setError("Failed to load content. Please try again.");
        }
      }
    };
    fetchNote();
  }, [noteId, showHumanVerification, humanToken, retryCount]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.toString() === "") {
        setIsSelected(false);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  const getTurnstileToken = () => {
    setTokenKey((prev) => prev + 1);
    return new Promise<string>((resolve, reject) => {
      tokenResolveRef.current = resolve;
      tokenRejectRef.current = reject;
    });
  };

  const toggleSelectAll = () => {
    if (isSelected) {
      const selection = window.getSelection();
      selection?.removeAllRanges();
      setIsSelected(false);
    } else {
      if (preRef.current) {
        const range = document.createRange();
        range.selectNodeContents(preRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        setIsSelected(true);
      }
    }
  };

  const handleCopy = () => {
    const selectedText = window.getSelection()?.toString();
    if (!selectedText) {
      setNotification("No text selected!");
      setTimeout(() => setNotification(null), 2000);
      return;
    }
    navigator.clipboard
      .writeText(selectedText)
      .then(() => {
        setNotification("Copied to clipboard!");
        setTimeout(() => setNotification(null), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        setNotification("Failed to copy");
        setTimeout(() => setNotification(null), 2000);
      });
  };

  const handleVerifyPassword = async () => {
    try {
      const token = await getTurnstileToken();
      const response = await axios.post(`/api/notes/${noteId}/verify`, {
        password,
        "cf-turnstile-response": token,
      });
      if (response.status === 200) {
        setContent(response.data.content || "");
        setShowVerifyPasswordModal(false);
        setPassword("");
        setVerifyError("");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setVerifyError("CAPTCHA validation failed. Try again.");
      } else if (axios.isAxiosError(error) && error.response?.status === 401) {
        setVerifyError("Wrong password. Try again.");
      } else if (axios.isAxiosError(error) && error.response?.status === 400) {
        setVerifyError("No password set for this note.");
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

  const lines = content.split("\n");
  let paraNum = 0;
  let inPara = false;
  const renderedLines = lines.map((line, index) => {
    if (line.trim() === "") {
      inPara = false;
      return (
        <div key={index} className="code-view-line">
          <span className="line-number"></span>
          {line}
        </div>
      );
    } else {
      if (!inPara) {
        paraNum++;
        inPara = true;
        return (
          <div key={index} className="code-view-line">
            <span className="line-number">{paraNum}.</span>
            {line}
          </div>
        );
      } else {
        return (
          <div key={index} className="code-view-line">
            <span className="line-number"></span>
            {line}
          </div>
        );
      }
    }
  });

  return (
    <>
      <div className="code-view-container">
        <div className="code-view-header">Written by Anonymous</div>
        <hr className="code-view-divider" />
        <pre className="code-view-pre" ref={preRef}>
          {renderedLines}
        </pre>
        <hr className="code-view-divider bottom-divider" />
        <div className="code-view-footer">
          <span className="footer-left">
            <span>
              <i className="fas fa-cloud"></i> SafeNote
            </span>{" "}
            - <span>cheat sheet</span>
          </span>
          <button
            className={`select-all-button ${isSelected ? "selected" : ""}`}
            onClick={toggleSelectAll}>
            <span className="checkbox-circle">{isSelected ? "✔" : ""}</span>
            {isSelected ? "Deselect All" : "Select All"}
          </button>
          <button
            className="select-all-button"
            onClick={handleCopy}
            style={{ marginLeft: "10px" }}>
            Copy Selected
          </button>
        </div>
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
                setShowHumanVerification(true); // Reset to show again
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
      {notification && <div className="notification">{notification}</div>}
      <Turnstile
        key={tokenKey}
        sitekey={import.meta.env.VITE_CF_TURNSTILE_SITEKEY}
        appearance="interaction-only"
        onVerify={(token) => tokenResolveRef.current?.(token)}
        onError={(errorCode) => {
          console.error("Turnstile error:", errorCode);
          tokenRejectRef.current?.(new Error(`Turnstile error: ${errorCode}`));
        }}
        onExpire={() => {
          console.warn("Turnstile token expired");
          tokenRejectRef.current?.(new Error("Turnstile token expired"));
          setTokenKey((prev) => prev + 1); // Force re-render for new token
        }}
        style={{ display: "none" }}
      />
    </>
  );
};

export default CodeView;
