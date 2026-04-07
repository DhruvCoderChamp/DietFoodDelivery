
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
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const fetchingRef = useRef(false);

  const fetchProducts = async ({ force = false, nextPage = 0 } = {}) => {
    const now = Date.now();
    // Return cached data if still fresh (memory speed) and NOT fetching a next page
    if (!force && nextPage === 0 && _cache && (now - _cacheTime) < (10 * 1000)) {
      setLoading(false);
      return;
    }
    // Prevent duplicate in-flight requests
    if (fetchingRef.current) return;
    
    // Show loading indicator ONLY if we have NO data to show yet
    if (!force && nextPage === 0 && !_cache) setLoading(true);
    
    fetchingRef.current = true;

    try {
      // SENIOR PAGINATION FETCH
      const res = await fetch(`/api/products?page=${nextPage}&size=6`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      const newItems = data.content || [];
      const isLast = data.last;

      setProducts(prev => {
        const combined = nextPage === 0 ? newItems : [...prev, ...newItems];
        // Only cache the first page for instant arrival persistence
        if (nextPage === 0) {
          _cache = combined;
          _cacheTime = Date.now();
          localStorage.setItem(CACHE_KEY, JSON.stringify(combined));
        }
        return combined;
      });

      setPage(nextPage);
      setHasMore(!isLast);
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
    const handleRefresh = () => fetchProducts({ force: true });
    window.addEventListener('mm-products-updated', handleRefresh);
    return () => window.removeEventListener('mm-products-updated', handleRefresh);
  }, []);

  return (
    <ProductsContext.Provider value={{ 
      products, 
      loading, 
      error, 
      hasMore,
      loadMore: () => fetchProducts({ nextPage: page + 1 }),
      refreshProducts: () => fetchProducts({ force: true }) 
    }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be inside ProductsProvider');
  return ctx;
};
