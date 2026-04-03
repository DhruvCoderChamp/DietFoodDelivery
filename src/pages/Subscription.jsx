import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, ArrowRight, Send } from 'lucide-react';
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

          <div className="dashboard-main-area">
             <div className="how-it-works">
                <h3>How Your Subscription Works</h3>
                <p>Building a healthy habit is simple. Follow the steps below, and we'll handle your breakfasts!</p>
                
                <div className="steps-grid">
                    <div className="step-card">
                        <div className="step-num">1</div>
                        <h4>Pick Your Meals</h4>
                        <p>Look at the menu below. Pick what you want from Mon to Sun.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-num">2</div>
                        <h4>Send on WhatsApp</h4>
                        <p>Tap the button below to message us with your selection.</p>
                    </div>
                    <div className="step-card">
                        <div className="step-num">3</div>
                        <h4>Quick Pricing</h4>
                        <p>We'll confirm your schedule and calculate your total discount!</p>
                    </div>
                </div>
             </div>
             
             {/* Native Menu Matching User's Image */}
             <div className="menu-custom-container">
                <div className="menu-custom-header">
                   <span className="menu-icon-lg">🥗</span>
                   <h2>My Morning</h2>
                   <p>A HEALTHY START</p>
                </div>

                <div className="menu-custom-grid">
                   {/* Categories */}
                   <div className="menu-custom-column">
                       <div className="menu-custom-category">
                          <h4>🍏 FRUIT & SALAD</h4>
                          <div className="menu-row-item"><span>Fruit Bowl</span><span>50</span></div>
                          <div className="menu-row-item"><span>Salad Bowl</span><span>50</span></div>
                          <div className="menu-row-item"><span>Fruit & Salad Bowl</span><span>50</span></div>
                          <div className="menu-row-item"><span>Sprouts Bowl</span><span>50</span></div>
                       </div>
                       <div className="menu-custom-category">
                          <h4>🥤 JUICES & SMOOTHIES</h4>
                          <div className="menu-row-item"><span>Fresh Juice</span><span>50</span></div>
                          <div className="menu-row-item"><span>Smoothie</span><span>60</span></div>
                          <div className="menu-row-item"><span>Protein Smoothie</span><span>119</span></div>
                          <div className="menu-row-item"><span>Whey Protein Smoothie</span><span>139</span></div>
                       </div>
                       <div className="menu-custom-category">
                          <h4>🏋️ PROTEIN PLATES</h4>
                          <div className="menu-row-item"><span>Paneer 100g</span><span>119</span></div>
                          <div className="menu-row-item"><span>Chicken Breast 200g</span><span>119</span></div>
                          <div className="menu-row-item"><span>Tofu 100g</span><span>119</span></div>
                       </div>
                       <div className="menu-custom-category">
                          <h4>🍚 HEALTHY RICE BOWLS</h4>
                          <div className="menu-row-item"><span>Brown rice pulav</span><span>99</span></div>
                          <div className="menu-row-item"><span>White rice pulav</span><span>99</span></div>
                          <div className="menu-row-item"><span>Dal rice</span><span>99</span></div>
                          <div className="menu-promo">+ Add Chicken or Paneer for + 60</div>
                       </div>
                   </div>
                   
                   <div className="menu-custom-column">
                       <div className="menu-custom-category">
                          <h4>🥚 EGGS</h4>
                          <div className="menu-row-item"><span>Boiled Eggs (3)</span><span>50</span></div>
                          <div className="menu-row-item"><span>Scrambled Eggs (3)</span><span>60</span></div>
                          <div className="menu-row-item"><span>Fried Eggs (3)</span><span>60</span></div>
                       </div>
                       <div className="menu-custom-category">
                          <h4>🍞 TOASTS</h4>
                          <div className="menu-row-item"><span>Avocado Toast</span><span>80</span></div>
                          <div className="menu-row-item"><span>Scrambled Egg Toast</span><span>70</span></div>
                          <div className="menu-row-item"><span>Avocado-Scrambled Egg</span><span>90</span></div>
                       </div>
                       <div className="menu-custom-category">
                          <h4>🥣 BOWLS</h4>
                          <div className="menu-row-item"><span>Oat meal bowl</span><span>119</span></div>
                          <div className="menu-row-item"><span>Smoothie bowl</span><span>119</span></div>
                       </div>
                       <div className="menu-custom-category">
                          <h4>⭐ PREMIUM SALADS</h4>
                          <div className="menu-row-item"><span>Paneer Salad</span><span>169</span></div>
                          <div className="menu-row-item"><span>Chicken Salad</span><span>169</span></div>
                       </div>
                   </div>
                </div>

                <div className="menu-custom-footer">
                   FRESH. HEALTHY. FUEL YOUR MORNING.
                </div>
             </div>
          </div>
       </div>

       <div className="sub-sticky-footer" style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}>
          <div className="footer-flex">
             <button className="confirm-sync-btn" onClick={handleSendToWhatsApp}>
                <Send size={20} /> Message Routine to WhatsApp
             </button>
          </div>
       </div>
    </div>
  );
}
