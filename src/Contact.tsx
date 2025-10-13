// src/Contact.tsx
import { useEffect, useRef, useState } from "react";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isFocusedName, setIsFocusedName] = useState(false);
  const [isFocusedEmail, setIsFocusedEmail] = useState(false);
  const [isFocusedReason, setIsFocusedReason] = useState(false);
  const [isFocusedMessage, setIsFocusedMessage] = useState(false);

  useEffect(() => {
    document.title = "Safenote - Contact Us";
  }, []);

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");

    if (form.current) {
      emailjs
        .sendForm(
          import.meta.env.VITE_EMAILJS_SERVICE_ID || "YOUR_SERVICE_ID",
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID || "YOUR_TEMPLATE_ID",
          form.current,
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY"
        )
        .then(
          () => {
            setStatus("Message sent successfully!");
            if (form.current) form.current.reset();
            setTimeout(() => setStatus(null), 3000);
          },
          (error) => {
            console.error("FAILED...", error.text);
            setStatus("Failed to send message. Please try again.");
            setTimeout(() => setStatus(null), 3000);
          }
        );
    }
  };

  return (
    <div className="contact-container">
      <h2 className="contact-title">
        <i className="fas fa-envelope"></i> Contact Us
      </h2>
      <p className="contact-subtitle">
        We value your feedback and concerns. Please fill out the form below to
        get in touch with our team.
      </p>
      <form ref={form} onSubmit={sendEmail} className="contact-form">
        <div className="form-group">
          <label className="form-label">Your Name</label>
          <input
            type="text"
            name="user_name"
            className={`form-input ${isFocusedName ? "focused" : ""}`}
            placeholder="Enter your name"
            onFocus={() => setIsFocusedName(true)}
            onBlur={() => setIsFocusedName(false)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Your Email</label>
          <input
            type="email"
            name="user_email"
            className={`form-input ${isFocusedEmail ? "focused" : ""}`}
            placeholder="Enter your email"
            onFocus={() => setIsFocusedEmail(true)}
            onBlur={() => setIsFocusedEmail(false)}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Reason for Contact</label>
          <select
            name="reason"
            className={`form-input ${isFocusedReason ? "focused" : ""}`}
            onFocus={() => setIsFocusedReason(true)}
            onBlur={() => setIsFocusedReason(false)}
            required>
            <option value="Questions">Questions</option>
            <option value="Feedback">Feedback</option>
            <option value="Support">Support</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Your Message</label>
          <textarea
            name="message"
            className={`form-input ${isFocusedMessage ? "focused" : ""}`}
            placeholder="Enter your message"
            onFocus={() => setIsFocusedMessage(true)}
            onBlur={() => setIsFocusedMessage(false)}
            required
          />
        </div>
        <button type="submit" className="submit-button">
          SEND MESSAGE
        </button>
        {status && (
          <p
            className={`status-message ${
              status.includes("Failed") ? "error" : "success"
            }`}>
            {status}
          </p>
        )}
      </form>
      <p className="contact-footer">© Safenote | All Rights Reserved</p>
    </div>
  );
};

export default Contact;
