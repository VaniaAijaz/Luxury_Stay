import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#111318',
          color: '#f8f4ee',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 12,
          fontSize: 13,
        },
        success: { iconTheme: { primary: '#d4af37', secondary: '#000' } },
      }}
    />
  </BrowserRouter>
)