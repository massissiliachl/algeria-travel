import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/premium.css';
import './styles/responsive-ui.css';
import App from './App';

document.documentElement.classList.add('js');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
