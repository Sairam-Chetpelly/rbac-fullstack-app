import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiration');
    setUser(null);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Redirect to login page
    router.push('/login');
  };

  const checkTokenExpiration = () => {
    const expirationTime = localStorage.getItem('tokenExpiration');
    if (expirationTime) {
      const timeUntilExpiry = parseInt(expirationTime) - Date.now();
      
      if (timeUntilExpiry <= 0) {
        // Token has expired
        logout();
        return;
      }
      
      // Set timeout for automatic logout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        logout();
      }, timeUntilExpiry);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      checkTokenExpiration();
    }
    setLoading(false);
  }, []);

  const login = (userData, tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    if (tokens.expirationTime) {
      localStorage.setItem('tokenExpiration', tokens.expirationTime.toString());
    }
    
    setUser(userData);
    checkTokenExpiration();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};