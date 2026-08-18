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
import TrackReservation from './pages/TrackReservation';
import WhatsAppButton from './components/WhatsAppButton';
import CookieBanner from './components/CookieBanner';
import NotificationOptIn from './components/NotificationOptIn';

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
        <Route path="/hotels" element={<Stays />} />
        <Route path="/guesthouses" element={<Stays />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/InfoDestination" element={<Navigate to="/destinations" replace />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/suivi" element={<TrackReservation />} />
      </Routes>
      <WhatsAppButton />
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
        <NotificationProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </LangProvider>
    </HelmetProvider>
  );
}

export default App;
