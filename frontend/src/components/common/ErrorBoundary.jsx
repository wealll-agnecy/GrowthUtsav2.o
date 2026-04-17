import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { FaExclamationTriangle, FaHome, FaRedo } from 'react-icons/fa';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("🚨 [REACT ERROR BOUNDARY]:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
          <Container className="text-center p-5 shadow-lg rounded-5 bg-white border-0" style={{ maxWidth: '600px' }}>
            <div className="mb-4">
              <FaExclamationTriangle size={80} className="text-danger opacity-75" />
            </div>
            <h1 className="fw-black text-dark mb-3">Oops! Something went wrong</h1>
            <p className="text-secondary mb-5 fs-5">
              The application encountered an unexpected error. Don't worry, your data is safe.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <Button 
                variant="primary" 
                className="px-4 py-2 rounded-pill fw-bold"
                onClick={this.handleReset}
              >
                <FaHome className="me-2" /> Return Home
              </Button>
              <Button 
                variant="outline-secondary" 
                className="px-4 py-2 rounded-pill fw-bold"
                onClick={() => window.location.reload()}
              >
                <FaRedo className="me-2" /> Reload Page
              </Button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-5 p-3 bg-light rounded text-start text-danger tiny-text overflow-auto" style={{ maxHeight: '200px' }}>
                <code>{this.state.error?.toString()}</code>
              </div>
            )}
          </Container>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
