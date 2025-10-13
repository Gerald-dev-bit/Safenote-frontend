// src/Privacy.tsx
import { useEffect } from "react";

const Privacy = () => {
  useEffect(() => {
    document.title = "Safenote Privacy";
  }, []);

  return (
    <div className="app-container">
      <div className="top-bar" style={{ justifyContent: "center" }}>
        <div className="logo">Safenote</div>
      </div>
      <div className="static-page-content">
        <h2>Privacy Policy</h2>
        <p>
          This Privacy Policy governs the manner in which Safenote collects,
          uses, maintains and discloses information collected from users (each,
          a "User") of the https://safenote.xyz website ("Site"). This privacy
          policy applies to the Site and all products and services offered by
          Safenote.
        </p>
        <h3>Personal Identification Information</h3>
        <p>
          We may collect personal identification information from Users in a
          variety of ways, including, but not limited to, when Users visit our
          site, fill out a form, and in connection with other activities,
          services, features or resources we make available on our Site. Users
          may visit our Site anonymously. We will collect personal
          identification information from Users ONLY if they voluntarily submit
          such information to us. Users can always refuse to supply personally
          identification information, except that it may prevent them from
          engaging in certain Site related activities.
        </p>
        <p>
          Welcome to SafeNote.xyz, your trusted platform for secure note-taking.
          We are committed to protecting your privacy and ensuring that your
          personal information remains safe. This Privacy Policy explains how we
          collect, use, and safeguard your data when you visit or use our
          website. By accessing SafeNote.xyz, you agree to the practices
          described here. We value your trust and strive to maintain the highest
          standards of data protection.
        </p>
        <p>
          SafeNote.xyz is a user-friendly website designed for creating,
          storing, and managing personal notes in a secure environment. Our
          primary focus is on privacy, allowing you to jot down ideas,
          reminders, and thoughts without worry. We do not require extensive
          personal details to use our services, emphasizing minimal data
          collection to enhance your security. Whether you are a student
          organizing study materials, a professional tracking project ideas, or
          someone simply capturing daily reflections, our platform is built to
          support you while prioritizing confidentiality.
        </p>
        <p>
          We collect only essential information to provide our services
          effectively. When you create an account, we may gather your email
          address and username. This helps us verify your identity and
          facilitate access to your notes. Additionally, we store the notes you
          create, which are encrypted to prevent unauthorized access. We do not
          collect sensitive personal data such as payment information, location
          details, or browsing history beyond what is necessary for site
          functionality. For instance, we avoid tracking your IP address for
          marketing purposes and instead use it only for security monitoring to
          detect potential threats. Automatic data collection includes basic log
          files that record access times and device types, solely to improve
          site performance and troubleshoot issues. This minimal approach
          ensures that your interaction with SafeNote.xyz remains private and
          unintrusive.
        </p>
        <p>
          Our use of your data is limited and purposeful. We use your email for
          account-related communications, such as confirmation of registration
          or important updates about our services. Your notes remain private and
          are accessible only to you. We do not analyze, sell, or share your
          content for marketing or any other purposes. All data processing
          occurs solely to improve your experience on SafeNote.xyz, such as
          enhancing site performance and security features. For example,
          aggregated anonymous data might help us understand usage patterns to
          optimize loading speeds or introduce new features, but individual user
          information is never exposed in this process. We ensure that any
          internal access to data is restricted to authorized personnel who are
          bound by strict confidentiality agreements.
        </p>
        <h3>Non-personal Identification Information</h3>
        <p>
          We may collect non-personal identification information about Users
          whenever they interact with our Site. Non-personal identification
          information may include the browser name, the type of computer and
          technical information about Users means of connection to our Site,
          such as the operating system and the Internet service providers
          utilized and other similar information.
        </p>
        <p>
          Security is our top priority. We employ industry-standard encryption
          protocols to protect your notes and account information. Data is
          stored on secure servers with robust firewalls and access controls.
          Regular security audits ensure that vulnerabilities are addressed
          promptly. We implement measures like two-factor authentication options
          where available and continuous monitoring for suspicious activities.
          In the unlikely event of a security incident, we will take immediate
          steps to mitigate risks and notify affected users as required by law.
          Rest assured, we do not share your data with third parties,
          affiliates, or advertisers. Your information stays confidential and is
          never sold, rented, or disclosed without your explicit consent, except
          in cases mandated by legal obligations, such as responding to valid
          court orders or government requests. To further bolster security, we
          use secure socket layer technology for all data transmissions,
          ensuring that information in transit is encrypted and protected from
          interception.
        </p>
        <p>
          You have full control over your data. You can access, edit, or delete
          your notes and account at any time through our user interface. If you
          choose to delete your account, all associated data will be permanently
          removed from our systems within a reasonable timeframe, typically
          within 30 days to allow for any necessary backups to be purged. We
          respect your rights under applicable data protection laws, including
          the right to request information about your data, object to its
          processing, or request its portability. For users in regions like the
          European Union, we comply with the General Data Protection Regulation,
          providing mechanisms for data access requests and ensuring lawful
          bases for processing. If you have concerns about your data, our system
          allows easy export of notes for your records.
        </p>
        <p>
          We use cookies sparingly to enhance functionality, such as remembering
          your login session for convenience. These are essential cookies that
          do not track your behavior across other sites. You can manage cookie
          preferences through your browser settings, and we provide clear
          instructions on our site for doing so. Non-essential cookies are
          avoided to minimize any potential privacy risks.
        </p>
        <p>
          Children under 13 are not permitted to use SafeNote.xyz, and we do not
          knowingly collect data from them. If we discover such information, it
          will be deleted immediately. Parents or guardians who believe their
          child has provided data to us should inform us, and we will promptly
          address the issue.
        </p>
        <p>
          This Privacy Policy may be updated periodically to reflect changes in
          our practices or legal requirements. We encourage you to review it
          regularly. Your continued use of the site after updates signifies your
          acceptance. We will notify users of significant changes via email or
          prominent notices on the website to keep you informed.
        </p>
        <p>
          Thank you for choosing SafeNote.xyz. We are dedicated to keeping your
          notes safe and private, fostering an environment where you can express
          yourself freely without fear of data leaks or misuse.
        </p>
      </div>
    </div>
  );
};

export default Privacy;
