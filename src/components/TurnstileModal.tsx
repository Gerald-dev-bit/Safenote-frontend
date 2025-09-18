import React, { useState, useEffect, useRef } from "react";

interface TurnstileModalProps {
  onVerify: () => void;
}

const TurnstileModal: React.FC<TurnstileModalProps> = ({ onVerify }) => {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const isRendered = useRef(false); // Flag to prevent multiple renders

  // Backend URL from env
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    if (isRendered.current || !widgetRef.current) return;

    const renderWidget = () => {
      if (widgetRef.current && window.turnstile && !widgetId.current) {
        try {
          widgetId.current = window.turnstile.render(widgetRef.current, {
            sitekey: import.meta.env.VITE_CF_TURNSTILE_SITEKEY,
            callback: (tk: string) => setToken(tk),
            "error-callback": (errorCode: string) => {
              console.warn("Turnstile error:", errorCode);
              if (errorCode === "400020") {
                setError(
                  "Invalid sitekey. Check your configuration and reload."
                );
              } else {
                setError("Verification failed. Please try again.");
              }
              // Reset on error to allow retry
              if (widgetId.current) {
                window.turnstile.reset(widgetId.current);
                widgetId.current = null;
              }
              setToken(null);
            },
            "expired-callback": () => {
              setToken(null);
              setError("Token expired. Please try again.");
            },
            theme: "light", // Matches app theme; can sync with dark mode if needed
            size: "normal",
          });
          isRendered.current = true;
        } catch (err) {
          console.error("Turnstile render error:", err);
          setError("Failed to load challenge. Please reload the page.");
        }
      }
    };

    // Wait for Turnstile to be ready
    if (window.turnstile) {
      renderWidget();
    } else {
      // Fallback: Poll or use ready if available
      const checkReady = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkReady);
          renderWidget();
        }
      }, 100);

      // Cleanup
      return () => clearInterval(checkReady);
    }
  }, []); // Empty deps: Run once on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
        isRendered.current = false;
      }
    };
  }, []);

  const handleVerify = async () => {
    if (!token) {
      setError("Please complete the challenge.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch(`${backendUrl}/api/notes/verify-turnstile`, {
        // Fixed: Added /notes
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        onVerify();
      } else {
        setError("Verification failed. Please try again.");
        if (window.turnstile && widgetId.current) {
          window.turnstile.reset(widgetId.current);
        }
        setToken(null);
      }
    } catch (err) {
      console.error("Verification network error:", err);
      let userError =
        "Network error. Please check your connection and try again.";
      if (err instanceof Error && err.message.includes("404")) {
        userError =
          "Endpoint not found. Ensure backend is running and routes are correct.";
      }
      setError(userError);
    }
    setIsLoading(false);
  };

  return (
    <div className="turnstile-modal-overlay">
      <div className="turnstile-modal">
        <p>Making sure you're human...</p>
        <div ref={widgetRef} />
        {error && <p className="error-message">{error}</p>}
        <button onClick={handleVerify} disabled={!token || isLoading}>
          {isLoading ? "Verifying..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default TurnstileModal;
