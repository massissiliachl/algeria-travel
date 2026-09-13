import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from './ui';

export default function ProtectedRoute({ children }) {
  const { authenticated, booting } = useAuth();

  if (booting) {
    return <LoadingState label="Vérification de la session…" />;
  }

  if (!authenticated) return <Navigate to="/login" replace />;
  return children;
}
