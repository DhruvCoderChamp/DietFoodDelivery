import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Package, Clock, CheckCircle, ExternalLink, ChevronRight, 
  MapPin, ShoppingBag, Loader, AlertCircle, RefreshCw
} from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export default function Orders() {
  const { user, authFetch } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const resp = await authFetch(`/api/orders/user/${user.id}`);
      if (resp.ok) {
        const data = await resp.json();
        setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else if (resp.status === 403) {
        setError("Access Denied. Please ensure you are logged in correctly.");
      } else {
        setError("Failed to fetch orders. Please try again later.");
      }
    } catch (e) {
      console.error("Orders fetch error", e);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toUpperCase()) {
      case 'IN PROGRESS': return 'badge-orange';
      case 'CONFIRMED': return 'badge-blue';
      case 'DELIVERED': return 'badge-green';
      case 'DENIED': return 'badge-red';
      default: return 'badge-gray';
    }
  };

  if (loading) return (
    <div className="empty-state">
      <Loader className="spin" size={40} color="#257214ff" />
      <p>Fetching your order history...</p>
    </div>
  );

  if (error) return (
    <div className="empty-state">
      <AlertCircle size={48} color="#e74c3c" />
      <h3>Something went wrong</h3>
      <p>{error}</p>
      <button className="btn-primary" onClick={fetchOrders}>Try Again</button>
    </div>
  );

  // Check for an active order (In Progress or Confirmed)
  const activeOrder = orders.find(o => ['In Progress', 'Confirmed'].includes(o.status));
  if (activeOrder) {
    // Sync storage for the tracker if the user clicks it
    sessionStorage.setItem('mm_order_id', activeOrder.orderId || activeOrder.id);
    sessionStorage.setItem('mm_checkout', JSON.stringify({
       form: { name: activeOrder.customerName, phone: activeOrder.phone, address: activeOrder.address },
       total: activeOrder.totalAmount
    }));
  }

  return (
    <div className="page-enter" style={{ padding: '80px 0', background: '#fdfaf6', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '8px' }}>My Order History</h1>
          <p style={{ color: '#6b8a5e' }}>Track your previous and active orders from My Morning.</p>
        </div>

        {orders.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
            <ShoppingBag size={48} color="#d4e8c8" style={{ marginBottom: '16px' }} />
            <h3>No orders yet</h3>
            <p style={{ color: '#6b8a5e', marginBottom: '24px' }}>It seems you haven't placed any orders yet. Start your healthy journey now!</p>
            <Link to="/menu" className="btn-primary">Browse Menu</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {activeOrder && (
              <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, #fdfaf6 0%, #f0f9eb 100%)', border: '2px solid var(--green-main)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, right: 0, padding: '8px 16px', background: 'var(--green-main)', color: '#fff', fontSize: '12px', fontWeight: '800', borderBottomLeftRadius: '12px' }}>
                  ACTIVE ORDER
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ marginBottom: '8px' }}>Your Breakfast is Brewing! ☕</h3>
                    <p style={{ fontSize: '14px', color: '#6b8a5e', marginBottom: '16px' }}>Status: <strong style={{ color: 'var(--green-main)' }}>{activeOrder.status}</strong></p>
                    <Link to="/order-confirmation" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                       Track Live Order <ChevronRight size={16} />
                    </Link>
                  </div>
                  <div style={{ opacity: 0.2 }}>
                    <RefreshCw className="spin" size={64} />
                  </div>
                </div>
              </div>
            )}
            {orders.map(order => (
              <div key={order.id} className="card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: '#e8f5e0', padding: '10px', borderRadius: '12px' }}>
                      <Package size={20} color="#2d6a1f" />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '800' }}>Order #{order.id}</div>
                      <div style={{ fontSize: '12px', color: '#9db892' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <span className={`badge ${getStatusColor(order.status)}`}>{order.status}</span>
                </div>

                <div style={{ borderTop: '1px dashed #d4e8c8', borderBottom: '1px dashed #d4e8c8', padding: '16px 0', marginBottom: '16px' }}>
                   {order.items?.map((item, idx) => (
                     <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: '600', color: '#1a2e12' }}>{item.name} x{item.quantity}</span>
                        <span style={{ fontWeight: '700' }}>₹{item.price * item.quantity}</span>
                     </div>
                   ))}
                   {order.status === 'Denied' && (
                     <div style={{ marginTop: '12px', fontSize: '12px', color: '#e74c3c', background: '#fdf2f2', padding: '8px', borderRadius: '6px' }}>
                        <AlertCircle size={14} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '4px' }} />
                        Order unavailable: Kitchen running at full capacity.
                     </div>
                   )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ fontSize: '13px', color: '#6b8a5e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={14} /> Total Paid
                   </div>
                   <div style={{ fontSize: '18px', fontWeight: '900', color: '#2d6a1f' }}>₹{order.totalAmount}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
