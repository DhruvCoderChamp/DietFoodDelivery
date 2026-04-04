
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ShoppingCart, Menu, X, User, LogOut, ChevronDown, Shield, Calendar } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import logoImg from '../assets/logo.png';
import './Navbar.css';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserDropOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src={logoImg} alt="My Morning Logo" className="logo-icon" style={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 8 }} />
          <div className="logo-text">
            <span className="logo-brand">My Morning</span>
            <span className="logo-tag">A Healthy Start</span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <div className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
          <Link to="/menu" className={`nav-link ${isActive('/menu') ? 'active' : ''}`}>Menu</Link>
          <Link to="/subscription" className={`nav-link ${isActive('/subscription') ? 'active' : ''}`}>Subscribe</Link>
          {isAdmin && (
            <Link to="/admin" className={`nav-link nav-admin ${isActive('/admin') ? 'active' : ''}`}>
              <Shield size={14} /> Admin
            </Link>
          )}
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          <Link to="/cart" className="cart-btn">
            <ShoppingCart size={20} />
            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
          </Link>

          {user ? (
            <div className="user-menu">
              <button className="user-btn" onClick={() => setUserDropOpen(!userDropOpen)}>
                <div className="user-avatar">{user.name?.[0]?.toUpperCase() || 'U'}</div>
                <span className="user-name">{user.name?.split(' ')[0]}</span>
                <ChevronDown size={14} />
              </button>
              {userDropOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <span className="dropdown-name">{user.name}</span>
                    <span className="dropdown-phone">{user.phone}</span>
                  </div>
                  <div className="divider" style={{ margin: '8px 0' }}></div>
                  <Link to="/orders" className="dropdown-item" onClick={() => setUserDropOpen(false)}>
                    <ShoppingCart size={14} /> My Orders
                  </Link>
                  <Link to="/subscription" className="dropdown-item" onClick={() => setUserDropOpen(false)}>
                    <Calendar size={14} /> My Plan
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="dropdown-item" onClick={() => setUserDropOpen(false)}>
                      <Shield size={14} /> Admin Panel
                    </Link>
                  )}
                  <div className="divider" style={{ margin: '8px 0' }}></div>
                  <button className="dropdown-item danger" onClick={handleLogout}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
              <User size={15} /> Login
            </Link>
          )}

          {/* Hamburger */}
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>🏠 Home</Link>
          <Link to="/menu" className="mobile-link" onClick={() => setMenuOpen(false)}>🍱 Menu</Link>
          <Link to="/orders" className="mobile-link" onClick={() => setMenuOpen(false)}>📜 My Orders</Link>
          <Link to="/cart" className="mobile-link" onClick={() => setMenuOpen(false)}>🛒 Cart {totalItems > 0 && `(${totalItems})`}</Link>
          <Link to="/subscription" className="mobile-link" onClick={() => setMenuOpen(false)}>📅 Subscribe</Link>
          {isAdmin && <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>🔐 Admin</Link>}
          {user ? (
            <button className="mobile-link danger" onClick={() => { handleLogout(); setMenuOpen(false); }}>🚪 Sign Out</button>
          ) : (
            <Link to="/login" className="mobile-link highlight" onClick={() => setMenuOpen(false)}>👤 Login / Sign Up</Link>
          )}
        </div>
      )}
    </nav>
  );
}
