import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './css/global.css'
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

import ErrorBoundary from './components/common/ErrorBoundary'

import axios from 'axios';
import API_BASE_URL from './config/apiConfig';

// Set global axios defaults
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

import { NotificationProvider } from './context/NotificationContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
        <AuthProvider>
            <NotificationProvider>
                <ThemeProvider>
                    <App />
                </ThemeProvider>
            </NotificationProvider>
        </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
