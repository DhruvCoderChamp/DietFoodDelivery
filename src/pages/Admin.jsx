
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Package, Users, TrendingUp, RefreshCw, X, Check, Shield } from 'lucide-react';
import './Admin.css';

const STATUS_COLORS = {
  'Delivered': '#27ae60',
  'Out for Delivery': '#e67e22',
  'Preparing': '#3498db',
  'Confirmed': '#9b59b6',
};

export default function Admin() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', calories: '', protein: '', category: 'bowls', badge: 'New', tags: [], description: '', image: '', isVeg: true, isAvailable: true });

  useEffect(() => {
    if (isAdmin) {
      fetchItems();
      fetchOrders();
    }
  }, [isAdmin]);

  const fetchItems = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/products');
      const data = await res.json();
      setItems(data);
    } catch (err) { console.error('Error fetching items', err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (err) { console.error('Error fetching orders', err); }
  };

  if (!isAdmin) {
    return (
      <div className="admin-denied">
        <Shield size={52} />
        <h2>Access Denied</h2>
        <p>You need admin privileges to access this page.</p>
        <button className="btn-primary" onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  const stats = [
    { label: "Total Products", value: items.length, icon: <RefreshCw size={22} />, color: 'orange' },
    { label: "Total Orders", value: orders.length, icon: <Package size={22} />, color: 'green' },
    { label: "Revenue", value: `₹${orders.reduce((acc, o) => acc + o.totalAmount, 0)}`, icon: <TrendingUp size={22} />, color: 'blue' },
    { label: 'Active Customers', value: new Set(orders.map(o => o.phone)).size, icon: <Users size={22} />, color: 'purple' },
  ];

  const handleDelete = async (id) => {
    if (window.confirm('Delete this item?')) {
      try {
        await fetch(`http://localhost:8080/api/admin/products/${id}`, { method: 'DELETE' });
        fetchItems();
      } catch (err) { console.error('Error deleting', err); }
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await fetch(`http://localhost:8080/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchOrders();
    } catch (err) { console.error('Error updating order', err); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setNewItem({ ...newItem, image: reader.result }); };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = async () => {
    if (!newItem.name || !newItem.price) return;
    try {
      if (editItem) {
        await fetch(`http://localhost:8080/api/admin/products/${editItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });
      } else {
        await fetch('http://localhost:8080/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newItem)
        });
      }
      fetchItems();
      setShowAddModal(false);
      setEditItem(null);
      setNewItem({ name: '', price: '', calories: '', protein: '', category: 'bowls', badge: 'New', tags: [], description: '', image: '', isVeg: true, isAvailable: true });
    } catch (err) { console.error('Error saving item', err); }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setNewItem(item);
    setShowAddModal(true);
  };

  return (
    <div className="admin-page page-enter">
      {/* Sidebar */}
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-logo">
            <div style={{ fontSize: 28 }}>🥗</div>
            <div>
              <div className="admin-logo-name">My Morning</div>
              <div className="admin-logo-tag">Admin Panel</div>
            </div>
          </div>
          {[
            { id: 'dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'orders', label: 'Orders', icon: '📦' },
            { id: 'menu', label: 'Manage Products', icon: '🍱' },
          ].map(tab => (
            <button key={tab.id} className={`sidebar-item ${activeTab === tab.id ? 'sidebar-active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
          <div className="sidebar-divider"></div>
          <div className="admin-user-info">
            <div className="admin-avatar">{user.name[0]}</div>
            <div>
              <div className="admin-user-name">{user.name}</div>
              <div className="admin-user-role">Administrator</div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="admin-page-title">Dashboard Overview</div>
              <div className="stats-grid">
                {stats.map(s => (
                  <div className={`stat-card stat-${s.color}`} key={s.label}>
                    <div className="stat-card-icon">{s.icon}</div>
                    <div className="stat-card-num">{s.value}</div>
                    <div className="stat-card-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="admin-section-title">Recent Orders</div>
              <OrdersTable orders={orders.slice(0, 5)} onStatusChange={handleStatusChange} />
              <div className="admin-section-title" style={{ marginTop: 24 }}>Quick Actions</div>
              <div className="quick-actions">
                <button className="btn-primary" onClick={() => { setActiveTab('menu'); setShowAddModal(true); }}>
                  <Plus size={16} /> Add Product
                </button>
                <button className="btn-outline" onClick={() => setActiveTab('orders')}>
                  <Package size={16} /> View All Orders
                </button>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === 'orders' && (
            <div>
              <div className="admin-page-title">Order Management</div>
              <OrdersTable orders={orders} onStatusChange={handleStatusChange} />
            </div>
          )}

          {/* Menu */}
          {activeTab === 'menu' && (
            <div>
              <div className="admin-top-bar">
                <div className="admin-page-title">Products ({items.length})</div>
                <button className="btn-primary" onClick={() => { setEditItem(null); setNewItem({ name: '', price: '', calories: '', protein: '', category: 'bowls', badge: 'New', tags: [], description: '', image: '', isVeg: true, isAvailable: true }); setShowAddModal(true); }}>
                  <Plus size={16} /> Add Product
                </button>
              </div>
              <div className="admin-menu-grid">
                {items.map(item => (
                  <div className="admin-menu-card" key={item.id} style={{ opacity: item.isAvailable ? 1 : 0.6 }}>
                    <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} alt={item.name} className="admin-menu-img" />
                    <div className="admin-menu-body">
                      <div className="admin-menu-name">{item.name}</div>
                      <div className="admin-menu-meta">₹{item.price} · {item.category} {!item.isAvailable && '· 🛑 Out of Stock'}</div>
                      <div className="admin-menu-actions">
                        <button className="btn-ghost" onClick={() => openEdit(item)}><Edit2 size={13} /> Edit</button>
                        <button className="btn-ghost danger" onClick={() => handleDelete(item.id)}><Trash2 size={13} /> Delete</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal admin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editItem ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input className="form-input" placeholder="e.g., Avocado Toast" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-input" type="number" placeholder="150" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: +e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}>
                    {['Protein Bowl', 'Smoothie', 'Breakfast', 'keto'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label className="form-label">Toggles</label>
                  <div style={{ display: 'flex', gap: 15 }}>
                    <label><input type="checkbox" checked={newItem.isVeg} onChange={e => setNewItem(p => ({ ...p, isVeg: e.target.checked }))} /> Veg</label>
                    <label><input type="checkbox" checked={newItem.isAvailable} onChange={e => setNewItem(p => ({ ...p, isAvailable: e.target.checked }))} /> Available</label>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Calories (kcal)</label>
                  <input className="form-input" type="number" placeholder="200" value={newItem.calories} onChange={e => setNewItem(p => ({ ...p, calories: +e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Protein (g)</label>
                  <input className="form-input" type="number" placeholder="10" value={newItem.protein} onChange={e => setNewItem(p => ({ ...p, protein: +e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} placeholder="Ingredients, taste..." value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Image Upload (File)</label>
                  <input type="file" className="form-input" onChange={handleImageUpload} accept="image/*" />
                </div>
                <div className="form-group">
                  <label className="form-label">Or Image URL</label>
                  <input className="form-input" placeholder="https://..." value={newItem.image} onChange={e => setNewItem(p => ({ ...p, image: e.target.value }))} />
                </div>
              </div>
              {newItem.image && <img src={newItem.image} alt="preview" style={{ height: 100, objectFit: 'cover', borderRadius: 8, marginTop: 10 }} />}
            </div>
            <div className="modal-footer">
              <button className="btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveItem}>
                <Check size={15} /> Save Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrdersTable({ orders, onStatusChange }) {
  const STATUS_OPTIONS = ['Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
  return (
    <div className="orders-table-wrap">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Total</th>
            <th>Address</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.id}>
              <td><span className="order-id">{order.orderId}</span></td>
              <td>
                <div className="order-customer">{order.customerName}</div>
                <div className="order-phone">{order.phone}</div>
              </td>
              <td className="order-items">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
              <td><strong style={{ color: 'var(--green-main)' }}>₹{order.totalAmount}</strong></td>
              <td>{order.address}</td>
              <td>
                <span className="order-status" style={{ background: (STATUS_COLORS[order.status]||'#000') + '20', color: STATUS_COLORS[order.status], border: `1px solid ${STATUS_COLORS[order.status]}40` }}>
                  {order.status}
                </span>
              </td>
              <td>
                <select className="status-select" value={order.status} onChange={e => onStatusChange(order.id, e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
          {orders.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No orders yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
