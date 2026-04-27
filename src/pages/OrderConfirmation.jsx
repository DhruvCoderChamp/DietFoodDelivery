
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, MapPin, ShoppingBag, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import './OrderConfirmation.css';

const STEPS = [
  { key: 'In Progress', label: 'In Progress', icon: '⏳' },
  { key: 'Confirmed', label: 'Confirmed', icon: '✅' },
  { key: 'Delivered', label: 'Delivered', icon: '🏠' },
];

const STATUS_MESSAGES = {
  'In Progress': 'Your order request has been sent! We will review and confirm it shortly.',
  'Confirmed': 'Your order has been confirmed and is being processed.',
  'Denied': 'Oh no! Our kitchen is temporarily running at full capacity and we unfortunately cannot prepare your meal right now. 😔 Please try ordering again in a bit!',
  'Delivered': 'Your order has been delivered. Enjoy your meal! 🎉',
};

export default function OrderConfirmation() {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const orderId = sessionStorage.getItem('mm_order_id');
  const checkoutData = JSON.parse(sessionStorage.getItem('mm_checkout') || '{}');
  const { form = {}, total = 0 } = checkoutData;

  const [liveStatus, setLiveStatus] = useState(null);
  const [lastChecked, setLastChecked] = useState(new Date());
  const [checking, setChecking] = useState(false);

  const fetchStatus = async () => {
    if (!orderId) return;
    setChecking(true);
    try {
      const res = await authFetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const myOrder = await res.json();
        setLiveStatus(myOrder.status);
      }
    } catch (err) { console.error('Failed to fetch status', err); }
    setLastChecked(new Date());
    setChecking(false);
  };

  // Poll for status updates every 10 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto redirect to orders history card view when finalized after giving them 7s to read the catchy message
  useEffect(() => {
    if (liveStatus === 'Delivered' || liveStatus === 'Denied') {
      const t = setTimeout(() => navigate('/orders'), 7000);
      return () => clearTimeout(t);
    }
  }, [liveStatus, navigate]);

  const currentStepIndex = STEPS.findIndex(s => s.key === liveStatus);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  if (!liveStatus) return (
    <div className="empty-state" style={{ minHeight: '80vh' }}>
      <RefreshCw className="spin" size={40} color="var(--green-main)" />
      <p>Synchronizing with kitchen...</p>
    </div>
  );

  return (
    <div className="confirmation-page page-enter">
      <div className={`confirmation-hero ${liveStatus === 'Denied' ? 'denied-theme' : ''}`} style={liveStatus === 'Denied' ? { background: '#fdf2f2', borderBottom: '1px solid #f8d7da' } : {}}>
        <div className={liveStatus === 'Denied' ? 'error-anim' : 'success-anim'}>
          {liveStatus === 'Denied' ? (
            <XCircle size={72} strokeWidth={1.5} color="#e74c3c" />
          ) : (
            <CheckCircle size={72} strokeWidth={1.5} color="#27ae60" />
          )}
        </div>
        <h1 className="confirmation-title" style={liveStatus === 'Denied' ? { color: '#c0392b' } : {}}>
          {liveStatus === 'Delivered' ? 'Order Delivered! 🎉' : liveStatus === 'Denied' ? 'Order Unavailable' : liveStatus === 'In Progress' ? 'Order Sent' : 'Order Confirmed! 🎉'}
        </h1>
        <p className="confirmation-sub" style={liveStatus === 'Denied' ? { color: '#e74c3c', maxWidth: '400px', margin: '15px auto 0', lineHeight: 1.5, fontWeight: 500 } : {}}>
          {STATUS_MESSAGES[liveStatus] || 'Your healthy breakfast is on the way!'}
        </p>
        <div className="order-id-pill" style={liveStatus === 'Denied' ? { background: '#f2dede', color: '#c0392b' } : {}}>
          Order ID: <strong>{orderId}</strong>
        </div>
      </div>

      <div className="container confirmation-content">
        <div className="confirmation-grid">
          <div className="confirmation-main">
            {/* Live Status Tracker */}
            <div className="conf-card">
              <div className="conf-card-title" style={{ justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>📍 Live Order Tracker</span>
                <button 
                  onClick={fetchStatus} 
                  disabled={checking}
                  style={{ 
                    background: 'none', border: '1.5px solid var(--border)', borderRadius: 8, 
                    padding: '6px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', transition: 'all 0.2s'
                  }}
                >
                  <RefreshCw size={13} className={checking ? 'spin-icon' : ''} /> Refresh
                </button>
              </div>
              
              {/* Live Status Badge */}
              <div className="live-status-banner" data-status={liveStatus}>
                <div className="live-dot"></div>
                <span className="live-status-text">{liveStatus}</span>
                <span className="live-time">Updated {lastChecked.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>


              {/* Tracker only shows if not denied */}
              {liveStatus !== 'Denied' && (
                <div className="tracker">
                  {STEPS.map((step, i) => {
                    const isDone = i <= currentStepIndex;
                    const isActive = i === currentStepIndex;
                    return (
                      <div className={`tracker-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`} key={i}>
                        <div className={`tracker-icon ${isActive ? 'pulse-icon' : ''}`}>{step.icon}</div>
                        <div className="tracker-label">{step.label}</div>
                        {i < STEPS.length - 1 && <div className={`tracker-line ${isDone && i < currentStepIndex ? 'done' : ''}`}></div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

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
                  <span className="conf-key">Current Status</span>
                  <span className="status-pill" data-status={liveStatus}>{liveStatus}</span>
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
                    <span className="conf-val" style={{ whiteSpace: 'pre-wrap', maxWidth: 300 }}>{form.address}</span>
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
          </div>

          {/* Side Panel */}
          <div className="confirmation-side">
            <div className="conf-card message-card">
              <img src={logoImg} alt="brand" style={{ width: 44, height: 44, borderRadius: 10, margin: '0 auto 16px', display: 'block' }} />
              <h3 className="message-title">
                {liveStatus === 'Delivered' ? 'Enjoy your meal!' : 'Your healthy breakfast is on the way!'}
              </h3>
              <p className="message-body">
                {STATUS_MESSAGES[liveStatus]}
              </p>
              {total > 0 && (
                <div className="message-total">
                  Order Total: <strong>₹{total}</strong>
                </div>
              )}
            </div>

            <div className="conf-actions">
              <Link to="/menu" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '15px' }}>
                <ShoppingBag size={16} /> Order Again
              </Link>
              <Link to="/orders" className="btn-outline" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}>
                View Order History
              </Link>
            </div>

            <div className="conf-card" style={{ padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-mid)', marginBottom: 8 }}>Need Help?</div>
              <a href="tel:+919187532042" className="help-link">📞 +91 91875 32042 (Vivek)</a>
              <a href="tel:+919187542042" className="help-link">📞 +91 91875 42042 (Thejesh)</a>
              <a href="mailto:mymorningblr@gmail.com" className="help-link">✉️ mymorningblr@gmail.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
