import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { HelmetProvider } from 'react-helmet-async';
import { initAnalytics } from './lib/analytics';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// posthog-js loads after the page is interactive (see lib/analytics.js)
window.addEventListener('load', initAnalytics, { once: true });

reportWebVitals();
