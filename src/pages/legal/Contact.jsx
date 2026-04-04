
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logoImg from '../../assets/logo.png';
import './Legal.css';

export default function Contact() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const triggerProtocolLink = (e, url) => {
    e.preventDefault();
    const tempLink = document.createElement('a');
    tempLink.href = url;
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
          <div className="legal-icon"><MessageSquare size={48} /></div>
          <h1 className="legal-title">Contact Us</h1>
          <p className="legal-subtitle">
            We're here to help you start your morning Right. 
            <img src={logoImg} alt="logo" style={{ width: 18, height: 18, marginLeft: 6, verticalAlign: 'middle' }} />
          </p>
        </div>
      </div>

      <div className="container legal-content contact-grid">
        <div className="contact-info">
          <button className="contact-card btn-reset" onClick={(e) => triggerProtocolLink(e, 'mailto:hello@mymorning.in')}>
            <Mail className="contact-icon" />
            <div>
              <h3>Support Email</h3>
              <p>hello@mymorning.in</p>
            </div>
          </button>
          <button className="contact-card btn-reset" onClick={(e) => triggerProtocolLink(e, 'tel:+919187532042')}>
            <Phone className="contact-icon" />
            <div>
              <h3>Phone Number</h3>
              <p>+91 91875 32042</p>
            </div>
          </button>
          <div className="contact-card">
            <MapPin className="contact-icon" />
            <div>
              <h3>Business Address</h3>
              <p>Green Glen Layout, Bellandur,<br />Bangalore, KA 560103</p>
            </div>
          </div>
        </div>

        <div className="contact-form-wrap">
          <form className="contact-form" onSubmit={(e) => {
            e.preventDefault();
            const { name, email, message } = form;
            const body = `Name: ${name}\r\nEmail: ${email}\r\n\r\nMessage:\r\n${message}`;
            const subject = encodeURIComponent(`Contact Us - ${name}`);
            const mailtoUrl = `mailto:hello@mymorning.in?subject=${subject}&body=${encodeURIComponent(body)}`;
            
            // More robust method to trigger mailto
            const tempLink = document.createElement('a');
            tempLink.href = mailtoUrl;
            tempLink.style.display = 'none';
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);

            setSent(true);
            setTimeout(() => setSent(false), 3000);
            setForm({ name: '', email: '', message: '' });
          }}>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Rahul Mehta" 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="rahul@example.com" 
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea 
                className="form-input" 
                rows="4" 
                placeholder="How can we help?" 
                value={form.message}
                onChange={e => setForm({...form, message: e.target.value})}
                required
              ></textarea>
            </div>
            <button className={`btn-primary contact-submit ${sent ? 'sent' : ''}`} type="submit">
              {sent ? (
                <>✓ Opening Email Client...</>
              ) : (
                <><Send size={16} /> Send Message</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
