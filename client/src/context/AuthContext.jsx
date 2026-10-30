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

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
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
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('sb_token', data.token);
      localStorage.setItem('sb_user', JSON.stringify(data.user));
      await fetchProfile();
      return { success: true };
    }
    return { success: false, message: data.message };
  };

  const register = async (name, email, password, role = 'student', targetRole = 'Full Stack Developer') => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, targetRole })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('sb_token', data.token);
      localStorage.setItem('sb_user', JSON.stringify(data.user));
      await fetchProfile();
      return { success: true };
    }
    return { success: false, message: data.message };
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
