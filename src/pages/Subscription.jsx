import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { Send, Plus, Search, X } from 'lucide-react';
import './Subscription.css';

const WEEK_DAYS = [
 'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
];

const PLANS = [
  { id: 7, label: '7 Days' },
  { id: 14, label: '14 Days' },
  { id: 21, label: '21 Days' },
  { id: 30, label: '1 Month' }
];

export default function Subscription() {
  const { user } = useAuth();
  const { products } = useProducts();

  const [selectedPlan, setSelectedPlan] = useState(7);
  const [mode, setMode] = useState('weekly'); // weekly | date
  const [showPlanner, setShowPlanner] = useState(false);
  const [activeDay, setActiveDay] = useState('Sunday');
  const [mealPlan, setMealPlan] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // 🔹 Combine static quick picks with dynamic products
  const QUICK_PICKS = [
    'Fruit Bowl','Salad Bowl','Fresh Juice','Smoothie'
  ];

  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .map(p => p.name);

  const DISPLAY_MENU = searchTerm 
    ? filteredProducts 
    : [...new Set([...QUICK_PICKS, ...products.map(p => p.name)])];

  // 🔹 Generate date-wise days
  const getDateDays = () => {
  const days = [];
  const today = new Date();

  for (let i = 0; i < selectedPlan; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);

    const formatted = d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });

    days.push(formatted);
  }

  return days;
};

  // 🔹 Final days based on mode
  const DAYS = mode === 'weekly' ? WEEK_DAYS : getDateDays();

  // 🔹 Reset when mode or plan changes
  useEffect(() => {
    const firstDay =
      mode === 'weekly'
        ? WEEK_DAYS[0]
        : getDateDays()[0];

    setMealPlan({});
    setActiveDay(firstDay);
  }, [mode, selectedPlan]);

  // 🔹 Add/remove meals
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

  // 🔹 WhatsApp send
  const handleSendToWhatsApp = () => {
    let routineText = '';

    DAYS.forEach(day => {
      const meals = mealPlan[day] || [];
      routineText += `\n${day}: ${meals.length ? meals.join(', ') : 'No selection'}`;
    });

    const rawMsg = `🌿 *New Subscription Request*\n
📅 *Plan:* ${selectedPlan} Days
📊 *Mode:* ${mode === 'weekly' ? 'Weekly' : 'Date-wise'}
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
          <h2>Build Your Breakfast Plan</h2>
          <p>Select your plan and start customizing.</p>

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

        <button 
          className="planner-cta-btn"
          onClick={() => setShowPlanner(true)}
        >
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

              {/* 🔥 TOGGLE INSIDE MODAL */}
              <div className="mode-toggle">
                <button
                  className={mode === 'weekly' ? 'active' : ''}
                  onClick={() => setMode('weekly')}
                >
                  Weekly
                </button>

                <button
                  className={mode === 'date' ? 'active' : ''}
                  onClick={() => setMode('date')}
                >
                  Date
                </button>
              </div>

              {/* SEARCH & ADD */}
              <div className="planner-search-container">
                <div className="search-box">
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="Search from menu..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button className="clear-search" onClick={() => setSearchTerm('')}>
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* MENU */}
              <div className="planner-list">
                {DISPLAY_MENU.length > 0 ? DISPLAY_MENU.map(item => {
                  const qty =
                    mealPlan[activeDay]?.filter(m => m === item).length || 0;

                  return (
                    <div key={item} className="planner-item">
                      <span>{item}</span>

                      {qty === 0 ? (
                        <button 
                          className="add-btn"
                          onClick={() => updateMeal(item, 'add')}
                        >
                          <Plus size={14} /> Add
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
                }) : (
                  <div className="no-results">
                    No items found matching "{searchTerm}"
                  </div>
                )}
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