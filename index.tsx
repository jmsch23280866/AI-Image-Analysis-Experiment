import React from 'react';
import ReactDOM from 'react-dom/client';
// Use the shared JS file as the source of truth to avoid duplication
import { App } from './js/App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);