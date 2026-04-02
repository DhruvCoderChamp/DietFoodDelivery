
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('mm_user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('mm_token') || null);
  const [isAdmin, setIsAdmin] = useState(() => user?.role === 'admin');

  useEffect(() => {
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
    setIsAdmin(data.role === 'admin');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAdmin(false);
  };

  const authFetch = async (url, options = {}) => {
    const headers = { ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (options.body && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) logout();
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
