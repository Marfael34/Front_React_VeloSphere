// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppRouter from './router/AppRouter.jsx'
// 1. N'oubliez pas d'importer le AuthProvider !
import { AuthProvider } from './contexts/AuthContext.jsx' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 2. On enveloppe le routeur avec le Provider */}
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StrictMode>,
)