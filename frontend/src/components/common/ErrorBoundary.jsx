import React, { Component } from 'react';
import { Button, Container } from 'react-bootstrap';
import { FaExclamationTriangle, FaSync } from 'react-icons/fa';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[CRITICAL_ERROR_LOG]:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container className="d-flex flex-column align-items-center justify-content-center vh-100 text-center animate-fade-in">
          <div className="glass-panel p-5 rounded-5 border-white/10 shadow-2xl" style={{ maxWidth: '600px' }}>
            <div className="mb-4">
              <FaExclamationTriangle size={60} className="text-danger opacity-75" />
            </div>
            <h2 className="fw-black text-bright uppercase tracking-tighter mb-3" style={{ fontSize: '2rem' }}>
              Sector <span className="text-danger">Offline</span>
            </h2>
            <p className="text-soft mb-5" style={{ lineHeight: 1.6 }}>
              The high-fidelity rendering protocol encountered a fatal exception. 
              {this.state.error?.message && (
                <div className="mt-3 p-3 bg-white/5 rounded-3 font-monospace small text-danger border border-danger/20">
                  {this.state.error.message}
                </div>
              )}
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Button 
                onClick={() => window.location.reload()} 
                className="btn-primary rounded-pill px-5 py-3 fw-black uppercase tracking-widest small shadow-glow"
              >
                <FaSync className="me-2" /> Re-Initialize
              </Button>
            </div>
          </div>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
