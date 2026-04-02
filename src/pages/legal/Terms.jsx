import { Link, useNavigate } from 'react-router-dom';
import { Scroll, ShieldCheck, CreditCard, Ban } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Legal.css';

export default function Terms() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAction = (e) => {
    if (!user) {
      e.preventDefault();
      navigate('/login');
    }
  };
  return (
    <div className="legal-page page-enter">
      <div className="legal-header">
        <div className="container">
          <Link to="/" className="legal-back">← Back to home</Link>
          <div className="legal-icon"><Scroll size={48} /></div>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-subtitle">Simple, readable terms for our community. Last updated: March 2024.</p>
        </div>
      </div>

      <div className="container legal-content">
        <section className="legal-section">
          <div className="section-head">
            <ShieldCheck className="section-icon" />
            <h2 className="section-title">1. Your Responsibilities</h2>
          </div>
          <p>By using My Morning, you agree to provide accurate information (phone, address) so we can deliver your healthy breakfast on time. You are responsible for keeping your account secure.</p>
        </section>

        <section className="legal-section">
          <div className="section-head">
            <Ban className="section-icon" />
            <h2 className="section-title">2. Usage Rules</h2>
          </div>
          <p>The platform should be used for ordering fresh meals only. Any misuse of promo codes, fake accounts, or harassing delivery partners will lead to immediate account suspension.</p>
        </section>

        <section className="legal-section">
          <div className="section-head">
            <CreditCard className="section-icon" />
            <h2 className="section-title">3. Order & Cancellation</h2>
          </div>
          <p>Orders can be cancelled through the app up to 8 hours before the delivery slot. Since our food is prepared fresh specifically for you, late cancellations may not be eligible for a refund.</p>
        </section>

        <section className="legal-section">
          <h2 className="section-title">4. Payment Terms</h2>
          <p>All payments are processed securely. We don't store your card details on our servers. Prices include GST wherever applicable.</p>
        </section>

        <section className="legal-section">
          <h2 className="section-title">5. Liability</h2>
          <p>While we strive for 100% accuracy and health standards, My Morning is not liable for indirect damages or delays caused by traffic or weather conditions beyond our control. However, we'll always try to make it right for you!</p>
        </section>

        <div className="legal-footer-box">
          <h3>Questions?</h3>
          <p>If you don't understand any of the above, feel free to contact us.</p>
          <Link to="/contact" className="btn-primary" onClick={handleAction}>Message Support</Link>
        </div>
      </div>
    </div>
  );
}
