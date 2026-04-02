
import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, ShoppingCart, Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { menuItems, categories } from '../data/menuData';
import './Menu.css';

const TAGS = ['All', 'High Protein', 'Low Carb', 'Veg', 'Non-Veg'];

export default function Menu() {
  const { addItem, items } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dbItems, setDbItems] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTags, setActiveTags] = useState([]);
  const [addedId, setAddedId] = useState(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setDbItems(data.filter(i => i.isAvailable))) // Only show available items on user menu
      .catch(err => console.error(err));
  }, []);

  const toggleTag = (tag) => {
    if (tag === 'All') return setActiveTags([]);
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const filtered = useMemo(() => {
    let list = dbItems;
    if (activeCategory !== 'all') list = list.filter(i => i.category === activeCategory);
    if (activeTags.length) {
      list = list.filter(i => activeTags.every(t => {
        if (t === 'High Protein') return i.tags.includes('high-protein') || i.protein > 20;
        if (t === 'Low Carb') return i.tags.includes('low-carb') || i.calories < 300;
        if (t === 'Veg') return i.isVeg;
        if (t === 'Non-Veg') return !i.isVeg;
        return true;
      }));
    }
    if (search.trim()) list = list.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [activeCategory, activeTags, search, dbItems]);

  const handleAdd = (item) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addItem(item);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  const getQtyInCart = (id) => items.find(i => i.id === id)?.quantity || 0;

  return (
    <div className="menu-page page-enter">
      {/* Header */}
      <div className="menu-header">
        <div className="container">
          <h1 className="menu-page-title">Our Fresh Menu</h1>
          <p className="menu-page-sub">Crafted daily. Delivered fresh. Choose your fuel. 🥗</p>
        </div>
      </div>

      <div className="container menu-content">
        {/* Search + Filter bar */}
        <div className="menu-toolbar">
          <div className="search-wrap">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search meals..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
              id="menu-search"
            />
            {search && <button className="search-clear" onClick={() => setSearch('')}><X size={14} /></button>}
          </div>

          <div className="filter-tags">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`tag ${tag === 'All' ? (activeTags.length === 0 ? 'tag-active' : 'tag-inactive') : (activeTags.includes(tag) ? 'tag-active' : 'tag-inactive')}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Category tabs */}
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`cat-tab ${activeCategory === cat.id ? 'cat-active' : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <div className="results-bar">
          <span>{filtered.length} item{filtered.length !== 1 ? 's' : ''} found</span>
          {(activeTags.length > 0 || search) && (
            <button className="clear-filters" onClick={() => { setActiveTags([]); setSearch(''); }}>
              <X size={12} /> Clear all filters
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🍽️</div>
            <h3>No meals found</h3>
            <p>Try adjusting your filters or search term</p>
          </div>
        ) : (
          <div className="menu-grid">
            {filtered.map(item => {
              const qty = getQtyInCart(item.id);
              const added = addedId === item.id;
              return (
                <div className="menu-card" key={item.id}>
                  <div className="menu-card-img-wrap">
                    <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} alt={item.name} className="menu-card-img" loading="lazy" />
                    <span className={`badge ${item.badge === 'High Protein' || item.badge === 'Max Protein' ? 'badge-red' : item.badge === 'Trending' || item.badge === 'New' ? 'badge-orange' : 'badge-green'} menu-badge`}>
                      {item.badge}
                    </span>
                    {qty > 0 && <div className="in-cart-tag">✓ {qty} in cart</div>}
                  </div>
                  <div className="menu-card-body">
                    <div className="menu-card-top">
                      <span className={`veg-dot ${item.isVeg ? 'veg' : 'non-veg'}`}></span>
                      <div className="menu-rating">
                        <Star size={12} fill="#f39c12" stroke="#f39c12" />
                        <span>{item.rating}</span>
                        <span className="review-count">({item.reviews})</span>
                      </div>
                    </div>
                    <h3 className="menu-card-name">{item.name}</h3>
                    <p className="menu-card-desc">{item.description}</p>
                    <div className="menu-macro-row">
                      <span className="macro">🔥 {item.calories} kcal</span>
                      <span className="macro">💪 {item.protein}g protein</span>
                    </div>
                    <div className="menu-card-footer">
                      <span className="menu-price">₹{item.price}</span>
                      <button
                        className={`add-btn ${added ? 'add-btn-added' : ''}`}
                        onClick={() => handleAdd(item)}
                        id={`add-${item.id}`}
                        disabled={!item.isAvailable}
                      >
                        {added ? '✓ Added!' : (!item.isAvailable ? 'Out of Stock' : '+ Add to Cart')}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
