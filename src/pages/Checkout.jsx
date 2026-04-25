
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, LocateFixed, Clock, User, Phone, Home, ChevronRight, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Checkout.css';

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, authFetch } = useAuth();
  const navigate = useNavigate();
  const deliveryFee = totalPrice >= 199 ? 0 : 30;
  const total = totalPrice + deliveryFee;

  const [form, setForm] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '', 
    address: '', 
    area: '', 
    instructions: '',
    timeSlot: ''
  });

  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState({});

  // Load saved address on mount
  useEffect(() => {
    const saved = localStorage.getItem('mm_saved_address');
    if (saved) {
      try {
        const savedForm = JSON.parse(saved);
        setForm(f => ({
          ...f,
          name: savedForm.name || f.name,
          phone: savedForm.phone || f.phone,
          address: savedForm.address || f.address,
          area: savedForm.area || f.area,
          instructions: savedForm.instructions || f.instructions
        }));
      } catch (e) { console.error('Failed to parse saved address', e); }
    }
  }, []);

  // Generate time slots minimum 3 hours from current time
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    
    // Minimum 3 hours buffer
    let startHour = currentHour + 3;
    
    // If it's already too late today, show tomorrow's slots
    if (startHour >= 22) {
      slots.push('Tomorrow 8:00 AM');
      slots.push('Tomorrow 9:00 AM');
      slots.push('Tomorrow 10:00 AM');
      return slots;
    }
    
    if (startHour < 6) startHour = 6;
    
    for (let hour = startHour; hour <= 21; hour++) {
      const displayHour = hour === 12 ? 12 : hour % 12;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      slots.push(`${displayHour}:00 ${ampm}`);
      slots.push(`${displayHour}:30 ${ampm}`);
    }
    
    if (slots.length > 0 && slots[slots.length-1] !== '10:00 PM') {
        slots.push('10:00 PM');
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  
  // Set default time slot if not selected
  useEffect(() => {
    if (!form.timeSlot && timeSlots.length > 0) {
      setForm(f => ({ ...f, timeSlot: timeSlots[0] }));
    }
  }, [timeSlots, form.timeSlot]);

  const detectLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const mapUrl = `https://maps.google.com/?q=${lat},${lng}`;
        let addressText = `[GPS Detected Location]\n👉 Map: ${mapUrl}`;

        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          let googleSuccess = false;

          if (apiKey) {
            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
            const data = await res.json();

            // Only proceed if API quota and credentials are OK
            if (data.status === 'OK' && data.results && data.results.length > 0) {
              let bestResult = data.results[0];
              const properAddress = data.results.find(r => 
                 !r.formatted_address.includes('+') && 
                 r.formatted_address.length > 15
              );
              if (properAddress) bestResult = properAddress;

              addressText = `${bestResult.formatted_address}\n\n👉 Google Map Pin: ${mapUrl}`;
              
              if (form.address && !form.address.includes('Map Pin')) {
                 addressText = `${form.address}, ${bestResult.formatted_address}\n\n👉 Google Map Pin: ${mapUrl}`;
              }
              googleSuccess = true;
            }
          } 
          
          // Fall back to Nominatim if API Key fails, is denied, or isn't set
          if (!googleSuccess) {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            if (res.ok) {
              const data = await res.json();
              if (data && data.address) {
                // Build a much cleaner, human-readable address from the raw components
                const { amenity, building, road, neighbourhood, suburb, postcode } = data.address;
                const cleanParts = [amenity, building, road, neighbourhood, suburb].filter(Boolean);
                
                // Only take the first 3 highly specific components to avoid giant strings
                let cleanAddress = cleanParts.slice(0, 3).join(', ');
                if (!cleanAddress && data.display_name) cleanAddress = data.display_name.split(',').slice(0, 3).join(', ');
                
                addressText = `${cleanAddress}${postcode ? ' - ' + postcode : ''}\n\n👉 Google Map Pin: ${mapUrl}`;
                
                if (form.address && !form.address.includes('Map Pin')) {
                   addressText = `${form.address}, ${addressText}`;
                }
              }
            }
          }
        } catch (err) { }

        setForm(f => ({ ...f, address: addressText }));
        setLocating(false);
      },
      (err) => {
        alert("Failed to get location! Please explicitly allow location permission in your browser popup.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // 1. Save order to Backend DB with real address + Google Maps link
    let savedOrderId = 'MM' + Math.random().toString(36).slice(2, 8).toUpperCase();
    try {
      const res = await authFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id,
          customerName: form.name,
          phone: form.phone,
          address: form.address,
          items: items.map(i => ({ productId: i.id, name: i.name, quantity: i.quantity, price: i.price, image: i.image })),
          totalAmount: total,
          timeSlot: form.timeSlot,
          status: 'In Progress'
        })
      });
      if (res.ok) {
        const savedOrder = await res.json();
        savedOrderId = savedOrder.orderId; // Use the REAL orderId from the database
      }
    } catch (err) { console.error('Failed to save order to DB', err); }

    // 2. Build WhatsApp message with full order details
    const itemLines = items.map(i => `• ${i.name} × ${i.quantity} — ₹${i.price * i.quantity}`).join('%0a');
    let pureAddress = form.address;
    let locationLink = '';
    
    // Extract map link if exists
    const mapMatch = form.address.match(/(https:\/\/maps\.google\.com\/\?q=[^\s]+)/);
    if (mapMatch) {
      locationLink = mapMatch[1];
      pureAddress = form.address
         .replace(/(\n\n👉 Google Map Pin: .*)|(\n👉 Map: .*)|(\[GPS Detected Location\]\n)/g, '');
    }
    
    pureAddress = pureAddress.replace(/\n/g, '%0a');

    let textLines = [
      `🌿 *New Order — My Morning*`,
      ``,
      `━━━━━━━━━━━━━━━`,
      ``,
      `🧾 *Order ID:* ${savedOrderId}`,
      ``,
      `👤 *Customer Details*`,
      `Name: ${form.name}  `,
      `Phone: ${form.phone}  `,
      ``,
      `📍 *Delivery Address*`,
      `${pureAddress}  `,
      form.area ? `Area: ${form.area}  ` : null,
      form.instructions ? `Note: ${form.instructions}  ` : null,
      ``,
      `🕒 *Delivery Slot:* ${form.timeSlot} ⚡`,
      `*(Guaranteed delivery within 30 mins)*`,
      ``,
      locationLink ? `📌 *Location:*  \n${locationLink}` : null,
      locationLink ? `` : null,
      `━━━━━━━━━━━━━━━`,
      ``,
      `🍱 *Order Summary*`,
      `${itemLines}`,
      ``,
      `💰 *Billing*`,
      `Subtotal: ₹${totalPrice}  `,
      `Delivery: ₹${deliveryFee}  `,
      `*Total: ₹${total}*  `,
      ``,
      `━━━━━━━━━━━━━━━`,
      ``,
      `🙏 Please confirm this order and share payment details.`,
      ``,
      `💚 *My Morning Team*`
    ];

    const text = textLines.filter(line => line !== null).join('%0a').replace(/\n/g, '%0a');

    window.open(`https://wa.me/919187532042?text=${text}`, '_blank');
    
    // Show confirmation
    alert("Order request sent successfully!");
    
    // 3. Save to localStorage + session + clear cart + redirect
    localStorage.setItem('mm_saved_address', JSON.stringify({
      name: form.name,
      phone: form.phone,
      address: form.address,
      area: form.area,
      instructions: form.instructions
    }));

    sessionStorage.setItem('mm_order_id', savedOrderId);
    sessionStorage.setItem('mm_checkout', JSON.stringify({ form, items, total, deliveryFee }));
    clearCart();
    navigate('/order-confirmation');
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
                  value={form.name} onChange={e => {
                    setForm(f => ({ ...f, name: e.target.value }));
                    if (errors.name) setErrors(prev => ({ ...prev, name: null }));
                  }} />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="checkout-phone"><Phone size={13} /> Phone Number</label>
                <input id="checkout-phone" className={`form-input ${errors.phone ? 'input-error' : ''}`} placeholder="10-digit mobile number"
                  value={form.phone} onChange={e => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm(f => ({ ...f, phone: val }));
                    if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                  }} />
                {errors.phone && <span className="error-msg">{errors.phone}</span>}
              </div>
            </div>

            <div className="form-section-label"><Home size={13} style={{ display: 'inline' }} /> Delivery Address</div>
            <div className="form-group">
              <label className="form-label" htmlFor="checkout-address">Full Address</label>
              <textarea id="checkout-address" className={`form-input ${errors.address ? 'input-error' : ''}`}
                placeholder="Flat/House No., Building, Street Name"
                value={form.address} onChange={e => {
                  setForm(f => ({ ...f, address: e.target.value }));
                  if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                }}
                rows={3} style={{ resize: 'vertical' }} />
              {errors.address && <span className="error-msg">{errors.address}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group" style={{ flex: 1.5 }}>
                <label className="form-label" htmlFor="checkout-area">Area</label>
                <select id="checkout-area" className="form-input" value={form.area} onChange={e => setForm(f => ({ ...f, area: e.target.value }))}>
                  <option value="">Select delivery area</option>
                  {['Whitefield', 'Whitefield (AECS Layout)', 'Whitefield (Brookefield)', 'Whitefield (Hope Farm)'].map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label" htmlFor="checkout-time"><Clock size={13} /> Delivery Time</label>
                <select id="checkout-time" className="form-input" value={form.timeSlot} onChange={e => setForm(f => ({ ...f, timeSlot: e.target.value }))}>
                  {timeSlots.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="checkout-instructions">Delivery Instructions (Optional)</label>
              <input id="checkout-instructions" className="form-input" placeholder="e.g., Ring the bell, leave at door..."
                value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} />
            </div>

            {/* ETA */}
            <div className="eta-card" style={{ border: '2px solid #3498db', background: '#ebf5fc' }}>
              <Clock size={20} className="eta-icon" style={{ color: '#3498db' }} />
              <div>
                <div className="eta-title" style={{ color: '#2980b9' }}>Scheduled Delivery</div>
                <div className="eta-time">Delivery by {form.timeSlot}</div>
                <div className="eta-sub">Freshly prepared for your chosen time 🕒</div>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: '16px', marginTop: 8, gap: 8 }}>
              📱 Place Order via WhatsApp <ChevronRight size={18} />
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
