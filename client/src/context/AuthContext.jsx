import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('sb_token') || '';
  });

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sb_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('sb_theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('sb_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('sb_token', data.token);
        localStorage.setItem('sb_user', JSON.stringify(data.user));
        return { success: true };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch (err) {
      return { success: false, message: 'Server communication error' };
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data && data._id) {
        setUser(data);
        localStorage.setItem('sb_user', JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, refreshProfile, theme, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
