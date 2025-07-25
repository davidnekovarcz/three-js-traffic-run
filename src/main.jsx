import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'

// Ensure body styles for full screen
document.body.style.margin = '0'
document.body.style.padding = '0'
document.body.style.overflow = 'hidden'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)