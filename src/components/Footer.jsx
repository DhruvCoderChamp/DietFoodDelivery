
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import logoImg from '../assets/logo.png';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src={logoImg} alt="My Morning" style={{ width: 44, height: 44, borderRadius: 10 }} />
            <div>
              <div className="footer-brand-name">My Morning</div>
              <div className="footer-brand-tag">A Healthy Start</div>
            </div>
          </div>
          <p className="footer-desc">
            Bangalore's freshest healthy breakfast delivery service. 
            Fuel your day with real food, real nutrition, delivered to your door by 9 AM.
          </p>
          <div className="footer-contact">
            <a href="tel:+919187532042" className="footer-contact-item">
              <Phone size={14} /> +91 91875 32042
            </a>
            <a href="mailto:mymorningblr@gmail.com" className="footer-contact-item">
              <Mail size={14} /> mymorningblr@gmail.com
            </a>
            <div className="footer-contact-item">
              <MapPin size={14} /> Whitefield, Bangalore
            </div>
          </div>
        </div>

        <div className="footer-col">
          <div className="footer-col-title">Quick Links</div>
          <nav className="footer-links">
            <Link to="/" className="footer-link">Home</Link>
            <Link to="/menu" className="footer-link">Menu</Link>
            <Link to="/subscription" className="footer-link">Subscription Plans</Link>
            <Link to="/cart" className="footer-link">Cart</Link>
            <Link to="/contact" className="footer-link">Contact Us</Link>
            <Link to="/login" className="footer-link">Login / Sign Up</Link>
          </nav>
        </div>

        <div className="footer-col">
          <div className="footer-col-title">Delivery Areas</div>
          <nav className="footer-links">
            {['Whitefield', 'Whitefield North', 'Whitefield East'].map(area => (
              <span key={area} className="footer-link-plain">{area}</span>
            ))}
          </nav>
        </div>

        <div className="footer-col">
          <div className="footer-col-title">Morning Slot</div>
          <div className="footer-slot">
            <div className="slot-time">🌅 6 AM – 9 AM</div>
            <p className="footer-slot-desc">Fresh morning delivery daily. Subscribe for guaranteed slots.</p>
          </div>
          <div className="footer-col-title" style={{ marginTop: 20 }}>Follow Us</div>
          <div className="social-links">
            <a href="https://www.instagram.com/mymorningblr?igsh=MTJ2NDJ3b2N4dXA5bg%3D%3D&utm_source=qr" target="_blank" className="social-link" style={{ fontSize: 16, fontWeight: 800 }}>IG</a>
            <a href="#" className="social-link" style={{ fontSize: 16, fontWeight: 800 }}>f</a>
            <a href="#" className="social-link" style={{ fontSize: 15, fontWeight: 800 }}>𝕏</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© 2025 My Morning. All rights reserved. Built with 💚 in Bangalore.</span>
          <div className="footer-bottom-links">
            <Link to="/privacy" className="footer-bottom-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-bottom-link">Terms of Service</Link>
            <Link to="/refund" className="footer-bottom-link">Refund Policy</Link>
            <span className="footer-bottom-link" style={{ cursor: 'default' }}>FSSAI: 21423BLR</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
