// src/App.tsx
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import Notepad from "./components/Notepad";
import RawView from "./components/Rawview";
import MarkdownView from "./components/MarkDownView";
import CodeView from "./components/CodeView";
import { useEffect } from "react";

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

function NotepadWrapper() {
  const { noteId: originalNoteId } = useParams<{ noteId: string }>();
  const noteId = originalNoteId?.toLowerCase() || "default";
  return <Notepad noteId={noteId} />;
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
  return (
    <Routes>
      <Route path="/:noteId" element={<NotepadWrapper />} />
      <Route path="/Raw/:noteId" element={<RawViewWrapper />} />
      <Route path="/Markdown/:noteId" element={<MarkdownViewWrapper />} />
      <Route path="/Code/:noteId" element={<CodeViewWrapper />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
