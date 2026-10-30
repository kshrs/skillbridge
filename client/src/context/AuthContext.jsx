import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('sb_token') || '');
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sb_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [skillGap, setSkillGap] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto fetch profile if token exists
  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = async (currentToken = token) => {
    const activeToken = currentToken || token;
    if (!activeToken) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setSkillGap(data.skillGap);
        localStorage.setItem('sb_user', JSON.stringify(data.user));
      } else {
        logout();
      }
    } catch (e) {
      console.error('Failed to load profile', e);
    } finally {
      setLoading(false);
    }
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
        // Pass token directly to avoid state race condition
        fetchProfile(data.token);
        return { success: true };
      }
      return { success: false, message: data.message || 'Invalid credentials' };
    } catch (err) {
      return { success: false, message: 'Server connection failed. Please ensure the backend is running.' };
    }
  };

  const register = async (name, email, password, role = 'student', targetRole = 'Full Stack Developer') => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role, targetRole })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('sb_token', data.token);
        localStorage.setItem('sb_user', JSON.stringify(data.user));
        fetchProfile(data.token);
        return { success: true };
      }
      return { success: false, message: data.message || 'Registration failed' };
    } catch (err) {
      return { success: false, message: 'Server connection failed. Please ensure the backend is running.' };
    }
  };

  const logout = () => {
    setToken('');
    setUser(null);
    setSkillGap(null);
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
  };

  const updateProfile = async (updates) => {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      setSkillGap(data.skillGap);
      localStorage.setItem('sb_user', JSON.stringify(data.user));
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const addSkill = async (name, level) => {
    const res = await fetch('/api/auth/skills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name, level })
    });
    const data = await res.json();
    if (data.success) {
      setUser(prev => ({ ...prev, skills: data.skills }));
      setSkillGap(data.skillGap);
      return true;
    }
    return false;
  };

  const removeSkill = async (name) => {
    const res = await fetch(`/api/auth/skills/${encodeURIComponent(name)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.success) {
      setUser(prev => ({ ...prev, skills: data.skills }));
      setSkillGap(data.skillGap);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        skillGap,
        loading,
        login,
        register,
        logout,
        fetchProfile,
        updateProfile,
        addSkill,
        removeSkill
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
