
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, ArrowRight, Smartphone, CheckCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import logoImg from '../assets/logo.png';
import './Login.css';

export default function Login() {
  const { login, user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState('phone'); // phone | otp | details
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [name, setName] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);

  // Admin login flags
  const [adminMode, setAdminMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (currentUser) navigate('/');
  }, [currentUser, navigate]);

  const handleSendOTP = async () => {
    if (phone.length !== 10) { setError('Please enter a valid 10-digit number'); return; }
    setError('');
    setName(''); 
    setLoading(true);

    try {
      // More thorough cleanup to fix SESSION_EXPIRED
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear();
        } catch {
          window.recaptchaVerifier = null;
        }
        window.recaptchaVerifier = null;
      }
      
      const container = document.getElementById('recaptcha-container');
      if (container) {
          container.innerHTML = ''; // Clear div
      }
      
      const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please try again.');
          setLoading(false);
        }
      });
      
      // Explicitly render to get a fresh session ID from Google
      await appVerifier.render();
      window.recaptchaVerifier = appVerifier;

      const result = await signInWithPhoneNumber(auth, '+91' + phone, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
      setResendTimer(30); // Start 30s timer
      setLoading(false);
    } catch(err) {
      console.error(err);
      setError('Failed to send OTP. Please check your network or try again.');
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) { setError('Enter full 6-digit OTP'); return; }
    setError('');
    setLoading(true);
    
    try {
      await confirmationResult.confirm(enteredOtp);

      // Normal phone login flow
      const res = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name: name || undefined })
      });

      if (res.ok) {
        const data = await res.json();
        // If user already has a name, update local state and login
        if (data.user.name && data.user.name !== 'Dear Customer' && data.user.name.length > 0) {
          setName(data.user.name);
          login(data);
          navigate('/');
        } else {
          // If name is missing or default, ask for it
          setStep('details');
          setLoading(false);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || 'Server is busy. Please try again in 5 seconds.');
        setLoading(false);
      }
    } catch(err) {
      console.error(err);
      setError('Invalid OTP code. Please try again.');
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    if (!name.trim()) { setError('Please enter your name'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, name })
      });
      if (res.ok) {
        const data = await res.json();
        login(data);
        navigate('/');
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.message || 'Server is busy. Please try again in 5 seconds.');
      }
      setLoading(false);
    } catch {
      setError('Connection lost. Please check your data/wifi and try again.');
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminEmail.trim() || !adminPass.trim()) {
      setError('Please enter both email and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPass })
      });
      if (res.ok) {
        const data = await res.json();
        login(data);
        navigate('/admin');
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || 'Invalid admin credentials. Check your username and password.');
      }
    } catch {
      setError('Failed to connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (element, index) => {
    if (isNaN(element)) return;
    const newOtp = [...otp];
    newOtp[index] = element;
    setOtp(newOtp);
    if (element && index < 5) document.getElementById(`otp-${index + 1}`).focus();
    if (!element && index > 0) document.getElementById(`otp-${index - 1}`).focus();
  };

  return (
    <div className="login-page page-enter">
      <div className="login-bg">
        <div className="login-blob lb1"></div>
        <div className="login-blob lb2"></div>
      </div>
      
      <div className="login-container unified-auth">
        <div className="login-left">
          <div className="login-brand">
            <img src={logoImg} alt="My Morning" className="brand-logo-circle" style={{ width: 80, height: 80, objectFit: 'contain', borderRadius: 16, background: 'rgba(255,255,255,0.15)', padding: 8 }} />
            <h1 className="login-brand-name">My Morning</h1>
            <p className="login-brand-tag">Fresh Smarter Start</p>
          </div>
          <div className="login-benefits">
            <div className="login-benefit"><CheckCircle size={14} /> Protein-Rich Wellness Bowls</div>
            <div className="login-benefit"><CheckCircle size={14} /> Real-Time Calorie Tracking</div>
            <div className="login-benefit"><CheckCircle size={14} /> Same-Morning Fresh Delivery</div>
          </div>
          <div className="login-visual">
            <img src="https://images.unsplash.com/photo-1543362906-acfc16c67564?w=800" alt="Healthy Breakfast" className="login-img" />
          </div>
        </div>

        <div className="login-right">
          <div className="login-form-wrapper">
            <div className="form-header">
              <h2 className="login-form-title">
                {adminMode ? 'Admin Portal' : 'Welcome to My Morning'}
              </h2>
              <p className="login-form-sub">
                {adminMode ? 'Secure terminal access.' : 'Start your healthy mornings'}
              </p>
            </div>

            {adminMode ? (
              <div className="admin-login-fields animated-fade-in">
                <div className="phone-input-wrap">
                  <input
                    type="email"
                    placeholder="Admin Email"
                    className={`phone-input ${error ? 'input-error' : ''}`}
                    value={adminEmail}
                    onChange={e => { setAdminEmail(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                  />
                </div>
                <div className="phone-input-wrap">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Password"
                    className={`phone-input ${error ? 'input-error' : ''}`}
                    value={adminPass}
                    onChange={e => { setAdminPass(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
                  />
                  <button className="btn-toggle-pass" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && (
                  <div className="auth-error-alert admin-error-alert">
                    <Shield size={14} style={{ flexShrink: 0 }} />
                    <span>{error}</span>
                  </div>
                )}
                <button
                  className="btn-primary auth-submit"
                  onClick={handleAdminLogin}
                  disabled={loading}
                >
                  {loading ? <div className="spinner-small" /> : 'Access Server'}
                </button>
                <button className="btn-text-link" onClick={() => { setAdminMode(false); setError(''); setAdminEmail(''); setAdminPass(''); }}>← Back to User Login</button>
              </div>
            ) : (
              <div className="user-auth-fields animated-fade-in">
                {step === 'phone' && (
                  <div className="step-phone">
                    <div className="phone-input-wrap">
                      <div className="phone-prefix">+91</div>
                      <input type="tel" maxLength="10" placeholder="Mobile number" className="phone-input" value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }} />
                    </div>
                    
                    <div className="auth-consent-wrap">
                      <label className="auth-consent-label">
                        <input type="checkbox" required className="auth-checkbox" defaultChecked />
                        <span>I agree to the <Link to="/terms" target="_blank">Terms</Link> & <Link to="/privacy" target="_blank">Privacy Policy</Link></span>
                      </label>
                    </div>

                    <button id="send-otp-btn" className="btn-primary auth-submit" onClick={handleSendOTP} disabled={loading}>
                      {loading ? <div className="spinner-small" /> : <>Continue with Phone <Smartphone size={16} /></>}
                    </button>
                  </div>
                )}

                {step === 'otp' && (
                  <div className="step-otp">
                    <p className="otp-guide">Enter 6-digit code sent to +91 {phone}</p>
                    <div className="otp-digit-group">
                      {otp.map((digit, i) => (
                        <input key={i} id={`otp-${i}`} type="text" maxLength="1" className="otp-digit-box" value={digit} onChange={e => handleOtpChange(e.target.value.slice(-1), i)} />
                      ))}
                    </div>
                    <button className="btn-primary auth-submit" onClick={handleVerifyOTP} disabled={loading}>
                       {loading ? <div className="spinner-small" /> : <>Verify & Continue <ArrowRight size={16} /></>}
                    </button>
                    
                    <div className="otp-footer-actions">
                      <button className="btn-text-link" onClick={() => setStep('phone')}>Edit Number</button>
                      <button 
                        className="btn-text-link" 
                        onClick={handleSendOTP} 
                        disabled={resendTimer > 0 || loading}
                        style={{ color: resendTimer > 0 ? '#999' : 'var(--green-main)' }}
                      >
                        {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                )}

                {step === 'details' && (
                  <div className="step-details">
                    <div className="phone-input-wrap">
                      <input type="text" placeholder="Your Full Name" className="phone-input" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <button className="btn-primary auth-submit" onClick={handleCompleteRegistration} disabled={loading}>
                      {loading ? <div className="spinner-small" /> : <>Start Eating Healthy <UserCheck size={16} /></>}
                    </button>
                  </div>
                )}

                {error && <div className="auth-error-alert">{error}</div>}
              </div>
            )}
            
            <div className="auth-footer">
               {!adminMode && step === 'phone' && (
                  <button className="admin-access-btn" onClick={() => setAdminMode(true)}>
                    <Shield size={12} /> Staff Access
                  </button>
               )}
               <p className="legal-note">By continuing, you agree to our <span>Terms</span> & <span>Privacy Policy</span></p>
            </div>
          </div>
        </div>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
}
