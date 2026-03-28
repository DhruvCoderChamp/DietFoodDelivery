
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Smartphone, Banknote, ChevronRight, Lock, Shield } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Payment.css';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', icon: <Smartphone size={20} />, desc: 'Pay with PhonePe, GPay, Paytm & more' },
  { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard size={20} />, desc: 'Visa, Mastercard, RuPay accepted' },
  { id: 'cod', label: 'Cash on Delivery', icon: <Banknote size={20} />, desc: 'Pay when your order arrives' },
];

export default function Payment() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const deliveryFee = totalPrice >= 199 ? 0 : 30;
  const total = totalPrice + deliveryFee;

  const [method, setMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ num: '', expiry: '', cvv: '', name: '' });
  const [paying, setPaying] = useState(false);

  const formatCard = (v) => v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19);
  const formatExpiry = (v) => v.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      clearCart();
      const orderId = 'MM' + Math.random().toString(36).slice(2, 8).toUpperCase();
      sessionStorage.setItem('mm_order_id', orderId);
      navigate('/order-confirmation');
    }, 2500);
  };

  return (
    <div className="payment-page page-enter">
      <div className="payment-header">
        <div className="container">
          <div className="checkout-steps">
            <span className="step done">Cart</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>
            <span className="step done">Delivery</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>
            <span className="step active">Payment</span>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>
            <span className="step">Confirmed</span>
          </div>
          <h1 className="payment-title">Secure Payment</h1>
          <p className="payment-sub">
            <Lock size={12} style={{ display: 'inline', marginRight: 5 }} />
            256-bit SSL encrypted
          </p>
        </div>
      </div>

      <div className="container payment-content">
        <div className="payment-grid">
          <div className="payment-main">
            {/* Method Selection */}
            <div className="payment-section">
              <div className="payment-section-title">Select Payment Method</div>
              <div className="method-list">
                {PAYMENT_METHODS.map(m => (
                  <label key={m.id} className={`method-card ${method === m.id ? 'method-active' : ''}`}>
                    <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} hidden />
                    <div className="method-icon">{m.icon}</div>
                    <div className="method-info">
                      <div className="method-label">{m.label}</div>
                      <div className="method-desc">{m.desc}</div>
                    </div>
                    <div className={`method-check ${method === m.id ? 'checked' : ''}`}>{method === m.id ? '✓' : ''}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* UPI Input */}
            {method === 'upi' && (
              <div className="payment-section">
                <div className="payment-section-title">Enter UPI ID</div>
                <div className="upi-providers">
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(p => (
                    <div key={p} className="upi-provider">{p}</div>
                  ))}
                </div>
                <input
                  className="form-input"
                  placeholder="yourname@okaxis / yourname@ybl"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  id="upi-input"
                />
              </div>
            )}

            {/* Card Form */}
            {method === 'card' && (
              <div className="payment-section">
                <div className="payment-section-title">Card Details</div>
                <div className="card-form">
                  <div className="form-group">
                    <label className="form-label" htmlFor="card-num">Card Number</label>
                    <input id="card-num" className="form-input" placeholder="0000 0000 0000 0000" maxLength={19}
                      value={card.num} onChange={e => setCard(c => ({ ...c, num: formatCard(e.target.value) }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="card-name">Name on Card</label>
                    <input id="card-name" className="form-input" placeholder="As on card"
                      value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))} />
                  </div>
                  <div className="card-form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="card-expiry">Expiry</label>
                      <input id="card-expiry" className="form-input" placeholder="MM/YY" maxLength={5}
                        value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))} />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="card-cvv">CVV</label>
                      <input id="card-cvv" className="form-input" placeholder="•••" maxLength={3} type="password"
                        value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, '') }))} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* COD */}
            {method === 'cod' && (
              <div className="payment-section">
                <div className="cod-note">
                  <Banknote size={24} />
                  <div>
                    <div className="cod-note-title">Cash on Delivery</div>
                    <div className="cod-note-desc">Keep ₹{total} ready in exact change. Our delivery partner will collect at the door.</div>
                  </div>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              className={`pay-btn ${paying ? 'paying' : ''}`}
              onClick={handlePay}
              disabled={paying}
              id="pay-now-btn"
            >
              {paying ? (
                <><div className="spinner" style={{ width: 22, height: 22, borderTopColor: '#fff' }}></div> Processing...</>
              ) : (
                <><Lock size={16} /> Pay ₹{total} Securely</>
              )}
            </button>

            <div className="security-note">
              <Shield size={14} /> Your payment is 100% secure & encrypted by Razorpay
            </div>
          </div>

          {/* Summary */}
          <div className="payment-summary">
            <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 20 }}>Order Total</h3>
            <div className="preview-row"><span>Items ({items.length})</span><span>₹{totalPrice}</span></div>
            <div className="preview-row"><span>Delivery</span><span>{deliveryFee === 0 ? '🎉 FREE' : `₹${deliveryFee}`}</span></div>
            <div className="divider" style={{ margin: '16px 0' }}></div>
            <div className="preview-row preview-total" style={{ fontSize: 22 }}><span>Total</span><span>₹{total}</span></div>
            <div className="payment-trust">
              <div className="trust-item">✅ Fresh & Safe</div>
              <div className="trust-item">🔄 Easy Refund</div>
              <div className="trust-item">🏆 FSSAI Certified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
