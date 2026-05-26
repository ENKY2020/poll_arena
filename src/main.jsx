import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import { PWAInstallProvider } from './context/PWAInstallContext'
import { registerServiceWorker } from './registerSW'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <PWAInstallProvider>
        <App />
      </PWAInstallProvider>
    </AuthProvider>
  </React.StrictMode>
)

registerServiceWorker()