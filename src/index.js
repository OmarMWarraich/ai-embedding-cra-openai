import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Apply StrictMode only in production
const appElement = process.env.NODE_ENV === 'production' ? (
  <React.StrictMode>
    <App />
  </React.StrictMode>
) : <App />;

root.render(appElement);
