import React from 'react';

const SearchBar = () => {
  const handleSearch = () => {
    alert('🔍 Recherche lancée ! Un conseiller vous contacte sous 24h.');
  };

  return (
    <div className="search-section" data-aos="fade-up">
      <div className="search-card">
        <div className="search-field">
          <label>DESTINATION</label>
          <select>
            <option>Toutes destinations</option>
            <option>Sahara & Dunes</option>
            <option>Côte Méditerranéenne</option>
            <option>Villes Historiques</option>
          </select>
        </div>
        <div className="search-field">
          <label>DATE DE DÉPART</label>
          <input type="date" defaultValue="2026-12-01" />
        </div>
        <div className="search-field">
          <label>DURÉE</label>
          <select>
            <option>4-6 Jours</option>
            <option>7-9 Jours</option>
            <option>10-14 Jours</option>
          </select>
        </div>
        <div className="search-field">
          <label>VOYAGEURS</label>
          <input type="number" defaultValue="2" min="1" max="20" />
        </div>
        <button className="search-btn" onClick={handleSearch}>Rechercher <i className="fas fa-search"></i></button>
      </div>
    </div>
  );
};

export default SearchBar;