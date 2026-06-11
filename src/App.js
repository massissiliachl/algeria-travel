// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from './hooks/useLangHook';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Destinations from './pages/Destinations';
import Contact from './pages/Contact';
import './App.css';

function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/destinations" element={<Destinations />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  );
}

export default App;