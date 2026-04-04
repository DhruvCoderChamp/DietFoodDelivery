
import { createContext, useContext, useState, useEffect, useRef } from 'react';

const ProductsContext = createContext();

// Module-level cache survives re-renders but not full page refresh
let _cache = null;
let _cacheTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds — fresh enough, fast enough

export const ProductsProvider = ({ children }) => {
  const [products, setProducts] = useState(_cache || []);
  const [loading, setLoading] = useState(!_cache);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchProducts = async (force = false) => {
    const now = Date.now();
    // Return cached data if still fresh
    if (!force && _cache && (now - _cacheTime) < CACHE_TTL_MS) {
      setProducts(_cache);
      setLoading(false);
      return;
    }
    // Prevent duplicate in-flight requests
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);

    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const sorted = data.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      _cache = sorted;
      _cacheTime = Date.now();
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
