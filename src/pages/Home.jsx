
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Clock, Zap, Leaf, Shield, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { testimonials, deliveryAreas } from '../data/menuData';
import logoImg from '../assets/logo.png';
import './Home.css';

const FeaturedCard = ({ item }) => {
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleAdd = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    addItem(item);
  };

  return (
    <div className="featured-card">
      <div className="featured-img-wrap">
        <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} alt={item.name} className="featured-img" loading="lazy" />
        <span className={`featured-badge badge ${item.badge === 'High Protein' ? 'badge-red' : 'badge-green'}`}>{item.badge}</span>
      </div>
      <div className="featured-body">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
          <span className={`veg-dot ${item.isVeg ? 'veg' : 'non-veg'}`}></span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
            {item.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>
        <h3 className="featured-name">{item.name}</h3>
        <div className="featured-meta">
          <span>🔥 {item.calories} kcal</span>
          <span>💪 {item.protein}g protein</span>
        </div>
        <div className="featured-footer">
          <span className="featured-price">₹{item.price}</span>
          <button className="btn-primary" style={{ padding: '9px 18px', fontSize: '13px' }} onClick={handleAdd}>
            + Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home() {
  const { products, loading: productsLoading } = useProducts();
  const featured = products.filter(i => i.isAvailable).slice(0, 6);
  const [showCookie, setShowCookie] = useState(() => !localStorage.getItem('mm_cookie_accepted'));

  const acceptCookie = () => {
    localStorage.setItem('mm_cookie_accepted', 'true');
    setShowCookie(false);
  };

  return (
    <div className="home page-enter">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
          <div className="blob blob-3"></div>
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-pill">
              <Leaf size={14} /> 100% Fresh & Healthy · Bangalore
            </div>
            <h1 className="hero-title">
              Start Your Day
              <span className="hero-title-green"> Strong</span> with
              <br />Healthy, Protein-Rich Meals
            </h1>
            <p className="hero-desc">
              Freshly prepared every morning. Delivered to your door by 9 AM. 
              Fitness-first food for Bangalore's go-getters.
            </p>
            <div className="hero-ctas">
              <Link to="/menu" className="btn-primary hero-cta-main">
                Order Now <ArrowRight size={18} />
              </Link>
              <Link to="/subscription" className="btn-outline">
                View Meal Plans
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-num">100+</span>
                <span className="stat-lbl">Happy Customers</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-num">4.9★</span>
                <span className="stat-lbl">Average Rating</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat-num">₹50</span>
                <span className="stat-lbl">Starts From</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80"
                alt="Healthy breakfast bowl"
                className="hero-img"
              />
              <div className="hero-float hero-float-1">
                <img src={logoImg} alt="logo" style={{ width: 28, height: 28, borderRadius: 6 }} />
                <div>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--green-dark)' }}>Protein Bowl</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>35g protein</span>
                </div>
              </div>
              <div className="hero-float hero-float-2">
                <Clock size={16} color="var(--green-main)" />
                <span style={{ fontWeight: 600, fontSize: 13 }}>Delivered by 9 AM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar & Location Disclosure ── */}
      <div className="trust-banner">
        <div className="container trust-grid">
          <div className="trust-item">
            <Shield size={18} />
            <span>Secure Checkout 🔒</span>
          </div>
          <div className="trust-item">
            <Leaf size={18} />
            <span>Fresh & Hygienic Food</span>
          </div>
          <div className="trust-item">
            <Star size={18} fill="#f39c12" stroke="#f39c12" />
            <span>Trusted by 5k+ Users</span>
          </div>
        </div>
      </div>

      <div className="location-notice">
        <div className="container location-inner">
          <MapPin size={16} color="var(--green-main)" />
          <p><strong>Note:</strong> We use your location to deliver fresh, hot meals right to your doorstep. 🏠</p>
        </div>
      </div>

      {/* ── How It Works ── */}
      <section className="how-section section">
        <div className="container">
          <div className="how-grid">
            {[
              { icon: '🛒', title: 'Pick Your Meal', desc: 'Browse our fresh menu and add items to cart' },
              { icon: '📍', title: 'Set Location', desc: 'Auto-detect your GPS or enter address manually' },
              { icon: '💳', title: 'Pay Securely', desc: 'UPI, Card, or Cash on Delivery — your choice' },
              { icon: '🚚', title: 'Fresh Delivery', desc: 'Hot & healthy breakfast at your door by 9 AM' },
            ].map((step, i) => (
              <div className="how-card" key={i}>
                <div className="how-icon">{step.icon}</div>
                <div className="how-step">Step {i + 1}</div>
                <h3 className="how-title">{step.title}</h3>
                <p className="how-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Menu ── */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Today's Fresh Menu</h2>
              <p className="section-subtitle">Handcrafted with love. Powered by nutrition.</p>
            </div>
            <Link to="/menu" className="btn-outline">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          <div className="featured-grid">
            {productsLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="featured-card skeleton-card">
                    <div className="skeleton-img" />
                    <div className="featured-body" style={{ gap: 10 }}>
                      <div className="skeleton-line" style={{ width: '70%', height: 16 }} />
                      <div className="skeleton-line" style={{ width: '50%', height: 13 }} />
                      <div className="skeleton-line" style={{ width: '40%', height: 14 }} />
                    </div>
                  </div>
                ))
              : featured.map(item => <FeaturedCard key={item.id} item={item} />)
            }
          </div>
        </div>
      </section>

      {/* ── Why My Morning ── */}
      <section className="why-section section">
        <div className="container">
          <div className="why-content">
            <div className="why-text">
              <h2 className="section-title" style={{ textAlign: 'left' }}>
                Why Choose<br /><span style={{ color: 'var(--green-main)' }}>My Morning</span>?
              </h2>
              <p className="section-subtitle" style={{ textAlign: 'left' }}>
                We're obsessed with one thing — giving Bangalore a healthy and delicious start to the day.
              </p>
              <div className="why-features">
                {[
                  { icon: <Zap size={20} />, title: 'Macro-Balanced', desc: 'Every meal is nutritionist-designed for the right protein, carbs & fats' },
                  { icon: <Leaf size={20} />, title: 'Farm Fresh', desc: 'Ingredients sourced from trusted local farms, no preservatives' },
                  { icon: <Clock size={20} />, title: 'Morning Slots', desc: 'Delivery between 6 AM – 9 AM so you\'re fueled for work' },
                  { icon: <Shield size={20} />, title: 'Quality Promise', desc: 'FSSAI certified kitchen, hygiene standards you can trust' },
                ].map((f, i) => (
                  <div className="why-feature" key={i}>
                    <div className="why-feature-icon">{f.icon}</div>
                    <div>
                      <h4 className="why-feature-title">{f.title}</h4>
                      <p className="why-feature-desc">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="why-img-wrap">
              <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80" alt="Healthy meal prep" className="why-img" />
              <div className="why-badge">
                <span className="why-badge-num">100+</span>
                <span className="why-badge-txt">Orders / Day</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section testimonials-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle" style={{ margin: '12px auto 0' }}>Real reviews from real Bangaloreans 💚</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map(t => (
              <div className="testimonial-card" key={t.id}>
                <div className="t-header">
                  <div className="t-avatar">{t.avatar}</div>
                  <div>
                    <div className="t-name">{t.name}</div>
                    <div className="t-role">{t.role}</div>
                  </div>
                  <div className="stars" style={{ marginLeft: 'auto' }}>
                    {'★'.repeat(t.rating)}
                  </div>
                </div>
                <p className="t-text">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Delivery Areas ── */}
      <section className="section delivery-section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 className="section-title">We Deliver Across Bangalore</h2>
            <p className="section-subtitle" style={{ margin: '12px auto 0' }}>
              <MapPin size={14} style={{ display: 'inline', marginRight: 4 }} />
              Currently serving these areas with morning delivery (6 AM – 9 AM)
            </p>
          </div>
          <div className="delivery-areas">
            {deliveryAreas.map(area => (
              <div className="area-pill" key={area}>
                <MapPin size={13} /> {area}
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/menu" className="btn-primary">
              Order Now for Tomorrow Morning <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <h2 className="cta-title">Subscribe & Save 20%</h2>
            <p className="cta-sub">Lock in your weekly or monthly meal plan. Never miss a healthy start.</p>
          </div>
          <Link to="/subscription" className="btn-primary cta-btn">
            Explore Plans <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Cookie Notice ── */}
      {showCookie && (
        <div className="cookie-banner animated-fade-up">
          <div className="container cookie-inner">
            <div className="cookie-text">
              🍪 We use cookies to improve your experience and deliver fresh nutrition seamlessly.
            </div>
            <div className="cookie-actions">
              <Link to="/privacy" className="btn-text" style={{ fontSize: 13, marginRight: 15 }}>Learn More</Link>
              <button className="btn-primary" style={{ padding: '8px 24px', fontSize: 13 }} onClick={acceptCookie}>Accept</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
