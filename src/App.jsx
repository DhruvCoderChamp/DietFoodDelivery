
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProductsProvider } from './context/ProductsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import OrderConfirmation from './pages/OrderConfirmation';
import Login from './pages/Login';
import Subscription from './pages/Subscription';
import Orders from './pages/Orders';
import Admin from './pages/Admin';

// Legal Pages
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';
import Refund from './pages/legal/Refund';
import Contact from './pages/legal/Contact';

import { Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}


function RequireAdmin({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return isAdmin ? children : <Navigate to="/" replace />;
}

function AppContent() {
  const location = useLocation();
  const hideFooter = ['/login', '/admin'].some(path => location.pathname.startsWith(path));
  const hidenavbar = location.pathname.startsWith('/login');

  return (
    <>
      {!hidenavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        
        {/* Protected Routes */}
        <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
        <Route path="/payment" element={<RequireAuth><Payment /></RequireAuth>} />
        <Route path="/order-confirmation" element={<RequireAuth><OrderConfirmation /></RequireAuth>} />
        <Route path="/subscription" element={<RequireAuth><Subscription /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
        
        
        {/* Admin Route */}
        <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
        
        <Route path="/login" element={<Login />} />
        
        {/* Legal & Support */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/contact" element={<Contact />} />

        {/* Catch-all route to redirect invalid URLs back home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!hideFooter && <Footer />}
    </>
  );
}

const hidenavbar = false; // will be computed per render in AppContent

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ProductsProvider>
            <AppContent />
          </ProductsProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
