import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data.success && res.data.data.profile) {
        setProfile(res.data.data.profile);
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    }
  };

  // Check current session on app mount
  useEffect(() => {
    let active = true;
    api.get('/auth/me')
      .then((res) => {
        if (!active || !res.data.success) return;
        setUser(res.data.data.user);
        return fetchProfile();
      })
      .catch(() => {
        if (!active) return;
        setUser(null);
        setProfile(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setUser(res.data.data.user);
      await fetchProfile();
    }
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    if (res.data.success) {
      setUser(res.data.data.user);
      setProfile(null); // Fresh user has no profile yet
    }
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      setProfile(null);
    }
  };

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    refreshProfile: fetchProfile,
    setProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
