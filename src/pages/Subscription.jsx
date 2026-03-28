
import { Link } from 'react-router-dom';
import { Check, Zap, ArrowRight, Calendar } from 'lucide-react';
import './Subscription.css';

const PLANS = [
  {
    id: 'weekly',
    label: 'Weekly',
    price: 699,
    original: 875,
    save: '20%',
    days: 7,
    badge: 'Most Popular',
    color: 'green',
    perks: [
      '7 freshly-made breakfasts',
      'Customizable daily menu',
      'Priority morning delivery',
      'Free delivery on all days',
      'WhatsApp order updates',
    ],
  },
  {
    id: 'monthly',
    label: 'Monthly',
    price: 2499,
    original: 3500,
    save: '29%',
    days: 30,
    badge: 'Best Value',
    color: 'dark',
    perks: [
      'All Weekly perks',
      '30 nutritionist-curated meals',
      'Dedicated health coach',
      'Macro tracking dashboard',
      'Skip/pause anytime',
      'First month 20% off',
    ],
  },
  {
    id: 'trial',
    label: '3-Day Trial',
    price: 199,
    original: 250,
    save: '20%',
    days: 3,
    badge: 'Start Here',
    color: 'light',
    perks: [
      '3 days of healthy breakfasts',
      'Free delivery',
      'Try before you commit',
      'Full refund if not satisfied',
    ],
  },
];

export default function Subscription() {
  return (
    <div className="sub-page page-enter">
      {/* Header */}
      <div className="sub-header">
        <div className="container sub-header-inner">
          <div className="sub-pill"><Zap size={14} /> Subscribe & Save</div>
          <h1 className="sub-title">Healthy Mornings, Every Day</h1>
          <p className="sub-desc">
            Never skip breakfast again. Lock in your meal plan and save up to 29%.
            Cancel or pause anytime — no questions asked.
          </p>
        </div>
      </div>

      {/* Plans */}
      <div className="container sub-plans-section">
        <div className="plans-grid">
          {PLANS.map(plan => (
            <div key={plan.id} className={`plan-card plan-${plan.color}`}>
              {plan.badge && (
                <div className={`plan-badge-top ${plan.color === 'dark' ? 'badge-white' : 'badge-green'}`}>
                  {plan.badge}
                </div>
              )}
              <div className="plan-label">{plan.label}</div>
              <div className="plan-price-row">
                <span className="plan-price">₹{plan.price}</span>
                <div>
                  <span className="plan-original">₹{plan.original}</span>
                  <span className={`plan-save ${plan.color === 'dark' ? 'save-white' : ''}`}>Save {plan.save}</span>
                </div>
              </div>
              <div className="plan-days">
                <Calendar size={14} /> {plan.days} days of fresh breakfasts
              </div>
              <div className="plan-perks">
                {plan.perks.map(perk => (
                  <div className="plan-perk" key={perk}>
                    <div className={`perk-check ${plan.color === 'dark' ? 'check-white' : ''}`}><Check size={12} /></div>
                    {perk}
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  const text = `Hello My Morning! I'm interested in the ${plan.label} Subscription (₹${plan.price}). Please let me know the details.`;
                  window.open(`https://wa.me/919187532042?text=${text}`, '_blank');
                }}
                className={`plan-cta ${plan.color === 'dark' ? 'plan-cta-white' : 'plan-cta-green'}`}
                style={{ border: 'none', cursor: 'pointer', width: '100%', fontFamily: "'Outfit', sans-serif" }}
              >
                Choose {plan.label} <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="container sub-faq">
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 36 }}>Frequently Asked Questions</h2>
        <div className="faq-grid">
          {[
            { q: 'Can I customize my daily meals?', a: 'Yes! Weekly and Monthly subscribers can customize their menu every day before 10 PM for the next morning.' },
            { q: 'How do I pause or cancel?', a: 'You can pause or cancel your subscription anytime from your account. No cancellation fees ever.' },
            { q: 'What areas do you deliver to?', a: 'We currently deliver to Whitefield, Marathahalli, Bellandur, Sarjapur, HSR Layout, Koramangala, Indiranagar, and Jayanagar.' },
            { q: 'What time will my order arrive?', a: 'All subscriptions get morning delivery between 6 AM – 9 AM. You choose your preferred slot.' },
            { q: 'Is there a minimum commitment?', a: 'Nope! Try our 3-day trial first. No minimum commitment, fully refundable if you\'re not happy.' },
            { q: 'How fresh are the ingredients?', a: 'We source ingredients daily from trusted local farms. Every meal is freshly prepared after 5 AM on the delivery day.' },
          ].map(faq => (
            <div className="faq-card" key={faq.q}>
              <div className="faq-q">❓ {faq.q}</div>
              <div className="faq-a">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="sub-cta-section">
        <div className="container sub-cta-inner">
          <h2 className="cta-title">Start Your Healthy Morning Journey</h2>
          <p className="cta-sub">Join 5,000+ Bangaloreans who fuel their mornings with My Morning.</p>
          <button onClick={() => window.open('https://wa.me/919187532042?text=Hello My Morning! I am interested in starting a trial.', '_blank')} className="btn-primary" style={{ padding: '16px 36px', fontSize: '16px', background: '#fff', color: 'var(--green-dark)', border: 'none', cursor: 'pointer' }}>
            Start Your Free Trial <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
