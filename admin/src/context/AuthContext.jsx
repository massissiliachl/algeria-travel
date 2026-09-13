import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearAdminKey, setAdminKey, setUnauthorizedHandler, verifyKey } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [booting, setBooting] = useState(true);

  const logout = () => {
    clearAdminKey();
    setAuthenticated(false);
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAdminKey();
      setAuthenticated(false);
    });

    const devKey = import.meta.env.VITE_DEV_ADMIN_KEY?.trim();
    const storedKey = sessionStorage.getItem('admin_key')?.trim();
    const key = storedKey || (import.meta.env.DEV && devKey ? devKey : '');
    if (!key) {
      setBooting(false);
      return;
    }

    verifyKey(key)
      .then(() => {
        setAdminKey(key.trim());
        setAuthenticated(true);
      })
      .catch(() => {
        clearAdminKey();
        setAuthenticated(false);
      })
      .finally(() => setBooting(false));
  }, []);

  const login = async (key) => {
    const trimmed = String(key || '').trim();
    await verifyKey(trimmed);
    setAdminKey(trimmed);
    setAuthenticated(true);
  };

  const value = useMemo(
    () => ({ authenticated, booting, login, logout }),
    [authenticated, booting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
