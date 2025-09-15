import React, { useEffect, useState, useRef } from "react";
import axios, { isAxiosError } from "axios";
import Turnstile from "react-turnstile";

const isDev = import.meta.env.MODE === "development";
axios.defaults.baseURL = isDev
  ? "http://localhost:5000"
  : import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

interface CodeViewProps {
  noteId: string;
}

const CodeView: React.FC<CodeViewProps> = ({ noteId }) => {
  const [content, setContent] = useState("");
  const [isSelected, setIsSelected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerifyPasswordModal, setShowVerifyPasswordModal] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [password, setPassword] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [notification, setNotification] = useState<string | null>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const [tokenKey, setTokenKey] = useState(0);
  const tokenResolveRef = useRef<(token: string) => void | null>(null);
  const tokenRejectRef = useRef<(reason?: any) => void | null>(null);

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

  const getTurnstileToken = async () => {
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
      setContent(response.data.content || "");
      setShowVerifyPasswordModal(false);
      setPassword("");
      setVerifyError("");
    } catch (error: unknown) {
      console.error("Error verifying password:", error);
      if (isAxiosError(error) && error.response?.status === 403) {
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
        size="invisible"
        onVerify={(token) => tokenResolveRef.current?.(token)}
        onError={(errorCode) => tokenRejectRef.current?.(errorCode)}
        onExpire={() => tokenRejectRef.current?.("Token expired")}
        style={{ display: "none" }}
      />
    </>
  );
};

export default CodeView;
