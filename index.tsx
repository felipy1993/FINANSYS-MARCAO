
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
const APP_VERSION = 'v1.0.1';

root.render(
  <React.StrictMode>
    <App />
    {/* Versão do Sistema flutuante no canto inferior para PC */}
    <div className="fixed bottom-2 right-2 text-[10px] text-onSurfaceMuted opacity-30 pointer-events-none z-50 uppercase font-black">
      {APP_VERSION}
    </div>
  </React.StrictMode>
);

// Register Service Worker for PWA support and Auto-Update
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      // Se houver um worker esperando, força ele a assumir e recarrega
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }

      // Verifica atualizações enquanto o sistema está aberto
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Nova versão detectada e instalada
              console.log('Nova versão instalada, recarregando...');
              window.location.reload();
            }
          };
        }
      };
    }).catch(err => {
      console.log('SW registration failed: ', err);
    });
  });
}
