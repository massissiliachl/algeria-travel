import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './hooks/useLangHook';
import { useRevealOnScroll } from './hooks/useRevealOnScroll';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Destinations from './pages/Destinations';
import InfoDestination from './pages/InfoDestination';
import Contact from './pages/Contact';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import Tours from './pages/Tours';
import Blog from './pages/Blog';
import PlaceDetail from './pages/PlaceDetail';
import SearchResults from './pages/SearchResults';
import Stays from './pages/Stays';
import WhatsAppButton from './components/WhatsAppButton';

import './App.css';

function AppRoutes() {
  useRevealOnScroll();

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/destination/:id" element={<InfoDestination />} />
        <Route path="/place/:id" element={<PlaceDetail />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/activity/:id" element={<ActivityDetail />} />
        <Route path="/stays" element={<Stays />} />
        <Route path="/hotels" element={<Stays />} />
        <Route path="/guesthouses" element={<Stays />} />
        <Route path="/tours" element={<Tours />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/InfoDestination" element={<InfoDestination />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <WhatsAppButton />
    </>
  );
}

function App() {
  useEffect(() => {
    document.body.setAttribute('data-theme', 'light');
    localStorage.setItem('theme', 'light');
  }, []);

  return (
    <LangProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LangProvider>
  );
}

export default App;
