import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, login as apiLogin, logout as apiLogout, subscribeToData } from '../api/dataLayer';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getCurrentUser());

  useEffect(() => {
    return subscribeToData(() => {
      setUser(getCurrentUser());
    });
  }, []);

  const login = (username, password) => {
    apiLogin(username, password);
  };

  const logout = () => {
    apiLogout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
