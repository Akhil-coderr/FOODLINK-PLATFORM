import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { Toaster } from 'react-hot-toast';
import ErrorBoundary from './components/common/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1e293b',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '800',
                  borderRadius: '16px',
                  padding: '14px 20px',
                  border: '2px solid #475569',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
                },
                success: {
                  style: {
                    border: '2px solid #34d399',
                    background: '#059669',
                    color: '#ffffff',
                    fontWeight: '800',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#059669',
                  },
                },
                error: {
                  style: {
                    border: '2px solid #f87171',
                    background: '#dc2626',
                    color: '#ffffff',
                    fontWeight: '800',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#dc2626',
                  },
                },
              }}
            />
            <App />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
