import React, { createContext, useContext } from 'react';
import { usePartnerNotifications } from '../hooks/usePartnerNotifications';

const PartnerNotificationsContext = createContext(null);

export function PartnerNotificationsProvider({ children }) {
  const value = usePartnerNotifications();
  return (
    <PartnerNotificationsContext.Provider value={value}>
      {children}
    </PartnerNotificationsContext.Provider>
  );
}

export function usePartnerNotificationsContext() {
  const ctx = useContext(PartnerNotificationsContext);
  if (!ctx) throw new Error('usePartnerNotificationsContext requires PartnerNotificationsProvider');
  return ctx;
}
