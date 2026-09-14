import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReservationsPage from './pages/ReservationsPage';
import EntityListPage from './pages/EntityListPage';
import EntityEditPage from './pages/EntityEditPage';
import CommentsPage from './pages/CommentsPage';
import ContactPage from './pages/ContactPage';
import InboxPage from './pages/InboxPage';
import MediaPage from './pages/MediaPage';
import HotelEditPage from './pages/HotelEditPage';
import { LoadingState } from './components/ui';
import './styles/admin.css';

function AppRoutes() {
  const { authenticated, booting } = useAuth();

  if (booting) {
    return <LoadingState label="Chargement de l'administration…" />;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={authenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="comments" element={<CommentsPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="inbox" element={<InboxPage />} />
        <Route path="media" element={<MediaPage />} />
        <Route path=":entityKey" element={<EntityListPage />} />
        <Route path="hotels/:id" element={<HotelEditPage />} />
        <Route path=":entityKey/:id" element={<EntityEditPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
