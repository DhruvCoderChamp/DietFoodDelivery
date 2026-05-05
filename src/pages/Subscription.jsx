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

  // 🔹 Load saved data from localStorage
  const getInitialState = () => {
    try {
      const saved = localStorage.getItem('mm_sub_data');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  };

  const initialState = getInitialState();

  const [selectedPlan, setSelectedPlan] = useState(initialState?.plan || 7);
  const [mode, setMode] = useState(initialState?.mode || 'weekly'); // weekly | date
  const [showPlanner, setShowPlanner] = useState(false);
  const [activeDay, setActiveDay] = useState('Sunday');
  const [mealPlan, setMealPlan] = useState(initialState?.meals || {});
  const [searchTerm, setSearchTerm] = useState('');

  // 🔹 Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('mm_sub_data', JSON.stringify({
      plan: selectedPlan,
      mode: mode,
      meals: mealPlan
    }));
  }, [selectedPlan, mode, mealPlan]);

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

  // 🔹 Update active day when mode or plan changes, but don't wipe the whole plan
  useEffect(() => {
    const firstDay =
      mode === 'weekly'
        ? WEEK_DAYS[0]
        : getDateDays()[0];

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
    window.location.href = `https://wa.me/919187532042?text=${encoded}`;
  };

  const hasPlan = Object.values(mealPlan).some(meals => meals && meals.length > 0);

  return (
    <div className="sub-dashboard page-enter">
      
      {hasPlan ? (
        <div className="active-plan-container">
          <div className="active-plan-header">
            <div>
              <h1 className="active-plan-title">Your Healthy Routine 🌿</h1>
              <p className="active-plan-subtitle">Here is the routine you've built for the next <strong>{selectedPlan} Days</strong>.</p>
            </div>
            <div className="active-plan-actions">
              <button className="btn-outline" onClick={() => setShowPlanner(true)}>✏️ Edit Plan</button>
              <button className="btn-primary" onClick={handleSendToWhatsApp}>
                <Send size={16} /> Send to WhatsApp
              </button>
            </div>
          </div>

          <div className="active-plan-stats">
            <div className="stat-card">
              <span className="stat-label">Plan Duration</span>
              <span className="stat-value">{selectedPlan} Days</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Planning Mode</span>
              <span className="stat-value">{mode === 'weekly' ? 'Weekly' : 'Date-wise'}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Items</span>
              <span className="stat-value">{Object.values(mealPlan).flat().length} Selected</span>
            </div>
          </div>

          <div className="active-plan-grid">
            {DAYS.map(day => {
              const dayMeals = mealPlan[day] || [];
              return (
                <div key={day} className={`day-preview-card ${dayMeals.length === 0 ? 'empty' : ''}`}>
                  <div className="day-preview-header">
                    <span className="day-name">{day}</span>
                    {dayMeals.length > 0 && <span className="item-count">{dayMeals.length} items</span>}
                  </div>
                  <div className="day-preview-content">
                    {dayMeals.length > 0 ? (
                      <ul className="selected-items-list">
                        {dayMeals.map((m, idx) => <li key={idx}>🥗 {m}</li>)}
                      </ul>
                    ) : (
                      <span className="no-items-text">No meals selected</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
             <button 
               className="btn-ghost" 
               style={{ color: '#e74c3c' }}
               onClick={() => {
                 if (window.confirm("This will permanently delete your current routine. Continue?")) {
                   setMealPlan({});
                   localStorage.removeItem('mm_sub_data');
                 }
               }}
             >
               🗑️ Clear My Routine
             </button>
          </div>
        </div>
      ) : (
        /* INITIAL CTA */
        <div className="planner-cta-card">
          <div className="cta-text">
            <h2>Build Your Breakfast Plan</h2>
            <p>Select your plan and start customizing.</p>

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
      )}

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

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    className="btn-ghost" 
                    style={{ fontSize: '11px', color: '#e74c3c' }}
                    onClick={() => {
                      if (window.confirm("Clear your entire selection and start over?")) {
                        setMealPlan({});
                      }
                    }}
                  >
                    Reset Plan
                  </button>
                  <button 
                    className="close-btn"
                    onClick={() => setShowPlanner(false)}
                  >
                    ✕
                  </button>
                </div>
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