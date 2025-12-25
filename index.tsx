
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Punto de entrada optimizado para Vite.
 * Vite maneja automáticamente la recarga en caliente (HMR).
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("No se pudo encontrar el elemento root para montar la aplicación");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
