import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Package, Clock, CheckCircle, ExternalLink, ChevronRight, 
  MapPin, ShoppingBag, Loader, AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

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
      case 'PENDING': return 'badge-orange';
      case 'PAID': return 'badge-green';
      case 'DELIVERED': return 'badge-green';
      case 'CANCELLED': return 'badge-red';
      default: return 'badge-green';
    }
  };

  if (loading) return (
    <div className="empty-state">
      <Loader className="spin" size={40} color="#2d6a1f" />
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
