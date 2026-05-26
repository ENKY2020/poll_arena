export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
          console.log('Poll Arena service worker registered')
        })
        .catch((error) => {
          console.error('Service worker registration failed:', error)
        })
    })
  }
}