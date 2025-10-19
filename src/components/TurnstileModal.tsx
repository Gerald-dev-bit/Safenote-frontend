//src/components/TurnstileModal.tsx
import React, { useState, useEffect, useRef } from "react";
interface TurnstileModalProps {
  onVerify: () => void;
}
const TurnstileModal: React.FC<TurnstileModalProps> = ({ onVerify }) => {
  const [isLoading, setIsLoading] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Backend URL from env
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const handleBackendVerify = async (tk: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/notes/verify-turnstile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tk }),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        onVerify(); // Immediately close on success
      } else {
        throw new Error("Backend verification failed");
      }
    } catch (err) {
      // On backend error, reset and re-render
      resetAndRender();
    } finally {
      setIsLoading(false);
    }
  };
  const resetAndRender = () => {
    if (widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      window.turnstile.remove(widgetId.current);
    }
    widgetId.current = null;
    setIsLoading(true);
    renderWidget();
  };
  const renderWidget = () => {
    if (widgetRef.current && window.turnstile && !widgetId.current) {
      try {
        widgetId.current = window.turnstile.render(widgetRef.current, {
          sitekey: import.meta.env.VITE_CF_TURNSTILE_SITEKEY,
          callback: (tk: string) => {
            handleBackendVerify(tk);
          },
          "error-callback": () => {
            setIsLoading(false);
            resetAndRender();
          },
          "expired-callback": () => {
            setIsLoading(false);
            resetAndRender();
          },
          theme: "dark",
          size: "normal",
          appearance: "always",
        });
        // Set loading false immediately after render (widget is now visible)
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        resetAndRender();
      }
    }
  };
  useEffect(() => {
    // Wait for Turnstile to be ready (preloaded in head), then render immediately
    const init = () => {
      renderWidget();
    };
    if (window.turnstile) {
      init();
    } else {
      // Fallback poll if somehow not ready (rare with preload)
      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          init();
        }
      }, 50);
      // Max wait 5s
      const timeout = setTimeout(() => {
        clearInterval(checkInterval);
        setIsLoading(false);
        resetAndRender();
      }, 5000);
      return () => {
        clearInterval(checkInterval);
        clearTimeout(timeout);
      };
    }
  }, []);
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, []);
  const message = "Verify you are human by completing the action below.";
  const cloudflareLogoSrc =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgODQuOTUzIiB3aWR0aD0iMjU2IiBoZWlnaHQ9Ijg1Ij48cGF0aCBkPSJNMjUzLjgyNyA2OS4xMDNhMi4xNiAyLjE2IDAgMCAxLTIuMTczLTIuMTczYzAtMS4xNzUuOTYyLTIuMTczIDIuMTczLTIuMTczIDEuMTc1IDAgMi4xNzMuOTYyIDIuMTczIDIuMTczYTIuMjEgMi4yMSAwIDAgMS0yLjE3MyAyLjE3M20wLTMuOTE4YTEuNzUgMS43NSAwIDAgMC0xLjc0NSAxLjc0NSAxLjc1IDEuNzUgMCAwIDAgMS43NDUgMS43NDUgMS43NSAxLjc1IDAgMCAwIDEuNzQ1LTEuNzQ1IDEuNzUgMS43NSAwIDAgMC0xLjc0NS0xLjc0NW0xLjEwNCAyLjg4NWgtLjVsLS40MjctLjgyaC0uNTd2LjgyaC0uNDYzdi0yLjM4N2gxLjE0Yy41IDAgLjgyLjMyLjgyLjc4NGEuNzQuNzQgMCAwIDEtLjQ5OS43MTJsLjUuOXptLS44NTUtMS4yNDdjLjE3OCAwIC4zNTYtLjEwNy4zNTYtLjM1NiAwLS4yODUtLjE0Mi0uMzU2LS4zNTYtLjM1NmgtLjcxMnYuNzIyaC43MTJ6TTQyLjY3MyA4NC41MjZoLTE1LjJWNjQuNTQzaDUuNTU3djE1LjEzOGg5LjY1M3ptNS43MzUtOS45Mzh2LS4wN2MwLTUuNzM1IDQuNjMtMTAuNCAxMC43OTMtMTAuNHMxMC43MjIgNC41OTUgMTAuNzIyIDEwLjMzdi4wN2MwIDUuNzM1LTQuNjMgMTAuNC0xMC43OTMgMTAuNHMtMTAuNzIyLTQuNTk1LTEwLjcyMi0xMC4zM20xNS44ODYgMHYtLjA3YzAtMi44ODUtMi4wNjYtNS4zOC01LjEzLTUuMzgtMy4wMjggMC01LjA1OCAyLjQ1OC01LjA1OCA1LjM0M3YuMDdjMCAyLjg4NSAyLjA2NiA1LjM4IDUuMDk0IDUuMzggMy4wNjMgMCA1LjA5NC0yLjQ1OCA1LjA5NC01LjM0M20xMi40MyAxLjE3NXYtMTEuMjJoNS42Mjh2MTEuMTEzYzAgMi44ODUgMS40NiA0LjI0IDMuNjcgNC4yNHMzLjY3LTEuMzE4IDMuNjctNC4wOTZWNjQuNTQzaDUuNjI4Vjc1LjYyYzAgNi40NDctMy42NyA5LjI2LTkuMzY4IDkuMjYtNS42NjQgMC05LjIyNi0yLjg1LTkuMjI2LTkuMTJtMjcuMDctMTEuMjJoNy42OTRjNy4xMjQgMCAxMS4yOTIgNC4wOTYgMTEuMjkyIDkuODY3di4wN2MwIDUuNzctNC4yMDMgMTAuMDQ1LTExLjM5OCAxMC4wNDVoLTcuNTg3VjY0LjU0M3ptNy44IDE1LjA2N2MzLjMxMyAwIDUuNTItMS44MTcgNS41Mi01LjA1OHYtLjA3YzAtMy4yMDYtMi4yMDgtNS4wNTgtNS41Mi01LjA1OGgtMi4yNDR2MTAuMTUyaDIuMjQ0em0yNC43NTYtNi44MDNoOS40NzV2NC41OTVoLTkuNDc1djcuMTI0aC01LjUyVjY0LjU0M2gxNS45OTN2NC44NDRoLTEwLjQ3MnptMzMuMzc2IDExLjcyaC0xNS4yVjY0LjU0M2g1LjUydjE1LjEzOGg5LjY5ek0xODQuMTkgNjQuNGg1LjM0M2w4LjUxMyAyMC4xMjVoLTUuOTVsLTEuNDYtMy41NjJoLTcuNjk0bC0xLjQyNSAzLjU2MmgtNS44MDZMMTg0LjE5IDY0LjR6bTQuODggMTIuMjUzTDE4Ni44NjIgNzFsLTIuMjQ0IDUuNjY0aDQuNDUyem0xNi4xLTEyLjExaDkuNDRjMy4wNjMgMCA1LjE2NS43ODQgNi41MTggMi4xNzMgMS4xNzUgMS4xNCAxLjc4IDIuNjcgMS43OCA0LjY2NnYuMDdjMCAzLjA2My0xLjY0IDUuMDk0LTQuMDk2IDYuMTI3bDQuNzczIDYuOTgyaC02LjQxMmwtNC4wMjUtNi4wNTVoLTIuNDIydjYuMDU1aC01LjU1N1Y2NC41NDN6bTkuMiA5LjU4MmMxLjg4OCAwIDIuOTU2LS45MjYgMi45NTYtMi4zNXYtLjA3YzAtMS41NjctMS4xNC0yLjM1LTIuOTkyLTIuMzVoLTMuNjMzdjQuNzczaDMuNjd6bTIyLjAxMy0xLjg1Mmg5LjU4MnY0LjM4aC05LjU4MnYzLjE3aDEwLjcyMnY0LjcwMmgtMTYuMjA3VjY0LjU0M2gxNi4wNjV2NC43MDJoLTEwLjU4ek0xNS4zNTIgNzYuOTRjLS43ODQgMS43NDUtMi40MjIgMi45OTItNC41NiAyLjk5Mi0zLjAyOCAwLTUuMDk0LTIuNTMtNS4wOTQtNS4zOHYtLjA3YzAtMi44ODUgMi4wMy01LjM0MyA1LjA1OC01LjM0MyAyLjI4IDAgNC4wMjUgMS4zOSA0LjczNyAzLjMxM2g1Ljg0MmMtLjkyNi00Ljc3My01LjEzLTguMy0xMC41NDMtOC4zQzQuNjMgNjQuMTUgMCA2OC44MTggMCA3NC41NTJ2LjA3YzAgNS43MzUgNC41NiAxMC4zMyAxMC43MjIgMTAuMzMgNS4yNzIgMCA5LjQwNC0zLjQyIDEwLjQ3Mi03Ljk4bC01Ljg0Mi0uMDM2eiIgZmlsbD0iIzQwNDA0MSIvPjxwYXRoIGQ9Ik0xNTkuOTcgNTQuOTI2aDgwLjQzVjMyLjY2M2wtMTUuMjgtOC43NjItMi42MzYtMS4xNC02Mi41MTMuNDI3eiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0yMTIuNTggNTIuMDA1Yy43NDgtMi41NjUuNDYzLTQuOTE2LS43ODQtNi42Ni0xLjE0LTEuNjAzLTMuMDYzLTIuNTMtNS4zOC0yLjYzNmwtNDMuODQ4LS41N2EuODEuODEgMCAwIDEtLjY3Ny0uMzU2Yy0uMTQyLS4yMTQtLjE3OC0uNS0uMTA3LS43ODQuMTQyLS40MjcuNTctLjc0OCAxLjAzMy0uNzg0bDQ0LjI0LS41N2M1LjIzNi0uMjUgMTAuOTM1LTQuNDg4IDEyLjkzLTkuNjlsMi41My02LjZjLjEwNy0uMjg1LjE0Mi0uNTcuMDctLjg1NUMyMTkuNzQgOS42MTcgMjA4LjIzNCAwIDE5NC40ODUgMGMtMTIuNjggMC0yMy40MzggOC4xOTMtMjcuMjg1IDE5LjU1NS0yLjQ5My0xLjg1Mi01LjY2NC0yLjg1LTkuMDgzLTIuNTMtNi4wOS42MDYtMTAuOTcgNS40ODUtMTEuNTY2IDExLjU3Ni0uMTQyIDEuNTY3LS4wMzYgMy4xLjMyIDQuNTI0LTkuOTM4LjI4NS0xNy44OCA4LjQwNi0xNy44OCAxOC40MTUgMCAuOS4wNyAxLjc4LjE3OCAyLjY3LjA3LjQyNy40MjcuNzQ4Ljg1NS43NDhoODAuOTI4Yy40NjMgMCAuOS0uMzIgMS4wMzMtLjc4NGwuNjA2LTIuMTczeiIgZmlsbD0iI2YzODAyMCIvPjxwYXRoIGQ9Ik0yMjYuNTQzIDIzLjgzbC0xLjIxLjAzNmMtLjI4NSAwLS41MzQuMjE0LS42NC41bC0xLjcgNS45NWMtLjc0OCAyLjU2NS0uNDYzIDQuOTE2Ljc4NCA2LjY2IDEuMTQgMS42MDMgMy4wNjMgMi41MyA1LjM4IDIuNjM2bDkuMzMyLjU3YS44MS44MSAwIDAgMSAuNjc3LjM1NmMuMTQyLjIxNC4xNzguNTM0LjEwNy43ODQtLjE0Mi40MjctLjU3Ljc0OC0xLjAzMy43ODRsLTkuNzI0LjU3Yy01LjI3Mi4yNS0xMC45MzUgNC40ODgtMTIuOTMgOS42OWwtLjcxMiAxLjgxN2MtLjE0Mi4zNTYuMTA3LjcxMi41LjcxMmgzMy40MGMuMzkyIDAgLjc0OC0uMjUuODU1LS42NC41Ny0yLjA2Ni45LTQuMjQuOS02LjQ4MyAwLTEzLjE4LTEwLjc1Ny0yMy45MzctMjMuOTcyLTIzLjkzNyIgZmlsbD0iI2ZhYWU0MCIvPjwvc3ZnPg==";
  return (
    <div className="turnstile-modal-overlay">
      <div className="turnstile-modal">
        <div className="turnstile-header">
          <span className="turnstile-brand">safenote.xyz</span>
        </div>
        <p className="turnstile-message">{message}</p>
        <div className="turnstile-widget-area">
          <img
            src={cloudflareLogoSrc}
            alt="Cloudflare"
            className="turnstile-cloudflare-logo"
          />
          <div ref={widgetRef} />
        </div>
        <p className="turnstile-security-message">
          safenote.xyz needs to review the security of your connection before
          proceeding.
        </p>
        <div className="turnstile-footer-text">
          Performance & Security by{" "}
          <a
            href="https://www.cloudflare.com/?utm_source=challenge&utm_campaign=m"
            target="_blank"
            rel="noopener noreferrer">
            Cloudflare
          </a>
        </div>
        <div className="turnstile-footer"></div>
      </div>
    </div>
  );
};
export default TurnstileModal;
