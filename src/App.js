import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { LangProvider } from './hooks/useLangHook';
import { NotificationProvider } from './hooks/useNotifications';
import { useRevealOnScroll } from './hooks/useRevealOnScroll';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Destinations from './pages/Destinations';
import Contact from './pages/Contact';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import Tours from './pages/Tours';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import PlaceDetail from './pages/PlaceDetail';
import DestinationRedirect from './pages/DestinationRedirect';
import SearchResults from './pages/SearchResults';
import Stays from './pages/Stays';
import Hotels from './pages/Hotels';
import HotelDetail from './pages/HotelDetail';
import TrackReservation from './pages/TrackReservation';
import Privacy from './pages/Privacy';
import Favorites from './pages/Favorites';
import WhatsAppButton from './components/WhatsAppButton';
import Chatbot from './components/chat/Chatbot';
import CookieBanner from './components/CookieBanner';
import NotificationOptIn from './components/NotificationOptIn';
import { FavoritesProvider } from './hooks/useFavorites';
import { ContentCatalogProvider } from './hooks/useContentCatalog';

import './App.css';

function AppRoutes() {
  useRevealOnScroll();

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destination/:id" element={<DestinationRedirect />} />
        <Route path="/place/:id" element={<PlaceDetail />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
        <Route path="/stays" element={<Stays />} />
        <Route path="/hotels" element={<Hotels />} />
        <Route path="/hotels/:id" element={<HotelDetail />} />
        <Route path="/guesthouses" element={<Stays />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/InfoDestination" element={<Navigate to="/destinations" replace />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/suivi" element={<TrackReservation />} />
      </Routes>
      <WhatsAppButton />
      <Chatbot />
      <CookieBanner />
      <NotificationOptIn />
    </>
  );
}

function App() {
  useEffect(() => {
    document.body.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }, []);

  return (
    <HelmetProvider>
      <LangProvider>
        <FavoritesProvider>
          <ContentCatalogProvider>
            <NotificationProvider>
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <AppRoutes />
              </BrowserRouter>
            </NotificationProvider>
          </ContentCatalogProvider>
        </FavoritesProvider>
      </LangProvider>
    </HelmetProvider>
  );
}

export default App;
