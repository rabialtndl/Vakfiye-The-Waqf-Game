import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './arayuz/stil.css'
import App from './App.tsx'
import { sayfaDili } from './dil'

sayfaDili()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
