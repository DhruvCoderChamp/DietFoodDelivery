
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin login flag
  const [adminMode, setAdminMode] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPass, setAdminPass] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleAdminLogin = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPass })
      });
      if (res.ok) {
        login({ name: 'Admin', role: 'admin' });
        navigate('/admin');
      } else { setError('Invalid admin credentials'); }
    } catch (err) { setError('Failed to connect to server'); }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      
      const res = await fetch('http://localhost:8080/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: u.email, name: u.displayName })
      });

      if (res.ok) {
        const data = await res.json();
        login({ name: data.user.name, email: data.user.email, role: data.user.role });
        alert('Login successful! Welcome.');
        setLoading(false);
        navigate('/');
      } else {
        setError('Failed to authenticate with backend.');
        setLoading(false);
      }
    } catch (err) { 
      console.error('Google Sign-In Error:', err); 
      if (err.message && err.message.toLowerCase().includes('fetch')) {
        setError('Cannot connect to Spring Boot API. Turn on Backend.');
      } else {
        setError('Google Sign-In was cancelled or failed.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="login-page page-enter">
      <div className="login-bg">
        <div className="login-blob lb1"></div>
        <div className="login-blob lb2"></div>
      </div>
      <div className="login-container">
        {/* Left */}
        <div className="login-left">
          <div className="login-brand">
            <div style={{ fontSize: 48 }}>🥗</div>
            <h1 className="login-brand-name">My Morning</h1>
            <p className="login-brand-tag">A Healthy Start</p>
          </div>
          <div className="login-benefits">
            <div className="login-benefit">✓ Handcrafted High-Protein Meals</div>
            <div className="login-benefit">✓ Calorie-Tracked Menus</div>
            <div className="login-benefit">✓ Same-Morning Fresh Delivery</div>
          </div>
          <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800" alt="Healthy Food" className="login-img" />
        </div>

        {/* Right */}
        <div className="login-right">
          <div className="login-brand-mobile">
            <div style={{ fontSize: 36 }}>🥗</div>
            <h1 className="login-brand-name" style={{ color: 'var(--text-dark)', fontSize: 24 }}>My Morning</h1>
          </div>

          <div className="login-form" style={{ marginTop: '20px' }}>
            <h2 className="login-form-title">{adminMode ? 'Admin Portal' : 'Welcome'}</h2>
            <p className="login-form-sub">{adminMode ? 'Secure access for My Morning staff.' : 'Sign in securely with Google to grab our daily fresh meals.'}</p>
            {error && <span className="error-msg" style={{ textAlign: 'center', marginBottom: 10 }}>{error}</span>}

            {!adminMode ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center', marginTop: 30 }}>
                <div className="google-btn" style={{ padding: '16px 24px', fontSize: '15px', width: '100%', maxWidth: '300px' }} onClick={handleGoogleLogin}>
                  {loading ? (
                    <div className="spinner" style={{ width: 20, height: 20, borderTopColor: '#333' }}></div>
                  ) : (
                    <>
                      <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 7 29.5 5 24 5 12.9 5 4 13.9 4 25s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.9C14.7 15.1 19 12 24 12c3.1 0 5.8 1.1 8 2.9l5.7-5.7C34.5 7 29.5 5 24 5 16.3 5 9.7 9 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.3C29.5 36.3 26.9 37 24 37c-5.3 0-9.7-2.9-11.3-7.1l-6.6 5.1C9.7 41 16.4 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.7 2.1-2.1 3.9-3.8 5.2l6.2 5.3C43.1 34.8 44 28.5 44 25c0-1.2-.1-2.4-.4-3.5z"/></svg>
                      Continue with Google
                    </>
                  )}
                </div>
                <button className="admin-link" style={{ marginTop: '20px' }} onClick={() => setAdminMode(true)}>
                  <Shield size={14} /> Switch to Admin Login
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 15, marginTop: 20 }}>
                <div className="phone-input-wrap">
                  <input type="email" placeholder="Admin Email" className="phone-input" style={{ width: '100%', padding: '14px' }} value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                </div>
                <div className="phone-input-wrap" style={{ display: 'flex' }}>
                  <input type={showPass ? 'text' : 'password'} placeholder="Password" className="phone-input" style={{ width: '100%', padding: '14px' }} value={adminPass} onChange={e => setAdminPass(e.target.value)} />
                  <button className="btn-ghost" style={{ padding: '0 15px' }} onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }} onClick={handleAdminLogin}>
                  Access Server
                </button>
                <button className="admin-link" onClick={() => setAdminMode(false)}>← Back to User Login</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
