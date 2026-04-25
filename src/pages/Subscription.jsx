import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Send } from 'lucide-react';
import './Subscription.css';

const DAYS = ['Sunday','Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const PLANS = [
  { id: 7, label: '7 Days' },
  { id: 14, label: '14 Days' },
  { id: 21, label: '21 Days' },
  { id: 30, label: '1 Month' }
];

const MENU = [
  'Fruit Bowl',
  'Salad Bowl',
  'Sprouts Bowl',
  'Fresh Juice',
  'Smoothie',
  'Protein Smoothie',
  'Oat meal bowl',
  'Smoothie bowl',
  'Avocado Toast',
  'Scrambled Egg Toast',
  'Boiled Eggs',
  'Paneer',
  'Chicken Breast'
];

export default function Subscription() {
  const { user } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState(7);
  const [showPlanner, setShowPlanner] = useState(false);
  const [activeDay, setActiveDay] = useState('Monday');
  const [mealPlan, setMealPlan] = useState({});

  const updateMeal = (meal, type) => {
    setMealPlan(prev => {
      const dayMeals = prev[activeDay] || [];

      if (type === 'add') {
        return {
          ...prev,
          [activeDay]: [...dayMeals, meal]
        };
      }

      if (type === 'remove') {
        const index = dayMeals.indexOf(meal);
        if (index > -1) {
          const updated = [...dayMeals];
          updated.splice(index, 1);
          return {
            ...prev,
            [activeDay]: updated
          };
        }
      }

      return prev;
    });
  };

  const handleSendToWhatsApp = () => {
    let routineText = '';

    DAYS.forEach(day => {
      const meals = mealPlan[day] || [];
      routineText += `\n${day}: ${meals.length ? meals.join(', ') : 'No selection'}`;
    });

    const rawMsg = `🌿 *New Subscription Request*\n
📅 *Plan:* ${selectedPlan} Days
👤 *Name:* ${user?.name || 'Customer'}

🗓 *Meal Plan:* 
${routineText}
`;

    const encoded = encodeURIComponent(rawMsg);
    window.open(`https://api.whatsapp.com/send?phone=919187532042&text=${encoded}`);
  };

  return (
    <div className="sub-dashboard">

      {/* CTA */}
      <div className="planner-cta-card">
        <div className="cta-text">
          <h2>Build Your Weekly Breakfast</h2>
          <p>Select your plan and create your meal routine.</p>

          {/* PLAN OPTIONS */}
          <div className="plan-options">
            {PLANS.map(plan => (
              <button
                key={plan.id}
                className={`plan-chip ${selectedPlan === plan.id ? 'active' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.label}
              </button>
            ))}
          </div>
        </div>

        <button className="planner-cta-btn" onClick={() => setShowPlanner(true)}>
          <Send size={18}/> Start Planning
        </button>
      </div>

      {/* MODAL */}
      {showPlanner && (
        <div className="planner-overlay">
          <div className="planner-modal">

            {/* LEFT DAYS */}
            <div className="planner-days">
              {DAYS.map(day => (
                <div
                  key={day}
                  className={`day-tab ${activeDay === day ? 'active' : ''}`}
                  onClick={() => setActiveDay(day)}
                >
                  <span>{day}</span>

                  {mealPlan[day]?.length > 0 && (
                    <span className="count-badge">
                      {mealPlan[day].length}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* RIGHT */}
            <div className="planner-content">

              <div className="planner-header">
                <h3>{activeDay}</h3>

                <button 
                  className="close-btn"
                  onClick={() => setShowPlanner(false)}
                >
                  ✕
                </button>
              </div>

              <div className="planner-list">
                {MENU.map(item => {
                  const qty = mealPlan[activeDay]?.filter(m => m === item).length || 0;

                  return (
                    <div key={item} className="planner-item">
                      <span>{item}</span>

                      {qty === 0 ? (
                        <button 
                          className="add-btn"
                          onClick={() => updateMeal(item, 'add')}
                        >
                          Add
                        </button>
                      ) : (
                        <div className="qty-stepper">
                          <button onClick={() => updateMeal(item, 'remove')}>−</button>
                          <span>{qty}</span>
                          <button onClick={() => updateMeal(item, 'add')}>+</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <button 
                className="planner-send"
                onClick={handleSendToWhatsApp}
              >
                Send Routine to WhatsApp
              </button>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}