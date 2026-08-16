import React, { createContext, useContext, useMemo, useState } from 'react';
import { api, clearAdminKey, isLoggedIn, setAdminKey } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(isLoggedIn());

  const login = async (key) => {
    await api.verifyKey(key);
    setAdminKey(key);
    setAuthenticated(true);
  };

  const logout = () => {
    clearAdminKey();
    setAuthenticated(false);
  };

  const value = useMemo(() => ({ authenticated, login, logout }), [authenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
