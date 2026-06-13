
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit2, Trash2, Package, Users, TrendingUp, RefreshCw, X, Check, Shield, Menu as MenuIcon, MapPin, Phone, GripVertical, LogOut } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import logoImg from '../assets/logo.png';
import * as XLSX from 'xlsx';
import { formatMealsForReport } from '../utils/subscriptions';
import './Admin.css';

const STATUS_COLORS = {
  'In Progress': '#f39c12',
  'Confirmed': '#9b59b6',
  'Delivered': '#27ae60',
  'Denied': '#c0392b'
};

export default function Admin() {
  const { user, isAdmin, authFetch } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [items, setItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [homepageImage, setHomepageImage] = useState('');
  const [homepageImageSaving, setHomepageImageSaving] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', calories: '', protein: '', category: 'bowls', badge: 'New', tags: [], description: '', image: '', isVeg: true, isAvailable: true, orderIndex: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Excel Edit Grid States
  const [gridData, setGridData] = useState([]);
  const [modifiedRowIds, setModifiedRowIds] = useState(new Set());
  const [isBulkSaving, setIsBulkSaving] = useState(false);
  
  // Manual Order state
  const [manualOrder, setManualOrder] = useState({ name: '', phone: '', address: '', timeSlot: '', details: '', price: '' });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(new Date().toDateString());
  const [calendarOffset, setCalendarOffset] = useState(0);

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
      Promise.all([fetchItems(), fetchOrders(), fetchSubscriptions(), fetchHomepageImage()]).finally(() => setLoading(false));
    }
  }, [isAdmin]);

  const createBlankRow = (index) => ({
    tempId: `temp-${Date.now()}-${index}`,
    name: '',
    price: '',
    calories: '',
    protein: '',
    category: '',
    isVeg: '',
    isAvailable: '',
    description: '',
    image: '',
    badge: 'New',
    tags: []
  });

  const generateInitialBlankRows = (count = 10) => {
    return Array.from({ length: count }, (_, i) => createBlankRow(i));
  };

  useEffect(() => {
    setGridData(generateInitialBlankRows(10));
    setModifiedRowIds(new Set());
  }, [activeTab]);

  const handleGridCellChange = (tempId, field, value) => {
    setGridData(prev => prev.map(item => {
      if (item.tempId === tempId) {
        return { ...item, [field]: value };
      }
      return item;
    }));
    setModifiedRowIds(prev => {
      const newSet = new Set(prev);
      newSet.add(tempId);
      return newSet;
    });
  };

  const handleAddGridRow = () => {
    setGridData(prev => [...prev, createBlankRow(prev.length)]);
  };

  const handleBulkCancel = () => {
    if (window.confirm("Discard all edits and clear the sheet?")) {
      setGridData(generateInitialBlankRows(10));
      setModifiedRowIds(new Set());
    }
  };

  const handleBulkSave = async () => {
    const rowsToSave = gridData.filter(row => row.name.trim() !== '' || row.price !== '');

    if (rowsToSave.length === 0) {
      alert("No products have been entered. Please fill in Name and Price to save.");
      return;
    }

    for (const row of rowsToSave) {
      if (!row.name.trim()) {
        alert("Validation error: All entered products must have a Name.");
        return;
      }
      if (row.price === undefined || row.price === null || row.price === '' || isNaN(Number(row.price))) {
        alert(`Validation error: Product "${row.name}" must have a valid Price.`);
        return;
      }
      if (!row.category) {
        alert(`Validation error: Product "${row.name}" must have a selected Category.`);
        return;
      }
      if (row.isVeg === '') {
        alert(`Validation error: Product "${row.name}" must have a selected Diet Type.`);
        return;
      }
      if (row.isAvailable === '') {
        alert(`Validation error: Product "${row.name}" must have a selected Stock Status.`);
        return;
      }
    }

    setIsBulkSaving(true);
    try {
      const savePromises = rowsToSave.map(async (row) => {
        const payload = {
          name: row.name,
          price: Number(row.price),
          calories: Number(row.calories || 0),
          protein: Number(row.protein || 0),
          category: row.category,
          isVeg: row.isVeg,
          isAvailable: row.isAvailable,
          description: row.description || '',
          image: row.image || '',
          badge: row.badge || 'New',
          tags: row.tags || []
        };

        const res = await authFetch('/api/admin/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errMsg = await res.text();
          throw new Error(`Failed to save "${row.name}": ${res.status} - ${errMsg}`);
        }
      });

      await Promise.all(savePromises);
      alert("All new products saved successfully!");
      setModifiedRowIds(new Set());
      setGridData(generateInitialBlankRows(10));
      await fetchItems();
      window.dispatchEvent(new Event('mm-products-updated'));
    } catch (err) {
      console.error("Error bulk saving products:", err);
      alert(`Error saving products: ${err.message}`);
    } finally {
      setIsBulkSaving(false);
    }
  };

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

  const fetchSubscriptions = async () => {
    try {
      const response = await authFetch('/api/admin/subscriptions/all');
      const data = await response.json();
      setSubscriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subscriptions', error);
      setSubscriptions([]);
    }
  };

  const fetchHomepageImage = async () => {
    try {
      const response = await fetch('/api/settings/homepage_image');
      if (!response.ok) {
        setHomepageImage('');
        return;
      }
      const data = await response.json();
      setHomepageImage(data.value || '');
    } catch {
      setHomepageImage('');
    }
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
    { label: "Total Orders", value: loading ? '...' : orders.length, icon: <Package size={22} />, color: 'purple' },
    { label: "In Progress Orders", value: loading ? '...' : orders.filter(o => o.status === 'In Progress').length, icon: <RefreshCw size={22} />, color: 'orange' },
    { label: "Confirmed Orders", value: loading ? '...' : orders.filter(o => o.status === 'Confirmed').length, icon: <Check size={22} />, color: 'green' },
    { label: "Revenue", value: loading ? '...' : `₹${orders.filter(o => o.status !== 'Denied' && o.status !== 'In Progress').reduce((acc, o) => acc + o.totalAmount, 0)}`, icon: <TrendingUp size={22} />, color: 'blue' },
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
      const orderToUpdate = orders.find(o => o.id === orderId);
      await authFetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      fetchOrders();

      if (status === 'Confirmed' && orderToUpdate) {
        const text = `Hi ${orderToUpdate.customerName}, your order (${orderToUpdate.orderId}) has been Confirmed by My Morning! 🌅%0a%0aIt will be delivered as requested at ${orderToUpdate.timeSlot || 'the chosen time'}. Thank you! 💚`;
        window.location.href = `https://wa.me/91${orderToUpdate.phone}?text=${text}`;
      }
    } catch (err) { console.error('Error updating order', err); }
  };

  const handleManualOrderSubmit = async () => {
    if (!manualOrder.name || !manualOrder.phone || !manualOrder.address) {
      alert("Please fill all required fields");
      return;
    }
    const orderPayload = {
      customerName: manualOrder.name,
      phone: manualOrder.phone,
      address: manualOrder.address,
      timeSlot: manualOrder.timeSlot || 'ASAP (Within 30 mins)',
      status: 'In Progress',
      totalAmount: Number(manualOrder.price) || 0,
      items: [{
        name: manualOrder.details || 'Manual Order Item',
        quantity: 1,
        price: Number(manualOrder.price) || 0,
        image: ''
      }]
    };
    try {
      const res = await authFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });
      if (res.ok) {
        alert('Order created successfully in In Progress state!');
        fetchOrders();
        setManualOrder({ name: '', phone: '', address: '', timeSlot: '', details: '', price: '' });
      } else {
        alert('Failed to create order');
      }
    } catch (err) {
      console.error(err);
      alert('Network error while creating manual order');
    }
  };

  // Helper for Reports Delivery Buffer
  const getExpectedDelivery = (createdAt, timeSlot) => {
    if (timeSlot === 'ASAP (Within 30 mins)') {
      if (!createdAt) return 'Within 30 mins';
      const d = new Date(createdAt);
      d.setMinutes(d.getMinutes() + 30);
      return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    }
    return `${timeSlot} (+30m buffer)`;
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

  const handleHomepageImageUpload = event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Please upload an image smaller than 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = loadEvent => {
      const image = new Image();
      image.onload = async () => {
        const maxWidth = 1600;
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        const value = canvas.toDataURL('image/jpeg', 0.8);

        setHomepageImageSaving(true);
        try {
          const response = await authFetch('/api/admin/settings/homepage_image', {
            method: 'POST',
            body: JSON.stringify({ value }),
          });
          if (!response.ok) throw new Error('Image save failed');
          setHomepageImage(value);
          alert('Homepage image updated.');
        } catch (error) {
          console.error(error);
          alert('Could not update the homepage image.');
        } finally {
          setHomepageImageSaving(false);
          event.target.value = '';
        }
      };
      image.src = loadEvent.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleHomepageImageDelete = async () => {
    if (!window.confirm('Delete the custom homepage image and restore the default?')) return;
    setHomepageImageSaving(true);
    try {
      const response = await authFetch('/api/admin/settings/homepage_image', { method: 'DELETE' });
      if (!response.ok) throw new Error('Image delete failed');
      setHomepageImage('');
    } catch (error) {
      console.error(error);
      alert('Could not delete the homepage image.');
    } finally {
      setHomepageImageSaving(false);
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
      <header className="admin-mobile-header" style={{ flexDirection: 'column', height: 'auto', padding: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '15px 20px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <div className="admin-logo" style={{ margin: 0, padding: 0, border: 'none' }}>
            <img src={logoImg} alt="My Morning" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 8, background: 'var(--green-main)', padding: 4 }} />
            <div>
              <div className="admin-logo-name" style={{ color: '#111827', fontSize: '16px' }}>My Morning</div>
              <div className="admin-logo-tag" style={{ color: 'var(--green-main)' }}>Admin Panel</div>
            </div>
          </div>
          <button className="admin-logout-btn" style={{ background: '#c0392b', width: 36, height: 36 }} onClick={() => { authFetch('/api/auth/logout', {method: 'POST'}); window.location.href = '/login'; }}>
            <LogOut size={16} />
          </button>
        </div>
        <div className="mobile-admin-tabs" style={{ display: 'flex', overflowX: 'auto', width: '100%', padding: '0 20px', gap: '20px', background: '#fafafa', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'orders', label: 'Orders' },
            { id: 'menu', label: 'Products' },
            { id: 'excel_edit', label: 'Excel Edit' },
            { id: 'calendar', label: 'Calendar' },
            { id: 'reports', label: 'Reports' },
            { id: 'manual_order', label: 'Manual Order' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none', 
                border: 'none', 
                whiteSpace: 'nowrap', 
                fontSize: '14px', 
                fontWeight: activeTab === tab.id ? 700 : 500, 
                color: activeTab === tab.id ? 'var(--green-main)' : '#6B7280', 
                borderBottom: activeTab === tab.id ? '3px solid var(--green-main)' : '3px solid transparent', 
                padding: '12px 0',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
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
              { id: 'excel_edit', label: 'Excel Edit', icon: '📝' },
              { id: 'calendar', label: 'Calendar View', icon: '📅' },
              { id: 'reports', label: 'Reports & Export', icon: '📑' },
              { id: 'manual_order', label: 'Manual Order', icon: '➕' },
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="admin-avatar">{user.name[0]}</div>
              <div>
                <div className="admin-user-name">{user.name}</div>
                <div className="admin-user-role">Administrator</div>
              </div>
            </div>
            <button className="admin-logout-btn" onClick={() => { authFetch('/api/auth/logout', {method: 'POST'}); window.location.href = '/login'; }}>
              <LogOut size={16} />
            </button>
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

          {/* Calendar View */}
          {activeTab === 'calendar' && (
            <div>
              <div className="admin-page-title">Calendar View</div>
              <div style={{ padding: '20px', background: '#fff', borderRadius: '12px' }}>
                <div className="calendar-header">
                  <p style={{ margin: 0 }}>Select a date to view orders:</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={() => setCalendarOffset(prev => prev - 1)}>← Previous Week</button>
                    <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={() => setCalendarOffset(0)}>Today</button>
                    <button className="btn-ghost" style={{ fontSize: '12px' }} onClick={() => setCalendarOffset(prev => prev + 1)}>Next Week →</button>
                  </div>
                </div>
                <div className="calendar-grid">
                  {[...Array(7)].map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - 3 + i + (calendarOffset * 7));
                    const dayOrders = orders.filter(o => {
                      if (!o.createdAt) return false;
                      const oDate = new Date(o.createdAt);
                      return oDate.toDateString() === d.toDateString();
                    });
                    const isToday = d.toDateString() === new Date().toDateString();
                    return (
                      <div key={i} style={{ padding: '15px', border: isToday ? '2px solid var(--green-main)' : '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', background: (selectedCalendarDate === d.toDateString()) ? '#d4e8c8' : (dayOrders.length > 0 ? '#f0f9eb' : '#fafafa'), transform: selectedCalendarDate === d.toDateString() ? 'scale(1.02)' : 'none', transition: 'all 0.2s', boxShadow: selectedCalendarDate === d.toDateString() ? '0 4px 12px rgba(0,0,0,0.1)' : 'none' }} onClick={() => setSelectedCalendarDate(d.toDateString())}>
                        <div style={{ fontWeight: 'bold', color: isToday ? 'var(--green-main)' : 'inherit' }}>
                          {d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {isToday && <div style={{ fontSize: '10px', textTransform: 'uppercase' }}>Today</div>}
                        </div>
                        <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                          {dayOrders.slice(0, 2).map((o, idx) => <div key={idx}>📦 {o.customerName}</div>)}
                          {dayOrders.length > 2 && <div style={{ color: '#3498db' }}>+{dayOrders.length - 2} more</div>}
                          {dayOrders.length === 0 && <div style={{ color: '#aaa' }}>No orders</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginTop: '24px' }}>
                <div className="admin-section-title calendar-section-title">
                  <span>Orders for {new Date(selectedCalendarDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  <button 
                    className="btn-primary" 
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                    onClick={() => {
                      const dayOrders = orders.filter(o => o.createdAt && new Date(o.createdAt).toDateString() === selectedCalendarDate);
                      if (dayOrders.length === 0) {
                        alert("No orders to export for this date.");
                        return;
                      }
                      const exportData = dayOrders.map(o => ({
                        'Order ID': o.orderId,
                        'Customer Name': o.customerName,
                        'Phone': o.phone,
                        'Items': o.items.map(i => `${i.quantity}x ${i.name}`).join(', '),
                        'Total Amount': `₹${o.totalAmount}`,
                        'Address': o.address,
                        'Status': o.status,
                        'Time Slot': o.timeSlot || 'N/A',
                        'Order Time': o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A'
                      }));
                      const ws = XLSX.utils.json_to_sheet(exportData);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, "Daily Orders");
                      XLSX.writeFile(wb, `Orders_Report_${selectedCalendarDate.replace(/ /g, '_')}.xlsx`);
                    }}
                  >
                    📥 Export Day to Excel
                  </button>
                </div>
                <OrdersTable 
                  orders={orders.filter(o => o.createdAt && new Date(o.createdAt).toDateString() === selectedCalendarDate)} 
                  onStatusChange={handleStatusChange} 
                />
              </div>
            </div>
          )}

          {/* Reports */}
          {activeTab === 'reports' && (
            <div>
              <div className="admin-top-bar">
                <div className="admin-page-title">Reports & Analytics</div>
                <button className="btn-primary" onClick={() => {
                  const exportData = orders.map(o => ({
                    'Customer Name': o.customerName,
                    'Phone': o.phone,
                    'Order Raised Timing': o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A',
                    'Expected Delivery Timing': getExpectedDelivery(o.createdAt, o.timeSlot),
                    'Time Slot': o.timeSlot,
                    'Order Status': o.status,
                    'Delivery Status': o.status,
                    'Items': o.items.map(i => i.name).join(', '),
                    'Quantity': o.items.map(i => i.quantity).join(', '),
                    'Price': o.totalAmount,
                    'Payment Method': 'Online / COD',
                    'Payment Status': 'Paid'
                  }));
                  const ws = XLSX.utils.json_to_sheet(exportData);
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Orders");
                  XLSX.writeFile(wb, "MyMorning_Orders_Report.xlsx");
                }}>
                  📥 Export to Excel
                </button>
              </div>
              <section className="admin-report-card homepage-image-manager">
                <div>
                  <div className="admin-section-title">Manage Homepage Image</div>
                  <p>Upload a fresh hero image or delete it to restore the default.</p>
                  <div className="homepage-image-actions">
                    <label className={`btn-primary ${homepageImageSaving ? 'btn-loading' : ''}`}>
                      {homepageImageSaving ? 'Saving...' : homepageImage ? 'Replace Image' : 'Upload Image'}
                      <input type="file" accept="image/*" onChange={handleHomepageImageUpload} disabled={homepageImageSaving} hidden />
                    </label>
                    {homepageImage && (
                      <button className="btn-outline danger-outline" onClick={handleHomepageImageDelete} disabled={homepageImageSaving}>
                        Delete Image
                      </button>
                    )}
                  </div>
                </div>
                <div className="homepage-image-preview">
                  <img
                    src={homepageImage || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80'}
                    alt="Current homepage hero"
                  />
                  {!homepageImage && <span>Default image</span>}
                </div>
              </section>
              <div style={{ overflowX: 'auto', background: '#fff', borderRadius: '12px', padding: '15px' }}>
                <table className="orders-table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Phone</th>
                      <th>Order Raised At</th>
                      <th>Expected Delivery</th>
                      <th>Status</th>
                      <th>Items</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 50).map(o => (
                      <tr key={o.id} className="order-row">
                        <td data-label="Customer Name">{o.customerName}</td>
                        <td data-label="Phone">{o.phone}</td>
                        <td data-label="Order Raised At">{o.createdAt ? new Date(o.createdAt).toLocaleString() : '-'}</td>
                        <td data-label="Expected Delivery"><strong style={{ color: 'var(--green-main)' }}>{getExpectedDelivery(o.createdAt, o.timeSlot)}</strong></td>
                        <td data-label="Status">{o.status}</td>
                        <td data-label="Items">{o.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}</td>
                        <td data-label="Total">₹{o.totalAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <section className="admin-report-card subscription-report">
                <div className="admin-top-bar">
                  <div>
                    <div className="admin-section-title">Subscription Reports</div>
                    <p>{subscriptions.length} saved subscription{subscriptions.length === 1 ? '' : 's'}</p>
                  </div>
                  <button className="btn-primary" onClick={() => {
                    if (!subscriptions.length) {
                      alert('No subscriptions to export.');
                      return;
                    }
                    const exportData = subscriptions.map(subscription => ({
                      'Customer Name': subscription.customerName || 'Unknown',
                      'Phone': subscription.phone || '',
                      'Plan': `${subscription.planType || ''} Days`,
                      'Status': subscription.status || '',
                      'Delivery Slot': subscription.deliverySlot || '',
                      'Selected Items': formatMealsForReport(subscription.mealsJson),
                      'Delivery Area': subscription.deliveryArea || '',
                      'Exact Address': subscription.address || '',
                      'Start Date': subscription.startDate ? new Date(subscription.startDate).toLocaleDateString('en-IN') : '',
                      'Remaining Days': subscription.remainingDays,
                    }));
                    const worksheet = XLSX.utils.json_to_sheet(exportData);
                    const workbook = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscriptions');
                    XLSX.writeFile(workbook, 'MyMorning_Subscriptions_Report.xlsx');
                  }}>
                    Export Subscriptions to Excel
                  </button>
                </div>
                <div className="report-table-scroll">
                  <table className="orders-table subscription-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Plan</th>
                        <th>Delivery</th>
                        <th>Selected Items</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map(subscription => (
                        <tr key={subscription.id} className="order-row">
                          <td data-label="Customer">
                            <strong>{subscription.customerName || 'Unknown'}</strong><br />
                            <small>{subscription.phone || 'No phone'}</small>
                          </td>
                          <td data-label="Plan">{subscription.planType} Days</td>
                          <td data-label="Delivery">
                            {subscription.deliveryArea || '-'}<br />
                            <small>{subscription.address || ''}</small><br />
                            <small>{subscription.deliverySlot || ''}</small>
                          </td>
                          <td data-label="Selected Items">{formatMealsForReport(subscription.mealsJson) || '-'}</td>
                          <td data-label="Status">{subscription.status || '-'}</td>
                        </tr>
                      ))}
                      {!subscriptions.length && (
                        <tr><td colSpan="5" className="empty-report">No saved subscriptions yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          )}

          {/* Manual Order */}
          {activeTab === 'manual_order' && (
            <div>
              <div className="admin-page-title">Manual Order Entry</div>
              <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', maxWidth: '600px' }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Customer Name</label>
                    <input className="form-input" placeholder="e.g., John Doe" value={manualOrder.name} onChange={e => setManualOrder({...manualOrder, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input className="form-input" placeholder="Phone Number" value={manualOrder.phone} onChange={e => setManualOrder({...manualOrder, phone: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <textarea className="form-input" placeholder="Full Delivery Address" rows="3" value={manualOrder.address} onChange={e => setManualOrder({...manualOrder, address: e.target.value})}></textarea>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Time Slot</label>
                    <input className="form-input" placeholder="e.g., ASAP (Within 30 mins)" value={manualOrder.timeSlot} onChange={e => setManualOrder({...manualOrder, timeSlot: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Total Amount (₹)</label>
                    <input className="form-input" type="number" placeholder="250" value={manualOrder.price} onChange={e => setManualOrder({...manualOrder, price: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Order Items Details</label>
                  <textarea className="form-input" placeholder="e.g., 2x Avocado Toast, 1x Green Smoothie" rows="2" value={manualOrder.details} onChange={e => setManualOrder({...manualOrder, details: e.target.value})}></textarea>
                </div>
                <button className="btn-primary" onClick={handleManualOrderSubmit} style={{ marginTop: '15px' }}>
                  <Plus size={16} /> Create Order
                </button>
              </div>
            </div>
          )}

          {/* Excel Edit Sheet */}
          {activeTab === 'excel_edit' && (
            <div>
              <div className="admin-top-bar">
                <div className="admin-page-title">Excel Sheet Editor</div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    className="btn-outline" 
                    onClick={handleBulkCancel} 
                    disabled={isBulkSaving}
                  >
                    Cancel
                  </button>
                  <button 
                    className={`btn-primary ${isBulkSaving ? 'btn-loading' : 'btn-dark-admin'}`} 
                    onClick={handleBulkSave} 
                    disabled={isBulkSaving}
                  >
                    {isBulkSaving ? (
                      <><RefreshCw size={15} className="spinner" /> Saving...</>
                    ) : (
                      <><Check size={15} /> Save Changes</>
                    )}
                  </button>
                </div>
              </div>

              {modifiedRowIds.size > 0 && (
                <div className="excel-alert-banner">
                  ⚠️ You have <strong>{modifiedRowIds.size}</strong> modified row{modifiedRowIds.size > 1 ? 's' : ''} with unsaved changes.
                </div>
              )}

              <div className="excel-grid-container">
                <table className="excel-grid-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px', textAlign: 'center' }}>Row</th>
                      <th>Product Name</th>
                      <th style={{ width: '120px' }}>Price (₹)</th>
                      <th style={{ width: '150px' }}>Category</th>
                      <th style={{ width: '110px' }}>Calories (kcal)</th>
                      <th style={{ width: '100px' }}>Protein (g)</th>
                      <th style={{ width: '130px' }}>Diet Type</th>
                      <th style={{ width: '140px' }}>Stock Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(gridData) && gridData.map((row, idx) => {
                      const isModified = modifiedRowIds.has(row.tempId);
                      return (
                        <tr key={row.tempId} className={isModified ? 'modified-row' : ''}>
                          <td className="excel-row-num" style={{ textAlign: 'center', background: '#f8fafc', fontWeight: 600, color: '#64748b' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <input 
                              type="text" 
                              className="excel-cell-input text-left" 
                              placeholder="Product Name"
                              value={row.name || ''} 
                              onChange={e => handleGridCellChange(row.tempId, 'name', e.target.value)}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="excel-cell-input text-right font-mono" 
                              placeholder="Price"
                              value={row.price === undefined || row.price === null ? '' : row.price} 
                              onChange={e => handleGridCellChange(row.tempId, 'price', e.target.value === '' ? '' : Number(e.target.value))}
                            />
                          </td>
                          <td>
                            <select 
                              className="excel-cell-select" 
                              value={row.category || ''} 
                              onChange={e => handleGridCellChange(row.tempId, 'category', e.target.value)}
                            >
                              <option value="">— Select Category —</option>
                              <option value="bowls">🥗 Bowls</option>
                              <option value="smoothies">🥤 Smoothies</option>
                              <option value="combos">🍱 Combos</option>
                              <option value="breakfast">🌅 Breakfast</option>
                              <option value="eggitarian">🥚 Eggitarian</option>
                            </select>
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="excel-cell-input text-right font-mono" 
                              placeholder=""
                              value={row.calories === undefined || row.calories === null ? '' : row.calories} 
                              onChange={e => handleGridCellChange(row.tempId, 'calories', e.target.value === '' ? '' : Number(e.target.value))}
                            />
                          </td>
                          <td>
                            <input 
                              type="number" 
                              className="excel-cell-input text-right font-mono" 
                              placeholder=""
                              value={row.protein === undefined || row.protein === null ? '' : row.protein} 
                              onChange={e => handleGridCellChange(row.tempId, 'protein', e.target.value === '' ? '' : Number(e.target.value))}
                            />
                          </td>
                          <td>
                            <select 
                              className="excel-cell-select" 
                              value={row.isVeg === '' ? '' : (row.isVeg ? 'veg' : 'nonveg')} 
                              onChange={e => handleGridCellChange(row.tempId, 'isVeg', e.target.value === '' ? '' : e.target.value === 'veg')}
                            >
                              <option value="">— Select Diet —</option>
                              <option value="veg">🟢 Veg</option>
                              <option value="nonveg">🔴 Non-Veg</option>
                            </select>
                          </td>
                          <td>
                            <select 
                              className="excel-cell-select" 
                              value={row.isAvailable === '' ? '' : (row.isAvailable ? 'available' : 'unavailable')} 
                              onChange={e => handleGridCellChange(row.tempId, 'isAvailable', e.target.value === '' ? '' : e.target.value === 'available')}
                            >
                              <option value="">— Select Stock —</option>
                              <option value="available">📦 In Stock</option>
                              <option value="unavailable">❌ Out of Stock</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-start' }}>
                <button 
                  className="btn-outline" 
                  onClick={handleAddGridRow}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, padding: '8px 16px', borderRadius: '10px' }}
                >
                  ➕ Add New Row
                </button>
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
                    {[
                      ['bowls', 'Bowls'],
                      ['smoothies', 'Smoothies'],
                      ['combos', 'Combos'],
                      ['breakfast', 'Breakfast'],
                      ['eggitarian', 'Eggitarian'],
                    ].map(([value, label]) => <option key={value} value={value}>{label}</option>)}
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
  const STATUS_OPTIONS = ['In Progress', 'Confirmed', 'Delivered', 'Denied'];
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
