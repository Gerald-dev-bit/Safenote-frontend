// src/Terms.tsx
import { useEffect } from "react";

const Terms = () => {
  useEffect(() => {
    document.title = "Safenote - Terms of Service";
  }, []);

  return (
    <div className="app-container">
      <div className="top-bar" style={{ justifyContent: "center" }}>
        <div className="logo">Safenote</div>
      </div>
      <div
        style={{
          padding: "20px 40px",
          fontFamily: "monospace",
          fontSize: "13px",
          color: "#cccccc",
          textAlign: "justify",
          maxWidth: "800px",
          margin: "0 auto",
          fontWeight: 600,
        }}>
        <h2 style={{ textAlign: "center" }}>Terms of Service</h2>
        <p>
          Welcome to SafeNote.xyz, your secure haven for note-taking. We
          appreciate your interest in our platform and are pleased to offer
          these Terms of Service to guide your use. By accessing or using
          SafeNote.xyz, you agree to comply with these terms. If you do not
          agree, please refrain from using our services. We aim to provide a
          positive experience for all users while maintaining a safe and
          respectful community.
        </p>
        <p>
          SafeNote.xyz allows you to create, store, and manage personal notes in
          a protected online space. Our goal is to offer a simple, reliable tool
          for your daily needs, whether for personal journaling, work
          organization, or creative brainstorming. To use our services, you must
          be at least 13 years old and capable of forming a binding agreement.
          Accounts are intended for individual use only, and sharing credentials
          is prohibited to ensure security.
        </p>
        <p>
          Creating an account requires a valid email address and a strong
          password. You are responsible for maintaining the confidentiality of
          your login credentials. If you forget your password, please note that
          we cannot recover it or provide a forgot password feature, as this
          enhances security by preventing unauthorized access attempts. In such
          cases, you may need to create a new account. We recommend using a
          password manager to keep track of your details safely and backing up
          important notes independently.
        </p>
        <p>
          You agree to use SafeNote.xyz lawfully and respectfully. Prohibited
          activities include uploading harmful content, attempting to breach
          security, or infringing on others' rights. This encompasses avoiding
          viruses, malware, or any material that could damage our systems or
          other users. We do not monitor your notes but reserve the right to
          suspend or terminate accounts that violate these terms, such as those
          involved in illegal activities, spam, harassment, or distribution of
          copyrighted material without permission. Violations may result in
          immediate account closure without prior notice, and we may cooperate
          with law enforcement if necessary.
        </p>
        <p>
          Your notes are your property, and we grant you a limited,
          non-exclusive license to use our platform for personal purposes. You
          must not reproduce, distribute, or commercialize our site content
          without permission. This includes scraping data, reverse engineering
          our software, or using automated tools to access the site excessively.
          We provide the services "as is" without warranties of any kind, and we
          are not liable for any data loss, interruptions, or indirect damages
          arising from your use. While we strive for high availability,
          occasional downtime for maintenance may occur, and we appreciate your
          understanding.
        </p>
        <p>
          You represent that all content you upload is original or properly
          licensed, and you indemnify us against any claims arising from your
          violations. We may modify or discontinue features at our discretion to
          improve the platform, with notices provided where feasible.
        </p>
        <p>
          We may update these Terms of Service from time to time. Changes will
          be posted on the site, and your continued use constitutes acceptance.
          If any provision is deemed invalid, the remaining terms remain in
          effect. These terms form the entire agreement between you and
          SafeNote.xyz, superseding any prior understandings.
        </p>
        <p>
          In the event of disputes, they will be resolved under the laws of the
          jurisdiction where SafeNote.xyz operates, without regard to conflict
          of laws principles. We encourage amicable resolutions, but if needed,
          disputes may be subject to arbitration or court proceedings as
          appropriate.
        </p>
        <p>
          Thank you for being part of SafeNote.xyz. We value your trust and look
          forward to serving you with a secure and efficient note-taking
          experience.
        </p>
        <h3>Copyright Notice</h3>
        <p>
          © 2025 Safenote. All rights reserved. All content, including text,
          graphics, logos, and software, on this website is the property of
          Safenote and protected by international copyright laws. Unauthorized
          copying, reproduction, distribution, or use of any material from this
          site is strictly prohibited and may result in legal action.
        </p>
        <p>
          <strong>Warning:</strong> Any individual or entity found copying,
          using, or reproducing any content from this website without explicit
          written permission will be subject to legal proceedings, including but
          not limited to claims for damages and injunctions.
        </p>
      </div>
    </div>
  );
};

export default Terms;
