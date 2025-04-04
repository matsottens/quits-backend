// Register the mock service worker for local development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/mockapi/mockServiceWorker.js')
        .then(registration => {
          console.log('Mock API Service Worker registered successfully:', registration.scope);
        })
        .catch(error => {
          console.error('Mock API Service Worker registration failed:', error);
        });
    });
  }
} 