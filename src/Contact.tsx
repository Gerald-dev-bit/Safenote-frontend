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
    <div
      style={{
        backgroundColor: "#f4f7fa",
        padding: "40px 20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
      <h2
        style={{
          color: "#333",
          fontSize: "29px",
          marginBottom: "10px",
          fontFamily: "'Tilt Neon', sans-serif",
          textAlign: "center",
        }}>
        <i
          style={{ marginRight: "8px", color: "#007bff" }}
          className="fas fa-envelope"></i>
        Contact Us
      </h2>
      <p
        style={{
          color: "#535151ff",
          fontSize: "16px",
          marginBottom: "30px",
          fontFamily: "'Poppins', sans-serif",
          textAlign: "center",
          maxWidth: "600px",
          fontWeight: 600,
        }}>
        We value your feedback and concerns. Please fill out the form below to
        get in touch with our team.
      </p>
      <form
        ref={form}
        onSubmit={sendEmail}
        style={{
          maxWidth: "600px",
          width: "100%",
          backgroundColor: "#fff",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}>
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#333",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "14px",
              fontWeight: 700,
            }}>
            Your Name
          </label>
          <input
            type="text"
            name="user_name"
            placeholder="Enter your name"
            onFocus={() => setIsFocusedName(true)}
            onBlur={() => setIsFocusedName(false)}
            style={{
              width: "100%",
              padding: "12px",
              border: `1px solid ${isFocusedName ? "#007bff" : "#ddd"}`,
              borderRadius: "4px",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "14px",
              transition: "all 0.3s ease",
              transform: isFocusedName ? "scale(1.02)" : "scale(1)",
              boxShadow: isFocusedName ? "0 0 8px rgba(0,123,255,0.2)" : "none",
            }}
            required
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#333",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "14px",
              fontWeight: 700,
            }}>
            Your Email
          </label>
          <input
            type="email"
            name="user_email"
            placeholder="Enter your email"
            onFocus={() => setIsFocusedEmail(true)}
            onBlur={() => setIsFocusedEmail(false)}
            style={{
              width: "100%",
              padding: "12px",
              border: `1px solid ${isFocusedEmail ? "#007bff" : "#ddd"}`,
              borderRadius: "4px",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "14px",
              transition: "all 0.3s ease",
              transform: isFocusedEmail ? "scale(1.02)" : "scale(1)",
              boxShadow: isFocusedEmail
                ? "0 0 8px rgba(0,123,255,0.2)"
                : "none",
            }}
            required
          />
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#333",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "14px",
              fontWeight: 700,
            }}>
            Reason for Contact
          </label>
          <select
            name="reason"
            onFocus={() => setIsFocusedReason(true)}
            onBlur={() => setIsFocusedReason(false)}
            style={{
              width: "100%",
              padding: "12px",
              border: `1px solid ${isFocusedReason ? "#007bff" : "#ddd"}`,
              borderRadius: "4px",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "14px",
              transition: "all 0.3s ease",
              transform: isFocusedReason ? "scale(1.02)" : "scale(1)",
              boxShadow: isFocusedReason
                ? "0 0 8px rgba(0,123,255,0.2)"
                : "none",
              backgroundColor: "#fff",
            }}
            required>
            <option value="Questions">Questions</option>
            <option value="Feedback">Feedback</option>
            <option value="Support">Support</option>
          </select>
        </div>
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "#333",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "14px",
              fontWeight: 700,
            }}>
            Your Message
          </label>
          <textarea
            name="message"
            placeholder="Enter your message"
            onFocus={() => setIsFocusedMessage(true)}
            onBlur={() => setIsFocusedMessage(false)}
            style={{
              width: "100%",
              height: "150px",
              padding: "12px",
              border: `1px solid ${isFocusedMessage ? "#007bff" : "#ddd"}`,
              borderRadius: "4px",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "14px",
              transition: "all 0.3s ease",
              transform: isFocusedMessage ? "scale(1.02)" : "scale(1)",
              boxShadow: isFocusedMessage
                ? "0 0 8px rgba(0,123,255,0.2)"
                : "none",
            }}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "16px",
            fontWeight: 500,
            transition: "background-color 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#0056b3")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#007bff")
          }>
          SEND MESSAGE
        </button>
        {status && (
          <p
            style={{
              color: status.includes("Failed") ? "#dc3545" : "#28a745",
              textAlign: "center",
              marginTop: "15px",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "14px",
            }}>
            {status}
          </p>
        )}
      </form>
      <p
        style={{
          textAlign: "center",
          marginTop: "30px",
          color: "#777",
          fontSize: "14px",
          fontFamily: "'Poppins', sans-serif",
        }}>
        © Safenote | All Rights Reserved
      </p>
    </div>
  );
};

export default Contact;
