import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearAdminKey, isLoggedIn, setAdminKey, setUnauthorizedHandler } from '../api';

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

    const key = sessionStorage.getItem('admin_key');
    if (!key) {
      setBooting(false);
      return;
    }

    api
      .verifyKey(key)
      .then(() => {
        setAdminKey(key);
        setAuthenticated(true);
      })
      .catch(() => {
        clearAdminKey();
        setAuthenticated(false);
      })
      .finally(() => setBooting(false));
  }, []);

  const login = async (key) => {
    await api.verifyKey(key);
    setAdminKey(key);
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
