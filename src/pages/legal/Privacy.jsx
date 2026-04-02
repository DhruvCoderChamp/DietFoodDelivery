import { Link, useNavigate } from 'react-router-dom';
import { Lock, Eye, CheckCircle, Database } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Legal.css';

export default function Privacy() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleMailto = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
      return;
    }
    // Prevent default and use a robust trigger
    e.preventDefault();
    const mailtoUrl = "mailto:privacy@mymorning.in?subject=Privacy Query - My Morning";
    const tempLink = document.createElement('a');
    tempLink.href = mailtoUrl;
    tempLink.target = '_blank';
    tempLink.rel = 'noopener noreferrer';
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);
  };
  return (
    <div className="legal-page page-enter">
      <div className="legal-header">
        <div className="container">
          <Link to="/" className="legal-back">← Back to home</Link>
          <div className="legal-icon"><Lock size={48} /></div>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-subtitle">How we keep your data safe. Last updated: March 2024.</p>
        </div>
      </div>

      <div className="container legal-content">
        <section className="legal-section">
          <div className="section-head">
            <Database className="section-icon" />
            <h2 className="section-title">1. Information We Collect</h2>
          </div>
          <p>We only collect information necessary to deliver your breakfast: <strong>Phone number</strong> (for communication), <strong>Email</strong> (for receipts), and <strong>Location/Address</strong> (for delivery). We also collect your <strong>Name</strong> to personalize your experience.</p>
        </section>

        <section className="legal-section">
          <div className="section-head">
            <Eye className="section-icon" />
            <h2 className="section-title">2. Why We Collect Data</h2>
          </div>
          <p>We use your data for:
          <ul>
            <li>Processing and delivering your orders.</li>
            <li>Authentication (using Google or OTP).</li>
            <li>Sending important updates about your nutritious meal.</li>
          </ul>
          We don't sell your personal data to advertisers. Ever.</p>
        </section>

        <section className="legal-section">
          <div className="section-head">
            <CheckCircle className="section-icon" />
            <h2 className="section-title">3. Secure Storage</h2>
          </div>
          <p>Your data is stored in secure, encrypted cloud servers. All authentication is handled through Google (Firebase/OAuth) to ensure maximum safety. We use industry-standard encryption for all data transmissions.</p>
        </section>

        <section className="legal-section">
          <h2 className="section-title">4. Third-Party Partners</h2>
          <p>We use:
          <ul>
            <li><strong>Google Login:</strong> For easy account access.</li>
            <li><strong>Firebase:</strong> For secure authentication and hosting.</li>
            <li><strong>Payment Gateways:</strong> To process transactions securely.</li>
          </ul>
          </p>
        </section>

        <div className="legal-footer-box">
          <h3>Contact Privacy Team</h3>
          <p>If you have any questions about your data, let us know.</p>
          <button className="btn-primary" onClick={handleMailto}>Email Us</button>
        </div>
      </div>
    </div>
  );
}
