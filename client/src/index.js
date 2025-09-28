// main entry point for react application
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// create root element and render app component
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
