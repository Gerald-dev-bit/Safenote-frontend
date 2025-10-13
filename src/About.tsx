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
  const [showTurnstileModal, setShowTurnstileModal] = useState(false);
  const [isTurnstileVerified, setIsTurnstileVerified] = useState(false);
  const inactivityTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivityTime = useRef(Date.now());
  const wasOffline = useRef(false);
  const THIRTY_MINUTES = 30 * 60 * 1000;
  const ONE_HOUR = 60 * 60 * 1000;
  // Check if verification is needed (timestamp expired)
  const needsVerification = () => {
    const lastVerified = localStorage.getItem("turnstileLastVerified");
    return !lastVerified || Date.now() - parseInt(lastVerified) > ONE_HOUR;
  };
  // Check IP change
  const checkIPChange = async () => {
    try {
      console.log("Checking IP change...");
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      const currentIP = data.ip;
      const verifiedIP = localStorage.getItem("verifiedIP");
      console.log("Current IP:", currentIP, "Verified IP:", verifiedIP);
      if (verifiedIP && currentIP !== verifiedIP) {
        console.log("IP changed, triggering verification");
        triggerVerification();
      } else {
        console.log("IP unchanged, no trigger");
      }
    } catch (err) {
      console.error("Failed to check IP:", err);
      // Fallback: Trigger on error for safety (e.g., VPN toggle)
      console.log("IP check failed - Triggering verification as fallback");
      triggerVerification();
    }
  };
  // Show modal if needed
  const triggerVerification = () => {
    console.log("triggerVerification called");
    if (needsVerification()) {
      console.log("Showing modal via trigger");
      setShowTurnstileModal(true);
      setIsTurnstileVerified(false);
    } else {
      console.log("Trigger: No need (timestamp OK)");
    }
  };
  // Reset inactivity timer
  const resetInactivityTimer = () => {
    console.log("Resetting inactivity timer");
    lastActivityTime.current = Date.now();
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
    inactivityTimer.current = setTimeout(() => {
      console.log("Inactivity timeout (30 min) - Checking IP and timestamp");
      checkIPChange();
      if (needsVerification()) {
        console.log("Timer triggered modal!");
        triggerVerification();
      } else {
        console.log("Timer: No need for verification");
      }
    }, THIRTY_MINUTES);
  };
  // Initial load/refresh check
  useEffect(() => {
    console.log("App useEffect: Checking initial verification...");
    const lastVerified = localStorage.getItem("turnstileLastVerified");
    console.log("LocalStorage lastVerified:", lastVerified);

    // TEMP FORCE-TRIGGER FOR TESTING: Always show on load (remove in prod)
    const forceShowForDev = false; // Set to false when done testing
    if (forceShowForDev || needsVerification()) {
      console.log("needsVerification (or force) true - Triggering modal!");
      setShowTurnstileModal(true);
      setIsTurnstileVerified(false);
    } else {
      console.log("needsVerification false - Skipping modal, starting timer");
      setIsTurnstileVerified(true);
      resetInactivityTimer(); // Start inactivity tracking
    }
    // Activity listeners
    const events = ["mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer, true)
    );
    // Network listeners
    const handleOffline = () => {
      wasOffline.current = true;
    };
    const handleOnline = async () => {
      if (wasOffline.current) {
        await checkIPChange();
        if (needsVerification()) {
          triggerVerification();
        }
      }
      wasOffline.current = false;
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    // Page visibility (pause timer if tab inactive)
    const handleVisibilityChange = async () => {
      if (!document.hidden) {
        // Page became visible: Check if inactivity exceeded during hidden
        if (Date.now() - lastActivityTime.current > THIRTY_MINUTES) {
          await checkIPChange();
          if (needsVerification()) {
            triggerVerification();
          } else {
            resetInactivityTimer();
          }
        } else {
          resetInactivityTimer();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Initial timer setup
    resetInactivityTimer();
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
  const handleTurnstileVerify = async () => {
    localStorage.setItem("turnstileLastVerified", Date.now().toString());
    // Fetch and store current IP
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      localStorage.setItem("verifiedIP", data.ip);
    } catch (err) {
      console.error("Failed to fetch IP:", err);
    }
    setShowTurnstileModal(false);
    setIsTurnstileVerified(true);
    resetInactivityTimer(); // Reset inactivity after verification
    wasOffline.current = false; // Reset network flag
  };
  return (
    <>
      {showTurnstileModal && (
        <TurnstileModal onVerify={handleTurnstileVerify} />
      )}
      <Routes>
        <Route
          path="/:noteId"
          element={<NotepadWrapper isTurnstileVerified={isTurnstileVerified} />}
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
    </>
  );
}
export default App;
