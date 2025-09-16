// src/About.tsx
import { useEffect } from "react";

const About = () => {
  useEffect(() => {
    document.title = "Safenote - About Us";
  }, []);

  return (
    <div className="app-container">
      <div className="top-bar" style={{ justifyContent: "center" }}>
        <div className="logo">Safenote</div>
      </div>
      <div
        style={{
          padding: "20px 40px 60px",
          fontFamily: "monospace",
          fontSize: "14px",
          color: "#535151ff",
          textAlign: "justify",
          maxWidth: "1000px",
          margin: "0 auto",
          fontWeight: 600,
        }}>
        <h2 style={{ textAlign: "center" }}>About Us</h2>
        <p>
          Welcome to SafeNote.xyz, your ultimate destination for secure and
          effortless note-taking. Founded with a passion for privacy and
          simplicity, our platform empowers users to capture ideas, organize
          thoughts, and manage reminders in a protected digital space. Whether
          you're a student jotting down lecture notes, a professional tracking
          project details, or anyone in between, SafeNote.xyz offers intuitive
          tools to create, edit, and store notes seamlessly across devices.
        </p>
        <p>
          At the heart of SafeNote.xyz is an unwavering commitment to user
          safety. We prioritize your privacy by employing advanced encryption
          for all data, ensuring that your notes remain confidential and
          inaccessible to unauthorized parties. No personal information is
          shared, sold, or analyzed for marketing purposes—we collect only
          what's essential for account functionality. Our robust security
          measures, including regular audits and firewalls, protect against
          breaches, giving you peace of mind. Forget complicated setups; our
          user-friendly interface focuses on what matters: your content, safe
          and sound.
        </p>
        <p>
          Join thousands who trust SafeNote.xyz for a worry-free experience.
          We're dedicated to innovation while keeping security paramount,
          because your ideas deserve the best protection.
        </p>
      </div>
    </div>
  );
};

export default About;
