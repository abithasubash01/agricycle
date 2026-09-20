import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authApi } from '../api/index';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('agricycle_token'));
  const [loading, setLoading] = useState(true);

  // On mount, restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('agricycle_token');
    const storedUser = localStorage.getItem('agricycle_user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (_) {
        localStorage.removeItem('agricycle_token');
        localStorage.removeItem('agricycle_user');
      }
    }
    setLoading(false);
  }, []);

  const saveSession = (token, user) => {
    localStorage.setItem('agricycle_token', token);
    localStorage.setItem('agricycle_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const register = useCallback(async ({ name, email, password, role, phone, location }) => {
    const res = await authApi.register({ name, email, password, role, phone, location });
    saveSession(res.data.token, res.data.user);
    return res.data.user;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const res = await authApi.login({ email, password });
    saveSession(res.data.token, res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('agricycle_token');
    localStorage.removeItem('agricycle_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, register, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
