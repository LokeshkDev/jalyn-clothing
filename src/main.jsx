import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
/* Bootstrap grid only — avoid utilities that inject blue text-primary */
import 'bootstrap/dist/css/bootstrap-grid.min.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
