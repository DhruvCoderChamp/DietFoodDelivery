
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, ShoppingBag } from 'lucide-react';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  const orderId = sessionStorage.getItem('mm_order_id') || 'MM' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const checkoutData = JSON.parse(sessionStorage.getItem('mm_checkout') || '{}');
  const { form = {}, total = 0 } = checkoutData;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="confirmation-page page-enter">
      <div className="confirmation-hero">
        <div className="success-anim">
          <CheckCircle size={72} strokeWidth={1.5} />
        </div>
        <h1 className="confirmation-title">Order Confirmed! 🎉</h1>
        <p className="confirmation-sub">Your healthy breakfast is on the way!</p>
        <div className="order-id-pill">Order ID: <strong>{orderId}</strong></div>
      </div>

      <div className="container confirmation-content">
        <div className="confirmation-grid">
          <div className="confirmation-main">
            {/* Delivery Info */}
            <div className="conf-card">
              <div className="conf-card-title">
                <Clock size={18} /> Delivery Information
              </div>
              <div className="conf-rows">
                <div className="conf-row">
                  <span className="conf-key">Delivery Date</span>
                  <span className="conf-val">{dateStr}</span>
                </div>
                <div className="conf-row">
                  <span className="conf-key">Time Slot</span>
                  <span className="conf-val conf-highlight">7:00 AM – 8:00 AM 🌅</span>
                </div>
                <div className="conf-row">
                  <span className="conf-key">Status</span>
                  <span className="status-pill">Preparing</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {form.name && (
              <div className="conf-card">
                <div className="conf-card-title">
                  <MapPin size={18} /> Delivery Address
                </div>
                <div className="conf-rows">
                  <div className="conf-row">
                    <span className="conf-key">Name</span>
                    <span className="conf-val">{form.name}</span>
                  </div>
                  <div className="conf-row">
                    <span className="conf-key">Phone</span>
                    <span className="conf-val">{form.phone}</span>
                  </div>
                  <div className="conf-row">
                    <span className="conf-key">Address</span>
                    <span className="conf-val">{form.address}</span>
                  </div>
                  {form.area && (
                    <div className="conf-row">
                      <span className="conf-key">Area</span>
                      <span className="conf-val">{form.area}, Bangalore</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tracker */}
            <div className="conf-card">
              <div className="conf-card-title">📍 Order Tracker</div>
              <div className="tracker">
                {[
                  { label: 'Order Placed', icon: '✅', done: true },
                  { label: 'Being Prepared', icon: '👨‍🍳', done: true },
                  { label: 'Out for Delivery', icon: '🛵', done: false },
                  { label: 'Delivered', icon: '🏠', done: false },
                ].map((step, i) => (
                  <div className={`tracker-step ${step.done ? 'done' : ''}`} key={i}>
                    <div className="tracker-icon">{step.icon}</div>
                    <div className="tracker-label">{step.label}</div>
                    {i < 3 && <div className={`tracker-line ${step.done ? 'done' : ''}`}></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side Panel */}
          <div className="confirmation-side">
            <div className="conf-card message-card">
              <div className="message-emoji">🥗</div>
              <h3 className="message-title">Your healthy breakfast is on the way!</h3>
              <p className="message-body">
                Our chefs are preparing your fresh, nutritious meal right now.
                Expect delivery tomorrow morning between <strong>7-8 AM</strong>.
              </p>
              {total > 0 && (
                <div className="message-total">
                  Total Paid: <strong>₹{total}</strong>
                </div>
              )}
            </div>

            <div className="conf-actions">
              <Link to="/menu" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '15px' }}>
                <ShoppingBag size={16} /> Order Again
              </Link>
              <Link to="/" className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                Back to Home
              </Link>
            </div>

            <div className="conf-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 8 }}>Need Help?</div>
              <a href="tel:+918012345678" className="help-link">📞 +91 80 1234 5678</a>
              <a href="mailto:hello@mymorning.in" className="help-link">✉️ hello@mymorning.in</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
