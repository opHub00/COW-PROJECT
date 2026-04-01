import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './hooks/useAuth'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0D1117',
              color: '#E8EAF0',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '8px',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.85rem',
            },
            success: { iconTheme: { primary: '#00D4FF', secondary: '#080A0F' } },
            error: { iconTheme: { primary: '#FF6B6B', secondary: '#080A0F' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
