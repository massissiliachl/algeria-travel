import React, { createContext, useContext, useEffect, useState } from 'react';
import { api, clearPartnerToken, isLoggedIn, setPartnerToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [authenticated, setAuthenticated] = useState(isLoggedIn());
  const [hotel, setHotel] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('partner_hotel') || 'null');
    } catch {
      return null;
    }
  });
  const [booting, setBooting] = useState(isLoggedIn());

  useEffect(() => {
    if (!isLoggedIn()) {
      setBooting(false);
      return;
    }
    api
      .me()
      .then((data) => {
        setHotel(data.hotel);
        sessionStorage.setItem('partner_hotel', JSON.stringify(data.hotel));
        setAuthenticated(true);
      })
      .catch(() => {
        clearPartnerToken();
        setAuthenticated(false);
        setHotel(null);
      })
      .finally(() => setBooting(false));
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setPartnerToken(data.token);
    sessionStorage.setItem('partner_hotel', JSON.stringify(data.hotel));
    setHotel(data.hotel);
    setAuthenticated(true);
    return data;
  };

  const logout = () => {
    clearPartnerToken();
    setAuthenticated(false);
    setHotel(null);
  };

  return (
    <AuthContext.Provider value={{ authenticated, hotel, login, logout, booting }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
