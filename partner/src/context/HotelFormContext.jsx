import React, { createContext, useContext } from 'react';
import { useHotelForm } from '../hooks/useHotelForm';

const HotelFormContext = createContext(null);

export function HotelFormProvider({ children }) {
  const value = useHotelForm();
  return <HotelFormContext.Provider value={value}>{children}</HotelFormContext.Provider>;
}

export function useHotelFormContext() {
  const ctx = useContext(HotelFormContext);
  if (!ctx) throw new Error('useHotelFormContext requires HotelFormProvider');
  return ctx;
}
