
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShoppingCart, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

export default function Cart() {
  const { items, totalItems, totalPrice, updateQty, removeItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="cart-page page-enter">
        <div className="empty-state" style={{ minHeight: '70vh' }}>
          <div className="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add some healthy meals to get started with your morning!</p>
          <Link to="/menu" className="btn-primary" style={{ marginTop: 8 }}>
            <ShoppingBag size={16} /> Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  const deliveryFee = 0;
  const finalTotal = totalPrice;

  return (
    <div className="cart-page page-enter">
      <div className="cart-header">
        <div className="container">
          <h1 className="cart-title">Your Cart</h1>
          <p className="cart-sub">{totalItems} item{totalItems !== 1 ? 's' : ''} • Delivery Slot Selection</p>
        </div>
      </div>

      <div className="container cart-content">
        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {items.map(item => (
              <div className="cart-item" key={item.id}>
                <img 
                  src={item.image || (item.id ? `/api/products/${item.id}/image` : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400')} 
                  alt={item.name} 
                  className="cart-item-img" 
                />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-meta">
                    🔥 {item.calories} kcal · 💪 {item.protein}g protein
                  </div>
                  <div className="cart-item-price">₹{item.price} each</div>
                </div>
                <div className="cart-item-actions">
                  <div className="qty-control">
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity - 1)}>−</button>
                    <span className="qty-val">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <div className="cart-item-subtotal">₹{item.price * item.quantity}</div>
                  <button className="remove-btn" onClick={() => removeItem(item.id)}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>
            <div className="summary-rows">
              <div className="summary-row">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{totalPrice}</span>
              </div>
              <div className="summary-row">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? 'free-text' : ''}>
                  {deliveryFee === 0 ? '🎉 FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="divider"></div>
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>

            <div className="slot-picker">
              <div className="slot-label">🕒 Delivery Hours: 6 AM – 10 PM</div>
              <p style={{ fontSize: '12px', color: '#6b8a5e', margin: '4px 0 12px' }}>
                Pick your exact slot on the next page. <strong>30-minute delivery promise! ⚡</strong>
              </p>
            </div>

            <button className="btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
              {user ? 'Proceed to Checkout' : 'Login to Checkout'} <ArrowRight size={18} />
            </button>
            <Link to="/menu" className="continue-link">
              <ShoppingCart size={14} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
