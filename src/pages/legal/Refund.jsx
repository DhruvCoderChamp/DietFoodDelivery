import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, RefreshCw, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Legal.css';

export default function Refund() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="legal-page page-enter">
      <div className="legal-header">
        <div className="container">
          <Link to="/" className="legal-back">← Back to home</Link>
          <div className="legal-icon"><RefreshCw size={48} /></div>
          <h1 className="legal-title">Refund & Refund Policy</h1>
          <p className="legal-subtitle">Our commitment to fair handling. Last updated: March 2024.</p>
        </div>
      </div>

      <div className="container legal-content">
        <section className="legal-section">
          <div className="section-head">
            <XCircle className="section-icon" />
            <h2 className="section-title">1. Cancellation Rules</h2>
          </div>
          <p>Since our healthy breakfast meals are prepared daily and made to order, you can cancel your order up to <strong>8 hours before the delivery slot</strong>. This allows us to avoid food waste and manage fresh ingredients efficiently.</p>
        </section>

        <section className="legal-section">
          <div className="section-head">
            <RefreshCw className="section-icon" />
            <h2 className="section-title">2. Refund Eligibility</h2>
          </div>
          <p>You'll receive a full refund if:
          <ul>
            <li>You cancel within the 8-hour window.</li>
            <li>We're unable to deliver your order for any reason.</li>
            <li>Your order is significantly delayed by over 60 minutes beyond the slot.</li>
          </ul>
          Damaged or incorrect items will be fully refunded or replaced immediately at no extra cost.</p>
        </section>

        <section className="legal-section">
          <div className="section-head">
            <CreditCard className="section-icon" />
            <h2 className="section-title">3. Payment & Processing</h2>
          </div>
          <p>Refunds are processed back to the <strong>original payment method</strong> (original card, UPI, or wallet). If the payment fails but money was deducted, our gateway usually reverses it within 2 hours. If it doesn't, contact us immediately.</p>
        </section>

        <section className="legal-section">
          <div className="section-head">
            <Clock className="section-icon" />
            <h2 className="section-title">4. Refund Timeline</h2>
          </div>
          <p>Once initiated, refunds typically take:
          <ul>
            <li><strong>24-48 hours:</strong> UPI & Wallets.</li>
            <li><strong>3-5 business days:</strong> Credit/Debit cards.</li>
          </ul>
          Wait for these times before raising a dispute with your bank.</p>
        </section>

        <div className="legal-footer-box">
          <h3>Need a Refund?</h3>
          <p>If you have an issue with your recent order, let us know and we'll help.</p>
          <button 
            className="btn-primary" 
            onClick={() => {
                const mailtoUrl = "mailto:refund@mymorning.in?subject=Refund Request - Order ID&body=Hi My Morning Team,%0D%0A%0D%0AI want to request a refund for my order.%0D%0AOrder ID: %0D%0AReason: ";
                const tempLink = document.createElement('a');
                tempLink.href = mailtoUrl;
                tempLink.style.display = 'none';
                document.body.appendChild(tempLink);
                tempLink.click();
                document.body.removeChild(tempLink);
            }}>
            Request Refund
          </button>
        </div>
      </div>
    </div>
  );
}
