
import { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('mm_user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('mm_token') || null);
  
  // Use a ref to always have the latest token in authFetch without stale closures
  const tokenRef = useRef(token);

  const checkAdmin = (u) => {
    const role = u?.role?.toUpperCase() || '';
    return role === 'ADMIN' || role === 'ROLE_ADMIN';
  };

  const [isAdmin, setIsAdmin] = useState(() => checkAdmin(user));

  useEffect(() => {
    tokenRef.current = token;
    if (user) {
      localStorage.setItem('mm_user', JSON.stringify(user));
      localStorage.setItem('mm_token', token);
    } else {
      localStorage.removeItem('mm_user');
      localStorage.removeItem('mm_token');
    }
  }, [user, token]);

  const login = (data) => {
    setUser(data.user);
    setToken(data.token);
    tokenRef.current = data.token;
    setIsAdmin(checkAdmin(data.user || { role: data.role }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    tokenRef.current = null;
    setIsAdmin(false);
    // Fire global event so CartContext clears cart immediately on logout
    window.dispatchEvent(new Event('mm-logout'));
  };

  const authFetch = async (url, options = {}) => {
    const currentToken = tokenRef.current || localStorage.getItem('mm_token');
    const headers = { ...options.headers };
    
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }
    
    // Always set Content-Type for JSON bodies (string payloads from JSON.stringify)
    if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(url, { ...options, headers, credentials: 'include' });
    
    if (response.status === 401) {
      logout();
    } else if (response.status === 403) {
      console.error(`authFetch 403 Forbidden: ${options.method || 'GET'} ${url} — token present: ${!!currentToken}`);
    }
    
    return response;
  };

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, login, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
