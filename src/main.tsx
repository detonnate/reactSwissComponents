import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles/swiss.css'
import { App } from './showcase/App'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
