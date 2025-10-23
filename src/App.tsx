//src/App.tsx
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import Notepad from "./components/Notepad";
import RawView from "./components/Rawview";
import MarkdownView from "./components/MarkDownView";
import CodeView from "./components/CodeView";
import Privacy from "./Privacy";
import Terms from "./Terms";
import Contact from "./Contact";
import About from "./About";
import TurnstileModal from "./components/TurnstileModal";
import { useEffect, useState, useRef } from "react";
function generateRandomId(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < length; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
function Home() {
  const navigate = useNavigate();
  useEffect(() => {
    const id = generateRandomId();
    navigate(`/${id}`);
  }, [navigate]);
  return null;
}
function NotepadWrapper({
  isTurnstileVerified,
}: {
  isTurnstileVerified: boolean;
}) {
  const { noteId: originalNoteId } = useParams<{ noteId: string }>();
  const noteId = originalNoteId?.toLowerCase() || "default";
  return <Notepad noteId={noteId} isTurnstileVerified={isTurnstileVerified} />;
}
function RawViewWrapper() {
  const { noteId: originalNoteId } = useParams<{ noteId: string }>();
  const noteId = originalNoteId?.toLowerCase() || "default";
  return <RawView noteId={noteId} />;
}
function MarkdownViewWrapper() {
  const { noteId: originalNoteId } = useParams<{ noteId: string }>();
  const noteId = originalNoteId?.toLowerCase() || "default";
  return <MarkdownView noteId={noteId} />;
}
function CodeViewWrapper() {
  const { noteId: originalNoteId } = useParams<{ noteId: string }>();
  const noteId = originalNoteId?.toLowerCase() || "default";
  return <CodeView noteId={noteId} />;
}
function App() {
  const THIRTEEN_HOURS = 13 * 60 * 60 * 1000; // Fix: Changed from 5 to 13 hours
  // Synchronous initial check for verification need
  const needsVerification = () => {
    const lastVerified = localStorage.getItem("turnstileLastVerified");
    return (
      !lastVerified || Date.now() - parseInt(lastVerified) > THIRTEEN_HOURS
    );
  };
  const initialVerified = !needsVerification();
  const [showTurnstileModal, setShowTurnstileModal] = useState(false);
  const [isTurnstileVerified, setIsTurnstileVerified] =
    useState(initialVerified);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivityTime = useRef(Date.now());
  const wasOffline = useRef(false);
  // Show modal if needed
  const triggerVerification = () => {
    setShowTurnstileModal(true);
    setIsTurnstileVerified(false);
  };
  // Reset inactivity timer
  const resetInactivityTimer = () => {
    lastActivityTime.current = Date.now();
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      triggerVerification();
    }, THIRTEEN_HOURS); // Fix: Updated to 13 hours
  };
  // Check traffic and decide on initial verification (with retry on fetch fail)
  const checkTrafficAndInit = async (retry = false) => {
    // Fix: Add retry param
    try {
      const response = await fetch(
        "https://api.safenote.xyz/api/notes/traffic-status"
      );
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const { high } = await response.json();
      if (high || needsVerification()) {
        triggerVerification();
      } else {
        setIsTurnstileVerified(true);
        resetInactivityTimer(); // Start inactivity tracking
      }
    } catch (error) {
      console.error("Traffic check failed:", error);
      if (!retry) {
        // Fix: Retry once on error
        setTimeout(() => checkTrafficAndInit(true), 500);
        return;
      }
      // Fallback: Assume low traffic, proceed as normal
      if (needsVerification()) {
        triggerVerification();
      } else {
        setIsTurnstileVerified(true);
        resetInactivityTimer();
      }
    }
  };
  // Initial load/refresh check (now includes traffic)
  useEffect(() => {
    // New: Force sync check for first visit (shows modal immediately if needed)
    if (needsVerification()) {
      triggerVerification();
    }
    checkTrafficAndInit(); // Async traffic check (overrides if high)
    // Activity listeners
    const events = ["mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer, true)
    );
    // Network listeners
    const handleOffline = () => {
      wasOffline.current = true;
    };
    const handleOnline = () => {
      if (wasOffline.current) {
        if (Date.now() - lastActivityTime.current > THIRTEEN_HOURS) {
          // Fix: 13 hours
          triggerVerification();
        }
      }
      wasOffline.current = false;
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    // Page visibility (pause timer if tab inactive)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Page became visible: Check if inactivity exceeded during hidden
        if (Date.now() - lastActivityTime.current > THIRTEEN_HOURS) {
          // Fix: 13 hours
          triggerVerification();
        } else {
          resetInactivityTimer();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Initial timer setup (only if not high traffic)
    if (!needsVerification()) {
      resetInactivityTimer();
    }
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
      events.forEach((event) =>
        window.removeEventListener(event, resetInactivityTimer, true)
      );
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);
  const handleTurnstileVerify = () => {
    localStorage.setItem("turnstileLastVerified", Date.now().toString());
    setShowTurnstileModal(false);
    setIsTurnstileVerified(true); // Fix: Already immediate; add optimistic unhide if needed
    resetInactivityTimer(); // Reset inactivity after verification
    wasOffline.current = false; // Reset network flag
  };
  return (
    <>
      {showTurnstileModal && (
        <TurnstileModal onVerify={handleTurnstileVerify} />
      )}
      {/* Hide app UI until verified (components still mount/fetch in parallel) */}
      <div style={{ display: isTurnstileVerified ? "block" : "none" }}>
        <Routes>
          <Route
            path="/:noteId"
            element={
              <NotepadWrapper isTurnstileVerified={isTurnstileVerified} />
            }
          />
          <Route path="/Raw/:noteId" element={<RawViewWrapper />} />
          <Route path="/Markdown/:noteId" element={<MarkdownViewWrapper />} />
          <Route path="/Code/:noteId" element={<CodeViewWrapper />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </>
  );
}
export default App;
