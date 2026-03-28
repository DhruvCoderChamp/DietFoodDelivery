
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, ShoppingCart, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { items, totalItems, totalPrice, updateQty, removeItem, clearCart } = useCart();
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

  const deliveryFee = totalPrice >= 199 ? 0 : 30;
  const finalTotal = totalPrice + deliveryFee;

  return (
    <div className="cart-page page-enter">
      <div className="cart-header">
        <div className="container">
          <h1 className="cart-title">Your Cart</h1>
          <p className="cart-sub">{totalItems} item{totalItems !== 1 ? 's' : ''} • Morning delivery slot</p>
        </div>
      </div>

      <div className="container cart-content">
        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {totalPrice < 199 && (
              <div className="free-delivery-banner">
                <Tag size={14} />
                Add <strong>₹{199 - totalPrice}</strong> more for FREE delivery!
                <div className="free-delivery-bar">
                  <div className="free-delivery-fill" style={{ width: `${Math.min((totalPrice / 199) * 100, 100)}%` }}></div>
                </div>
              </div>
            )}

            {items.map(item => (
              <div className="cart-item" key={item.id}>
                <img src={item.image} alt={item.name} className="cart-item-img" />
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
              <div className="slot-label">🕕 Morning Delivery Slot</div>
              <div className="slot-options">
                {['6 AM – 7 AM', '7 AM – 8 AM', '8 AM – 9 AM'].map(slot => (
                  <label key={slot} className="slot-option">
                    <input type="radio" name="slot" defaultChecked={slot === '7 AM – 8 AM'} />
                    {slot}
                  </label>
                ))}
              </div>
            </div>

            <button className="btn-primary checkout-btn" onClick={async () => {
              // 1. Save order to Backend DB
              try {
                await fetch('http://localhost:8080/api/orders', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    customerName: 'WhatsApp Customer',
                    phone: 'Unknown',
                    address: 'TBD in WhatsApp',
                    items: items.map(i => ({ productId: i.id, name: i.name, quantity: i.quantity, price: i.price })),
                    totalAmount: finalTotal,
                    timeSlot: 'Morning',
                    status: 'Confirmed'
                  })
                });
              } catch (err) { console.error('Failed to save order to DB', err); }

              // 2. Redirect to WhatsApp
              const text = `Hello My Morning!\nI would like to place an order:%0a%0a` + 
                items.map(i => `${i.quantity}x ${i.name} (₹${i.price * i.quantity})`).join('%0a') +
                `%0a%0a*Subtotal:* ₹${totalPrice}%0a*Delivery Fee:* ${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}%0a*Total:* ₹${finalTotal}%0a%0aPlease let me know the estimated delivery time and payment details!`;
              window.open(`https://wa.me/919187532042?text=${text}`, '_blank');
              clearCart();
            }}>
              Order via WhatsApp <ArrowRight size={18} />
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
