
import { createContext, useContext, useState, useEffect, useRef } from 'react';

const ProductsContext = createContext();

// Module-level cache survives re-renders but not full page refresh
// Persistent localStorage caching for instant arrival
const CACHE_KEY = 'mm_products_backup';
const getStoredCache = () => {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (err) { return null; }
};

let _cache = getStoredCache();
let _cacheTime = 0;
const CACHE_TTL_MS = 300 * 1000; // 5 minutes standard for food menu

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState(_cache || []);
  const [loading, setLoading] = useState(!_cache); // Only show loader if no cache at all
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchProducts = async (force = false) => {
    const now = Date.now();
    // Return cached data if still fresh (memory speed)
    if (!force && _cache && (now - _cacheTime) < (10 * 1000)) { // 10s memory revalidation
      setLoading(false);
      return;
    }
    // Prevent duplicate in-flight requests
    if (fetchingRef.current) return;
    
    // Show loading indicator ONLY if we have NO data to show yet
    if (!force && !_cache) setLoading(true);
    
    fetchingRef.current = true;

    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const sorted = data.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      
      // LEAD DEV OPTIMIZATION: Persistence layer
      _cache = sorted;
      _cacheTime = Date.now();
      localStorage.setItem(CACHE_KEY, JSON.stringify(sorted));
      
      setProducts(sorted);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Refresh cache when admin saves a product (custom event)
  useEffect(() => {
    const handleRefresh = () => fetchProducts(true);
    window.addEventListener('mm-products-updated', handleRefresh);
    return () => window.removeEventListener('mm-products-updated', handleRefresh);
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading, error, refreshProducts: () => fetchProducts(true) }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be inside ProductsProvider');
  return ctx;
};
