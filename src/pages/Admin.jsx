
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Package, Users, TrendingUp, RefreshCw, X, Check, Shield, Menu as MenuIcon, MapPin, Phone, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import logoImg from '../assets/logo.png';
import './Admin.css';

const STATUS_COLORS = {
  'Delivered': '#27ae60',
  'Out for Delivery': '#e67e22',
  'Preparing': '#3498db',
  'Confirmed': '#9b59b6',
};

export default function Admin() {
  const { user, isAdmin, authFetch } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', calories: '', protein: '', category: 'bowls', badge: 'New', tags: [], description: '', image: '', isVeg: true, isAvailable: true, orderIndex: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((i) => i.id === active.id);
        const newIndex = prevItems.findIndex((i) => i.id === over.id);
        const reordered = arrayMove(prevItems, oldIndex, newIndex);
        
        // Update orderIndex locally for all items
        const updatedWithIndexes = reordered.map((item, idx) => ({
          ...item,
          orderIndex: idx
        }));

        // Fire and forget reorder update to backend
        authFetch('/api/admin/products/reorder', {
          method: 'PUT',
          body: JSON.stringify(updatedWithIndexes)
        }).catch(err => console.error('Bulk reorder failure', err));

        return updatedWithIndexes;
      });
    }
  };

  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      Promise.all([fetchItems(), fetchOrders()]).finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const fetchItems = async () => {
    try {
      const res = await authFetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)));
      } else {
        console.error('Expected array from products API, got:', data);
        setItems([]);
      }
    } catch (err) { console.error('Error fetching items', err); }
  };

  const fetchOrders = async () => {
    try {
      const res = await authFetch('/api/orders');
      const data = await res.json();
      if (Array.isArray(data)) {
        // Industry standard: newest orders at the top
        setOrders(data.sort((a, b) => (b.id || 0) - (a.id || 0)));
      } else {
        console.error('Expected array from orders API, got:', data);
        setOrders([]);
      }
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
    { label: "Total Products", value: loading ? '...' : items.length, icon: <RefreshCw size={22} />, color: 'orange' },
    { label: "Total Orders", value: loading ? '...' : orders.length, icon: <Package size={22} />, color: 'green' },
    { label: "Revenue", value: loading ? '...' : `₹${orders.reduce((acc, o) => acc + o.totalAmount, 0)}`, icon: <TrendingUp size={22} />, color: 'blue' },
    { label: 'Active Customers', value: loading ? '...' : new Set(orders.map(o => o.phone)).size, icon: <Users size={22} />, color: 'purple' },
  ];

  const handleDelete = async (id) => {
    if (window.confirm('Permanent deletion of this product. Proceed?')) {
      // OPTIMISTIC UI: Remove item instantly from local state
      const originalItems = [...items];
      setItems(prev => prev.filter(item => item.id !== id));
      
      try {
        const res = await authFetch(`/api/admin/products/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed on server');
        
        // Success: Trigger cache invalidation for the rest of the app
        window.dispatchEvent(new Event('mm-products-updated'));
      } catch (err) { 
        console.error('CRITICAL: Error deleting product', err); 
        alert('NETWORK ERROR: Could not sync deletion. Restoring item.');
        // ROLLBACK: Restore items if the API call fails
        setItems(originalItems);
      }
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await authFetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      fetchOrders();
    } catch (err) { console.error('Error updating order', err); }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // Increase limit slightly as we compress now
        alert("IMAGE TOO LARGE: Please upload an image smaller than 10MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // LEAD DEV COMPRESSION ENGINE
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const MAX_WIDTH = 800; // Optimal for web display
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Export high-quality but compressed JPEG (smaller than PNG for food photos)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.75); 
          setNewItem({ ...newItem, image: dataUrl });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveItem = async () => {
    // Robust validation for mobile users
    if (!newItem.name) { alert("ERROR: Please enter a product name."); return; }
    if (!newItem.price) { alert("ERROR: Please enter a price."); return; }
    
    setIsSaving(true);
    try {
      // Explicit type casting ensures compatibility with Spring Boot Double/Integer types
      const savedPayload = {
        ...newItem,
        price: Number(newItem.price),
        calories: Number(newItem.calories || 0),
        protein: Number(newItem.protein || 0),
        orderIndex: Number(newItem.orderIndex || 0)
      };

      let res;
      if (editItem) {
        res = await authFetch(`/api/admin/products/${editItem.id}`, {
          method: 'PUT',
          body: JSON.stringify(savedPayload)
        });
      } else {
        res = await authFetch('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(savedPayload)
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        alert(`API ERROR: ${res.status} - ${errorText}`);
        return;
      }

      const savedItem = await res.json();
      
      // LEAD DEV OPTIMIZATION: Update local state without fetching everything again
      setItems(prev => {
        if (editItem) {
          return prev.map(i => i.id === savedItem.id ? savedItem : i);
        } else {
          return [...prev, savedItem].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
        }
      });

      // Broadcast global event for user menu sync
      window.dispatchEvent(new Event('mm-products-updated'));
      
      setShowAddModal(false);
      setEditItem(null);
      setNewItem({ name: '', price: '', calories: '', protein: '', category: 'bowls', badge: 'New', tags: [], description: '', image: '', isVeg: true, isAvailable: true, orderIndex: items.length });
    } catch (err) { 
      console.error('CRITICAL: Error saving item', err); 
      alert('NETWORK ERROR: Connection failed. Check your signal.');
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setNewItem(item);
    setShowAddModal(true);
  };

  return (
    <div className={`admin-page ${sidebarOpen ? 'sidebar-open' : ''} page-enter`}>
      {/* Mobile Header Bar */}
      <header className="admin-mobile-header">
        <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
          <MenuIcon size={24} />
        </button>
        <span className="mobile-header-title">
          {activeTab === 'dashboard' ? 'Overview' : activeTab === 'orders' ? 'Orders' : 'Products'}
        </span>
        <button className="mobile-add-btn" onClick={() => { setActiveTab('menu'); setShowAddModal(true); }}>
          <Plus size={20} />
        </button>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay-bg" onClick={() => setSidebarOpen(false)}></div>}

      <div className="admin-layout">
        <aside className="admin-sidebar shadow-lg">
          <div className="sidebar-header">
            <div className="admin-logo">
              <img src={logoImg} alt="My Morning" style={{ width: 40, height: 40, objectFit: 'contain', borderRadius: 8, background: 'rgba(255,255,255,0.1)', padding: 4 }} />
              <div>
                <div className="admin-logo-name">My Morning</div>
                <div className="admin-logo-tag">Admin Panel</div>
              </div>
            </div>
            <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>
          
          <nav className="sidebar-nav">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'orders', label: 'Orders', icon: '📦' },
              { id: 'menu', label: 'Manage Products', icon: '🍱' },
            ].map(tab => (
              <button 
                key={tab.id} 
                className={`sidebar-item ${activeTab === tab.id ? 'sidebar-active' : ''}`} 
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              >
                <span className="sidebar-item-icon">{tab.icon}</span> 
                <span className="sidebar-item-label">{tab.label}</span>
              </button>
            ))}
          </nav>
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
                  <div 
                    className={`stat-card stat-${s.color}`} 
                    key={s.label}
                    onClick={() => {
                      if (s.label.includes('Products')) setActiveTab('menu');
                      if (s.label.includes('Orders') || s.label.includes('Revenue') || s.label.includes('Customers')) setActiveTab('orders');
                    }}
                    style={{ cursor: 'pointer' }}
                  >
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
              <div className="admin-mobile-header">
          <button className="menu-toggle-btn" onClick={() => setSidebarOpen(true)}>
            <MenuIcon size={24} />
          </button>
          <div className="mobile-header-title">Admin</div>
          <button 
            type="button"
            className="mobile-add-btn" 
            onClick={() => {
              setShowAddModal(true);
              setNewItem({ name: '', price: '', calories: '', protein: '', category: 'bowls', badge: 'New', tags: [], description: '', image: '', isVeg: true, isAvailable: true, orderIndex: items.length });
              setEditItem(null);
            }}
          >
            <Plus size={20} />
          </button>
        </div>
              <div className="admin-top-bar">
                <div className="admin-page-title">Products ({items.length})</div>
                <button className="btn-primary" onClick={() => { setEditItem(null); setNewItem({ name: '', price: '', calories: '', protein: '', category: 'bowls', badge: 'New', tags: [], description: '', image: '', isVeg: true, isAvailable: true, orderIndex: items.length }); setShowAddModal(true); }}>
                  <Plus size={16} /> Add Product
                </button>
              </div>
              <div className="admin-menu-grid">
                <DndContext 
                  sensors={sensors} 
                  collisionDetection={closestCenter} 
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={items} strategy={rectSortingStrategy}>
                    {items.map(item => (
                      <SortableItem key={item.id} id={item.id} item={item} onEdit={openEdit} onDelete={handleDelete} />
                    ))}
                  </SortableContext>
                </DndContext>
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
                    {['Protein Bowl', 'Smoothie', 'Breakfast', 'combos', 'Eggitarian', 'keto'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <label className="form-label">Diet Preference</label>
                  <div style={{ display: 'flex', gap: 15 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                      <input type="radio" name="diet" checked={newItem.isVeg} onChange={() => setNewItem(p => ({ ...p, isVeg: true }))} />
                      <span style={{ color: '#27ae60' }}>🟢 Veg</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                      <input type="radio" name="diet" checked={!newItem.isVeg} onChange={() => setNewItem(p => ({ ...p, isVeg: false }))} />
                      <span style={{ color: '#e74c3c' }}>🔴 Non-Veg</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Quantity Toggle</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                    <input type="checkbox" checked={newItem.isAvailable} onChange={e => setNewItem(p => ({ ...p, isAvailable: e.target.checked }))} /> 
                    <span>Available in Stock</span>
                  </label>
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
              {(newItem.image || (editItem && editItem.id)) && (
                <img 
                  src={newItem.image || `/api/products/${editItem.id}/image`} 
                  alt="preview" 
                  style={{ height: 100, width: 100, objectFit: 'cover', borderRadius: 8, marginTop: 10 }} 
                />
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-ghost" onClick={() => setShowAddModal(false)} disabled={isSaving}>Cancel</button>
              <button 
                type="button"
                className={`btn-primary ${isSaving ? 'btn-loading' : 'btn-dark-admin'}`} 
                onClick={handleSaveItem} 
                disabled={isSaving}
              >
                {isSaving ? (
                  <><RefreshCw size={15} className="spinner" /> Saving...</>
                ) : (
                  <><Check size={15} /> Save Product</>
                )}
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
            <tr key={order.id} className="order-row">
              <td data-label="Order ID"><span className="order-id">{order.orderId}</span></td>
              <td data-label="Customer">
                <div className="order-customer">{order.customerName}</div>
                <div className="order-phone"><Phone size={12} style={{marginRight: 4, transform: 'translateY(2px)'}}/>{order.phone}</div>
              </td>
              <td data-label="Items" className="order-items">{order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
              <td data-label="Total"><strong style={{ color: 'var(--green-main)' }}>₹{order.totalAmount}</strong></td>
              <td data-label="Address" className="order-address" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4, fontSize: 13 }}>
                {order.address.split(/(https?:\/\/maps\.google\.com[^\s]+)/g).map((part, i) =>
                  part.startsWith('http') ? (
                    <a key={i} href={part} target="_blank" rel="noreferrer" className="map-link" style={{ color: '#3498db', fontWeight: 600, display: 'inline-block', marginTop: 4 }}>
                      <MapPin size={14} style={{ transform: 'translateY(3px)', marginRight: 2 }}/> Open Map
                    </a>
                  ) : part
                )}
              </td>
              <td data-label="Status">
                <span className="order-status" style={{ background: (STATUS_COLORS[order.status]||'#000') + '20', color: STATUS_COLORS[order.status], border: `1px solid ${STATUS_COLORS[order.status]}40` }}>
                  {order.status}
                </span>
              </td>
              <td data-label="Update">
                <select className="status-select" value={order.status} onChange={e => onStatusChange(order.id, e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan="7">
                <div className="empty-state" style={{ padding: '40px 20px', background: 'transparent', width: '100%', border: 'none' }}>
                  <Package size={48} color="var(--text-muted)" />
                  <p>No orders currently available.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function SortableItem(props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.6 : 1,
    position: 'relative'
  };

  return (
    <div ref={setNodeRef} style={style} className="admin-menu-card-wrapper">
      <div className="admin-menu-card" style={{ opacity: props.item.isAvailable ? 1 : 0.6, height: '100%', marginBottom: 0 }}>
        <div className="drag-handle" {...attributes} {...listeners} style={{ position: 'absolute', top: 10, left: 10, zIndex: 5, background: 'rgba(255,255,255,0.9)', padding: 4, borderRadius: 6, cursor: 'grab', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <GripVertical size={16} />
        </div>
        <img 
          src={props.item.image && (props.item.image.startsWith('http') || props.item.image.startsWith('data:')) ? props.item.image : (props.item.id ? `/api/products/${props.item.id}/image?v=${props.item.orderIndex || 0}` : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400')} 
          alt={props.item.name} 
          className="admin-menu-img" 
        />
        <div className="admin-menu-body">
          <div className="admin-menu-name">{props.item.name}</div>
          <div className="admin-menu-meta">₹{props.item.price} · {props.item.category}</div>
          <div className="admin-menu-actions">
            <button className="btn-ghost" onClick={() => props.onEdit(props.item)}><Edit2 size={13} /> Edit</button>
            <button className="btn-ghost danger" onClick={() => props.onDelete(props.item.id)}><Trash2 size={13} /> Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
