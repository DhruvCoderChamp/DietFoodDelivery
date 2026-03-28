
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('mm_user') || 'null'));
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('mm_user', JSON.stringify(user));
    else localStorage.removeItem('mm_user');
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    setIsAdmin(userData.role === 'admin');
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('mm_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
