import { useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Search, Send, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { deliveryAreas, menuItems } from '../data/menuData';
import { groupProductsByCategory, selectedCountForCategory } from '../utils/categories';
import { buildSubscriptionPayload } from '../utils/subscriptions';
import './Subscription.css';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const PLANS = [
  { id: 7, label: '7 Days' },
  { id: 14, label: '14 Days' },
  { id: 21, label: '21 Days' },
  { id: 30, label: '1 Month' },
];
const generateSlots = () => {
  const slots = [];
  for (let hour = 6; hour < 23; hour++) {
    const formatTime = (h, m) => {
      const displayHour = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      return `${displayHour}:${m === 0 ? '00' : '30'} ${ampm}`;
    };
    slots.push(`${formatTime(hour, 0)} - ${formatTime(hour, 30)}`);
    slots.push(`${formatTime(hour, 30)} - ${formatTime(hour + 1, 0)}`);
  }
  return slots;
};
const DELIVERY_SLOTS = generateSlots();

const loadDraft = () => {
  try {
    return JSON.parse(localStorage.getItem('mm_sub_data') || 'null');
  } catch {
    return null;
  }
};

const createDateDays = length => {
  const today = new Date();
  return Array.from({ length }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  });
};

export default function Subscription() {
  const { user, authFetch } = useAuth();
  const [dbProducts, setDbProducts] = useState([]);
  const initial = loadDraft();

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const data = await response.json();
          setDbProducts(data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription products:', error);
      }
    };
    fetchAllProducts();
  }, []);

  const allProducts = [...dbProducts];
  menuItems.forEach(item => {
    if (!allProducts.some(p => p.name.toLowerCase() === item.name.toLowerCase())) {
      allProducts.push(item);
    }
  });

  const [selectedPlan, setSelectedPlan] = useState(initial?.plan || 7);
  const [mode, setMode] = useState(initial?.mode || 'weekly');
  const [showPlanner, setShowPlanner] = useState(false);
  const [activeDay, setActiveDay] = useState('Monday');
  const [mealPlan, setMealPlan] = useState(initial?.meals || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [deliveryArea, setDeliveryArea] = useState(initial?.deliveryArea || '');
  const [address, setAddress] = useState(initial?.address || '');
  const [deliverySlot, setDeliverySlot] = useState(initial?.deliverySlot || DELIVERY_SLOTS[0]);
  const [expandedCategories, setExpandedCategories] = useState({ bowls: true });
  const [isSaving, setIsSaving] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);

  const days = mode === 'weekly' ? WEEK_DAYS : createDateDays(selectedPlan);
  const groupedProducts = groupProductsByCategory(allProducts, searchTerm);
  console.log('ALL PRODUCTS:', allProducts);
  console.log('GROUPED PRODUCTS:', groupedProducts);
  const hasPlan = Object.values(mealPlan).some(meals => meals?.length);

  useEffect(() => {
    localStorage.setItem('mm_sub_data', JSON.stringify({
      plan: selectedPlan,
      mode,
      meals: mealPlan,
      deliveryArea,
      address,
      deliverySlot,
    }));
  }, [selectedPlan, mode, mealPlan, deliveryArea, address, deliverySlot]);

  const changeMode = nextMode => {
    setMode(nextMode);
    setActiveDay(nextMode === 'weekly' ? WEEK_DAYS[0] : createDateDays(selectedPlan)[0]);
  };

  const updateMeal = (meal, action) => {
    setMealPlan(current => {
      const dayMeals = current[activeDay] || [];
      if (action === 'add') return { ...current, [activeDay]: [...dayMeals, meal] };

      const index = dayMeals.indexOf(meal);
      if (index < 0) return current;
      const updated = [...dayMeals];
      updated.splice(index, 1);
      return { ...current, [activeDay]: updated };
    });
  };

  const saveAndOpenWhatsApp = async () => {
    if (!user?.id) {
      alert('Please login before confirming your subscription.');
      return;
    }
    if (!deliveryArea || !address.trim()) {
      alert('Please select a delivery area and enter your exact address.');
      return;
    }

    const routineText = days
      .map(day => `${day}: ${mealPlan[day]?.length ? mealPlan[day].join(', ') : 'No selection'}`)
      .join('\n');
    const message = `New Subscription Request

Plan: ${selectedPlan} Days
Mode: ${mode === 'weekly' ? 'Weekly' : 'Date-wise'}
Name: ${user.name || 'Customer'}
Delivery Area: ${deliveryArea}
Exact Address: ${address.trim()}
Delivery Slot: ${deliverySlot}

Meal Plan:
${routineText}`;

    setIsSaving(true);
    try {
      const response = await authFetch('/api/subscriptions/save', {
        method: 'POST',
        body: JSON.stringify(buildSubscriptionPayload({
          userId: user.id,
          selectedPlan,
          mealPlan,
          deliveryArea,
          address,
          deliverySlot,
        })),
      });
      if (!response.ok) throw new Error(`Subscription save failed (${response.status})`);
      window.location.href = `https://wa.me/919187532042?text=${encodeURIComponent(message)}`;
    } catch (error) {
      console.error(error);
      alert('Could not save your subscription. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="sub-dashboard page-enter">
      {hasPlan ? (
        <div className="active-plan-container">
          <div className="active-plan-header">
            <div>
              <h1 className="active-plan-title">Your Healthy Routine</h1>
              <p className="active-plan-subtitle">Your meal routine for the next <strong>{selectedPlan} days</strong>.</p>
            </div>
            <div className="active-plan-actions">
              <button className="btn-outline" onClick={() => setShowPlanner(true)}>Edit Plan</button>
              <button className="btn-primary" onClick={() => setShowDeliveryForm(true)}>
                <Send size={16} /> Confirm & Send
              </button>
            </div>
          </div>

          <div className="active-plan-stats">
            <div className="stat-card"><span className="stat-label">Plan Duration</span><span className="stat-value">{selectedPlan} Days</span></div>
            <div className="stat-card"><span className="stat-label">Planning Mode</span><span className="stat-value">{mode === 'weekly' ? 'Weekly' : 'Date-wise'}</span></div>
            <div className="stat-card"><span className="stat-label">Total Items</span><span className="stat-value">{Object.values(mealPlan).flat().length} Selected</span></div>
            <div className="stat-card"><span className="stat-label">Delivery Area</span><span className="stat-value">{deliveryArea || 'Not set'}</span></div>
          </div>

          <div className="active-plan-grid">
            {days.map(day => {
              const meals = mealPlan[day] || [];
              return (
                <div key={day} className={`day-preview-card ${meals.length ? '' : 'empty'}`}>
                  <div className="day-preview-header">
                    <span className="day-name">{day}</span>
                    {!!meals.length && <span className="item-count">{meals.length} items</span>}
                  </div>
                  <div className="day-preview-content">
                    {meals.length ? (
                      <ul className="selected-items-list">{meals.map((meal, index) => <li key={`${meal}-${index}`}>{meal}</li>)}</ul>
                    ) : <span className="no-items-text">No meals selected</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <button className="btn-ghost" style={{ color: '#e74c3c' }} onClick={() => {
              if (window.confirm('This will permanently delete your current routine. Continue?')) {
                setMealPlan({});
                localStorage.removeItem('mm_sub_data');
              }
            }}>Clear My Routine</button>
          </div>
        </div>
      ) : (
        <div className="planner-cta-card">
          <div className="cta-text">
            <h2>Build Your Breakfast Plan</h2>
            <p>Select your plan and start customizing.</p>
            <div className="plan-options">
              {PLANS.map(plan => (
                <button key={plan.id} className={`plan-chip ${selectedPlan === plan.id ? 'active' : ''}`} onClick={() => setSelectedPlan(plan.id)}>
                  {plan.label}
                </button>
              ))}
            </div>
          </div>
          <button className="planner-cta-btn" onClick={() => setShowPlanner(true)}><Send size={18} /> Start Planning</button>
        </div>
      )}

      {showPlanner && (
        <div className="planner-overlay">
          <div className="planner-modal">
            <div className="planner-days">
              {days.map(day => (
                <button key={day} className={`day-tab ${activeDay === day ? 'active' : ''}`} onClick={() => setActiveDay(day)}>
                  <span>{day}</span>
                  {!!mealPlan[day]?.length && <span className="count-badge">{mealPlan[day].length}</span>}
                </button>
              ))}
            </div>

            <div className="planner-content">
              <div className="planner-header">
                <h3>{activeDay}</h3>
                <div className="planner-header-actions">
                  <button className="btn-ghost reset-plan-btn" onClick={() => {
                    if (window.confirm('Clear your entire selection and start over?')) setMealPlan({});
                  }}>Reset Plan</button>
                  <button className="close-btn" onClick={() => setShowPlanner(false)}><X size={18} /></button>
                </div>
              </div>

              <div className="mode-toggle">
                <button className={mode === 'weekly' ? 'active' : ''} onClick={() => changeMode('weekly')}>Weekly</button>
                <button className={mode === 'date' ? 'active' : ''} onClick={() => changeMode('date')}>Date</button>
              </div>

              {/* Location Grid removed from meal planning stage */}

              <div className="planner-search-container">
                <div className="search-box">
                  <Search size={16} />
                  <input type="text" placeholder="Search from menu..." value={searchTerm} onChange={event => setSearchTerm(event.target.value)} />
                  {searchTerm && <button className="clear-search" onClick={() => setSearchTerm('')}><X size={14} /></button>}
                </div>
              </div>

              <div className="planner-list">
                {groupedProducts.length ? groupedProducts.map(group => {
                  const expanded = expandedCategories[group.id];
                  const selectedCount = selectedCountForCategory(group.id, allProducts, mealPlan);
                  return (
                    <section className="meal-category" key={group.id}>
                      <button className="meal-category-header" onClick={() => setExpandedCategories(current => ({ ...current, [group.id]: !current[group.id] }))}>
                        <span className="meal-category-title">
                          {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          {group.label}
                        </span>
                        <span className="meal-category-count">{selectedCount} Selected</span>
                      </button>
                      {expanded && (
                        <div className="meal-category-items">
                          {group.items.map(item => {
                            const quantity = mealPlan[activeDay]?.filter(meal => meal === item.name).length || 0;
                            return (
                              <div key={item.name} className="planner-item">
                                <span>{item.name}</span>
                                {quantity === 0 ? (
                                  <button className="add-btn" onClick={() => updateMeal(item.name, 'add')}><Plus size={14} /> Add</button>
                                ) : (
                                  <div className="qty-stepper">
                                    <button onClick={() => updateMeal(item.name, 'remove')}>-</button>
                                    <span>{quantity}</span>
                                    <button onClick={() => updateMeal(item.name, 'add')}>+</button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>
                  );
                }) : <div className="no-results">No items found matching "{searchTerm}"</div>}
              </div>

              <button className="planner-send" onClick={() => {
                const totalMeals = Object.values(mealPlan).flat().length;
                if (totalMeals === 0) {
                  alert('Please select at least one meal before proceeding.');
                  return;
                }
                setShowPlanner(false);
                setShowDeliveryForm(true);
              }}>
                Proceed to Delivery Details
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeliveryForm && (
        <div className="planner-overlay">
          <div className="planner-modal delivery-details-modal">
            <div className="planner-content">
              <div className="planner-header">
                <h3>Delivery Details</h3>
                <button className="close-btn" onClick={() => setShowDeliveryForm(false)}><X size={18} /></button>
              </div>
              
              <div className="delivery-step-info">
                <p>Please enter your delivery area, slot, and exact address to complete your subscription request.</p>
              </div>
              
              <div className="subscription-location-grid focused">
                <label>
                  <span>Delivery Area *</span>
                  <select value={deliveryArea} onChange={event => setDeliveryArea(event.target.value)}>
                    <option value="">Select verified area</option>
                    {deliveryAreas.map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                </label>
                <label>
                  <span>Delivery Slot *</span>
                  <select value={deliverySlot} onChange={event => setDeliverySlot(event.target.value)}>
                    {DELIVERY_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                  </select>
                </label>
                <label className="address-field">
                  <span>Exact Address *</span>
                  <textarea rows="3" value={address} onChange={event => setAddress(event.target.value)} placeholder="House/flat number, building, street, and landmark" />
                </label>
              </div>
              
              <div className="delivery-actions">
                <button className="btn-outline" onClick={() => {
                  setShowDeliveryForm(false);
                  setShowPlanner(true);
                }}>
                  ← Back to Meals
                </button>
                <button className="planner-send" onClick={saveAndOpenWhatsApp} disabled={isSaving} style={{ margin: 0 }}>
                  {isSaving ? 'Saving...' : 'Confirm & Send to WhatsApp'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
