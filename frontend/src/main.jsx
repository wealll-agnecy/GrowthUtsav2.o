import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

// Global Error Catch for Debugging
window.onerror = function(message, source, lineno, colno, error) {
  console.error('[GLOBAL_FATAL_ERROR]', { message, source, lineno, colno, error });
};

window.onunhandledrejection = function(event) {
  console.error('[UNHANDLED_PROMISE_REJECTION]', event.reason);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
