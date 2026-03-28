
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, LocateFixed, Clock, User, Phone, Home, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Checkout.css';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const deliveryFee = totalPrice >= 199 ? 0 : 30;
  const total = totalPrice + deliveryFee;

  const [form, setForm] = useState({ name: '', phone: '', address: '', area: '', instructions: '' });
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});

  const detectLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // Simulate reverse geocoding
        setForm(f => ({ ...f, address: `Near Whitefield Metro, Bengaluru, Karnataka 560066`, area: 'Whitefield' }));
        setLocating(false);
      },
      () => {
        setForm(f => ({ ...f, address: 'Whitefield, Bengaluru, Karnataka 560066', area: 'Whitefield' }));
        setLocating(false);
      }
    );
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim() || !/^[6-9]\d{9}$/.test(form.phone)) e.phone = 'Valid 10-digit phone required';
    if (!form.address.trim()) e.address = 'Address is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Save order info to session
    sessionStorage.setItem('mm_checkout', JSON.stringify({ form, items, total, deliveryFee }));
    navigate('/payment');
  };

  return (
    <div className="checkout-page page-enter">
      <div className="checkout-header">
        <div className="container">
          <div className="checkout-steps">
            <span className="step done">Cart</span>
            <ChevronRight size={16} />
            <span className="step active">Delivery</span>
            <ChevronRight size={16} />
            <span className="step">Payment</span>
            <ChevronRight size={16} />
            <span className="step">Confirmed</span>
          </div>
          <h1 className="checkout-title">Delivery Details</h1>
        </div>
      </div>

      <div className="container checkout-content">
        <div className="checkout-grid">
          <form className="checkout-form" onSubmit={handleSubmit}>
            {/* GPS Detection */}
            <div className="gps-card">
              <div className="gps-card-icon"><MapPin size={22} /></div>
              <div>
                <div className="gps-card-title">Auto-Detect Location</div>
                <div className="gps-card-sub">Let us find your delivery address using GPS</div>
              </div>
              <button type="button" className="gps-btn" onClick={detectLocation} disabled={locating}>
                {locating ? <div className="spinner" style={{ width: 20, height: 20 }}></div> : <><LocateFixed size={14} /> Detect</>}
              </button>
            </div>

            <div className="form-section-label">👤 Personal Details</div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="checkout-name"><User size={13} /> Full Name</label>
                <input id="checkout-name" className={`form-input ${errors.name ? 'input-error' : ''}`} placeholder="Your full name"
                  value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="checkout-phone"><Phone size={13} /> Phone Number</label>
                <input id="checkout-phone" className={`form-input ${errors.phone ? 'input-error' : ''}`} placeholder="10-digit mobile number"
                  value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} maxLength={10} />
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-section-label"><Home size={13} style={{ display: 'inline' }} /> Delivery Address</div>
            <div className="form-group">
              <label className="form-label" htmlFor="checkout-address">Full Address</label>
              <textarea id="checkout-address" className={`form-input ${errors.address ? 'input-error' : ''}`}
                placeholder="Flat/House No., Building, Street Name"
                value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                rows={3} style={{ resize: 'vertical' }} />
              {errors.address && <span className="error-msg">{errors.address}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="checkout-area">Area</label>
              <select id="checkout-area" className="form-input" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
                <option value="">Select delivery area</option>
                {['Whitefield', 'Marathahalli', 'Bellandur', 'Sarjapur Road', 'HSR Layout', 'Koramangala', 'Indiranagar', 'Jayanagar'].map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="checkout-instructions">Delivery Instructions (Optional)</label>
              <input id="checkout-instructions" className="form-input" placeholder="e.g., Ring the bell, leave at door..."
                value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} />
            </div>

            {/* ETA */}
            <div className="eta-card">
              <Clock size={20} className="eta-icon" />
              <div>
                <div className="eta-title">Estimated Delivery Time</div>
                <div className="eta-time">Tomorrow, 7:00 AM – 8:00 AM</div>
                <div className="eta-sub">Fresh preparation starts at 5 AM 🌅</div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px', marginTop: 8 }}>
              Continue to Payment <ChevronRight size={18} />
            </button>
          </form>

          {/* Order Preview */}
          <div className="order-preview">
            <h3 className="preview-title">Order Summary</h3>
            <div className="preview-items">
              {items.map(item => (
                <div className="preview-item" key={item.id}>
                  <img src={item.image} alt={item.name} className="preview-item-img" />
                  <div className="preview-item-info">
                    <span className="preview-item-name">{item.name}</span>
                    <span className="preview-item-qty">× {item.quantity}</span>
                  </div>
                  <span className="preview-item-price">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="divider"></div>
            <div className="preview-row"><span>Subtotal</span><span>₹{totalPrice}</span></div>
            <div className="preview-row"><span>Delivery</span><span>{deliveryFee === 0 ? '🎉 FREE' : `₹${deliveryFee}`}</span></div>
            <div className="preview-row preview-total"><span>Total</span><span>₹{total}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
