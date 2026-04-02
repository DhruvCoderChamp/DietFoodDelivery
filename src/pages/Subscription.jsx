import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, CheckCircle, Send } from 'lucide-react';
import './Subscription.css';

const MASTER_IMG = 'https://images.unsplash.com/photo-1494390248081-4e521a5940db?w=1600&h=900&fit=crop';

const PLANS = [
  { id: '7days', label: 'Starter Trial', days: 7, badge: 'Beginner', color: 'green', desc: 'Perfect for a healthy week-long reset.' },
  { id: '14days', label: 'Balanced Habit', days: 14, badge: 'Popular', color: 'dark', desc: 'Build consistency and save effortlessly.' },
  { id: '21days', label: 'Pro Nutritionist', days: 21, badge: 'Voted Best', color: 'dark', desc: 'Maximum variety for peak performance.' },
  { id: '30days', label: 'Elite Lifestyle', days: 30, badge: 'Value King', color: 'dark', desc: 'Commit to your health and save the most.' }
];

export default function Subscription() {
  const { user } = useAuth();
  const [activePlan, setActivePlan] = useState(null);

  const handleSendToWhatsApp = () => {
    const text = `🌿 *New Subscription Request*%0A%0A📅 *Plan Duration:* ${activePlan.days} Days%0A👤 *Name:* ${user?.name || 'Customer'}%0A📱 *Contact:* ${user?.phone || 'Not provided'}%0A%0AI would like to start my subscription! Here is my weekly plan based on your menu:%0A%0AMonday: %0ATuesday: %0AWednesday: %0AThursday: %0AFriday: %0ASaturday: %0ASunday: %0A%0APlease confirm the details and total price. Thank you!`;
    window.open(`https://wa.me/919187532042?text=${text}`, '_blank');
  };

  if (!activePlan) {
    return (
      <div className="sub-hub page-enter">
        <div className="hub-header-premium">
           <img src={MASTER_IMG} alt="Master Breakfast" className="master-bg" />
           <div className="hub-header-overlay">
              <div className="container">
                 <span className="hub-badge"><Sparkles size={14} /> My Morning Elite</span>
                 <h1 className="hub-title">The Art of Waking Up Healthy</h1>
                 <p className="hub-desc">Join 100+ habit builders who start their day with nutritionist-crafted morning boxes.</p>
              </div>
           </div>
        </div>
        <div className="container hub-content">
           <div className="hub-plans-header">
              <h3>Choose Your Subscription Duration</h3>
              <p>Select a plan duration. No upfront payment required—we'll curate your menu on WhatsApp!</p>
           </div>
           <div className="hub-plans-grid">
              {PLANS.map(plan => (
                <div key={plan.id} className={`hub-plan-card ${plan.color}`} onClick={() => setActivePlan(plan)}>
                   <div className="plan-top">
                      <div className="plan-meta">
                         <span className="plan-badge">{plan.badge}</span>
                         <h4 className="plan-label">{plan.label}</h4>
                      </div>
                      <div className="plan-days">{plan.days} Days</div>
                   </div>
                   <p className="plan-desc">{plan.desc}</p>
                   <div className="plan-divider"></div>
                   <button className="plan-select-btn" style={{ marginTop: '16px' }}>
                      Select {plan.days} Days <ArrowRight size={16} />
                   </button>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sub-dashboard page-enter">
       <div className="container">
          <div className="sub-dashboard-header">
             <div className="user-overview">
                <div className="avatar-ring">
                   <img src={`https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=e8f5e0&color=2d6a1f`} alt="Me" />
                </div>
                <div className="user-text">
                   <h2>Great choice, {user?.name?.split(' ')[0] || 'friend'}! 🥗</h2>
                   <p>You selected the <strong>{activePlan.days}-Day Subscription</strong>.</p>
                </div>
             </div>
             <button className="batch-help-btn" onClick={() => setActivePlan(null)}>
                Change Plan
             </button>
          </div>

          <div className="dashboard-main-area" style={{ padding: '40px', textAlign: 'center' }}>
             <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#1a2e12', marginBottom: '12px' }}>How Your Subscription Works</h3>
             <p style={{ color: '#6b8a5e', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
               Building a healthy habit is simple. Follow the steps below, and we'll handle your breakfasts for the next {activePlan.days} days!
             </p>

             {/* Steps Grid */}
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                 <div style={{ background: '#fcfdfc', padding: '24px', borderRadius: '24px', border: '2px solid #e0eacb', textAlign: 'left', boxShadow: '0 8px 20px rgba(45, 106, 31, 0.04)' }}>
                     <div style={{ background: '#2d6a1f', color: 'white', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: '900', marginBottom: '16px', fontSize: '16px' }}>1</div>
                     <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1a2e12', marginBottom: '8px' }}>Pick Your Meals</h4>
                     <p style={{ fontSize: '14px', color: '#6b8a5e', lineHeight: '1.5' }}>Look at the menu below. Pick what you want to fuel yourself with from Monday to Sunday.</p>
                 </div>
                 <div style={{ background: '#fcfdfc', padding: '24px', borderRadius: '24px', border: '2px solid #e0eacb', textAlign: 'left', boxShadow: '0 8px 20px rgba(45, 106, 31, 0.04)' }}>
                     <div style={{ background: '#2d6a1f', color: 'white', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: '900', marginBottom: '16px', fontSize: '16px' }}>2</div>
                     <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1a2e12', marginBottom: '8px' }}>Send on WhatsApp</h4>
                     <p style={{ fontSize: '14px', color: '#6b8a5e', lineHeight: '1.5' }}>Tap the bold button below to open WhatsApp with a pre-filled, ready-to-use message template.</p>
                 </div>
                 <div style={{ background: '#fcfdfc', padding: '24px', borderRadius: '24px', border: '2px solid #e0eacb', textAlign: 'left', boxShadow: '0 8px 20px rgba(45, 106, 31, 0.04)' }}>
                     <div style={{ background: '#2d6a1f', color: 'white', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: '900', marginBottom: '16px', fontSize: '16px' }}>3</div>
                     <h4 style={{ fontSize: '18px', fontWeight: '800', color: '#1a2e12', marginBottom: '8px' }}>Quick Pricing</h4>
                     <p style={{ fontSize: '14px', color: '#6b8a5e', lineHeight: '1.5' }}>Send the message, and our team will instantly confirm your schedule and calculate your total discount!</p>
                 </div>
             </div>
             
             {/* Fully Coded Native React Menu Matching User's Image */}
             <div style={{ position: 'relative' }}>
                 <div style={{ background: '#1a2e12', color: '#fff', display: 'inline-block', padding: '8px 24px', borderRadius: '99px', fontSize: '14px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '20px' }}>
                    Premium Custom Menu
                 </div>
                 <div style={{ border: '3px solid #e0eacb', borderRadius: '24px', overflow: 'hidden', background: '#f8f9f5', boxShadow: '0 20px 50px rgba(0,0,0,0.05)', padding: '24px', textAlign: 'left' }}>
                    
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '2px solid #e0eacb', paddingBottom: '16px' }}>
                       <span style={{ fontSize: '28px' }}>🥗</span>
                       <h2 style={{ fontSize: '24px', fontWeight: '900', color: '#1a2e12', letterSpacing: '2px', margin: '8px 0 4px', textTransform: 'uppercase' }}>My Morning</h2>
                       <p style={{ color: '#8b211d', fontSize: '12px', fontWeight: '800', letterSpacing: '3px' }}>A HEALTHY START</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                       {/* Column 1 */}
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                           <div style={{ background: '#fff', border: '1.5px solid #d4e8c8', borderRadius: '16px', padding: '20px' }}>
                              <h4 style={{ color: '#2d6a1f', fontSize: '16px', fontWeight: '900', marginBottom: '12px', borderBottom: '1px dashed #d4e8c8', paddingBottom: '8px' }}>🍏 FRUIT & SALAD</h4>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Fruit Bowl</span><span>50</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Salad Bowl</span><span>50</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Fruit & Salad Bowl</span><span>50</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#4a633f' }}><span>Sprouts Bowl</span><span>50</span></div>
                           </div>
                           <div style={{ background: '#fff', border: '1.5px solid #d4e8c8', borderRadius: '16px', padding: '20px' }}>
                              <h4 style={{ color: '#2d6a1f', fontSize: '16px', fontWeight: '900', marginBottom: '12px', borderBottom: '1px dashed #d4e8c8', paddingBottom: '8px' }}>🥤 JUICES & SMOOTHIES</h4>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Fresh Juice</span><span>50</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Smoothie</span><span>60</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Protein Smoothie</span><span>119</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#4a633f' }}><span>Whey Protein Smoothie</span><span>139</span></div>
                           </div>
                           <div style={{ background: '#fff', border: '1.5px solid #d4e8c8', borderRadius: '16px', padding: '20px' }}>
                              <h4 style={{ color: '#2d6a1f', fontSize: '16px', fontWeight: '900', marginBottom: '12px', borderBottom: '1px dashed #d4e8c8', paddingBottom: '8px' }}>🏋️ PROTEIN PLATES</h4>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Paneer 100g</span><span>119</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Chicken Breast 200g</span><span>119</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#4a633f' }}><span>Tofu 100g</span><span>119</span></div>
                           </div>
                           <div style={{ background: '#fff', border: '1.5px solid #d4e8c8', borderRadius: '16px', padding: '20px' }}>
                              <h4 style={{ color: '#2d6a1f', fontSize: '16px', fontWeight: '900', marginBottom: '12px', borderBottom: '1px dashed #d4e8c8', paddingBottom: '8px' }}>🍚 HEALTHY RICE BOWLS</h4>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Brown rice pulav</span><span>99</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>White rice pulav</span><span>99</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontWeight: '700', color: '#4a633f' }}><span>Dal rice</span><span>99</span></div>
                              <div style={{ fontSize: '12px', fontWeight: '800', color: '#2d6a1f', textAlign: 'center' }}>+ Add Chicken or Paneer for + 60</div>
                           </div>
                       </div>
                       
                       {/* Column 2 */}
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                           <div style={{ background: '#fff', border: '1.5px solid #d4e8c8', borderRadius: '16px', padding: '20px' }}>
                              <h4 style={{ color: '#2d6a1f', fontSize: '16px', fontWeight: '900', marginBottom: '12px', borderBottom: '1px dashed #d4e8c8', paddingBottom: '8px' }}>🥚 EGGS</h4>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Boiled Eggs (3)</span><span>50</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Scrambled Eggs (3)</span><span>60</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#4a633f' }}><span>Fried Eggs (3)</span><span>60</span></div>
                           </div>
                           <div style={{ background: '#fff', border: '1.5px solid #d4e8c8', borderRadius: '16px', padding: '20px' }}>
                              <h4 style={{ color: '#2d6a1f', fontSize: '16px', fontWeight: '900', marginBottom: '12px', borderBottom: '1px dashed #d4e8c8', paddingBottom: '8px' }}>🍞 TOASTS</h4>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Avocado Toast</span><span>80</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Scrambled Egg Toast</span><span>70</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#4a633f' }}><span>Avocado-Scrambled Egg</span><span>90</span></div>
                           </div>
                           <div style={{ background: '#fff', border: '1.5px solid #d4e8c8', borderRadius: '16px', padding: '20px' }}>
                              <h4 style={{ color: '#2d6a1f', fontSize: '16px', fontWeight: '900', marginBottom: '12px', borderBottom: '1px dashed #d4e8c8', paddingBottom: '8px' }}>🥣 BOWLS</h4>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Oat meal bowl</span><span>119</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#4a633f' }}><span>Smoothie bowl</span><span>119</span></div>
                           </div>
                           <div style={{ background: '#fff', border: '1.5px solid #d4e8c8', borderRadius: '16px', padding: '20px' }}>
                              <h4 style={{ color: '#2d6a1f', fontSize: '16px', fontWeight: '900', marginBottom: '12px', borderBottom: '1px dashed #d4e8c8', paddingBottom: '8px' }}>⭐ PREMIUM SALADS</h4>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontWeight: '700', color: '#4a633f' }}><span>Paneer Salad</span><span>169</span></div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#4a633f' }}><span>Chicken Salad</span><span>169</span></div>
                           </div>
                       </div>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', fontWeight: '900', color: '#1a2e12', letterSpacing: '1px' }}>
                       FRESH. HEALTHY. FUEL YOUR MORNING.
                    </div>
                 </div>
             </div>
          </div>
       </div>

       <div className="sub-sticky-footer" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
          <div className="footer-flex" style={{ justifyContent: 'center' }}>
             <button 
                className="confirm-sync-btn" 
                onClick={handleSendToWhatsApp} 
             >
                <Send size={20} /> Message Routine to WhatsApp
             </button>
          </div>
       </div>
    </div>
  );
}
