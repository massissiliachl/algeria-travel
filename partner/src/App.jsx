import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HotelFormProvider } from './context/HotelFormContext';
import ProtectedRoute from './components/ProtectedRoute';
import PartnerLayout from './components/PartnerLayout';
import { PartnerNotificationsProvider } from './context/PartnerNotificationsContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RoomsPage from './pages/RoomsPage';
import ProfilePage from './pages/ProfilePage';
import PricingPage from './pages/PricingPage';
import PhotosPage from './pages/PhotosPage';
import PublishPage from './pages/PublishPage';
import PartnerReservationsPage from './pages/PartnerReservationsPage';
import './styles/partner.css';

function AppRoutes() {
  const { authenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={authenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        element={
          <ProtectedRoute>
            <HotelFormProvider>
              <PartnerNotificationsProvider>
                <PartnerLayout />
              </PartnerNotificationsProvider>
            </HotelFormProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="chambres" element={<RoomsPage />} />
        <Route path="planning" element={<Navigate to="/chambres" replace />} />
        <Route path="hotel" element={<ProfilePage />} />
        <Route path="tarifs" element={<PricingPage />} />
        <Route path="photos" element={<PhotosPage />} />
        <Route path="reservations" element={<PartnerReservationsPage />} />
        <Route path="publication" element={<PublishPage />} />
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
