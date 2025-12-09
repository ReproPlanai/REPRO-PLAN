import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Import API test utility for development testing
if (process.env.NODE_ENV === 'development') {
  import('./utils/apiTest');
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
