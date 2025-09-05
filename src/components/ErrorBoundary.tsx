import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Card from './ui/Card';
import Button from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <Card className="p-8 max-w-md w-full text-center">
            <div className="flex justify-center mb-4">
              <ExclamationTriangleIcon className="w-16 h-16 text-red-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">
              Ops! Qualcosa è andato storto
            </h2>
            
            <p className="text-neutral-600 mb-6">
              Si è verificato un errore imprevisto. Non preoccuparti, i tuoi dati sono al sicuro.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="cursor-pointer text-sm text-neutral-500 mb-2">
                  Dettagli tecnici (solo in sviluppo)
                </summary>
                <div className="bg-neutral-100 p-3 rounded text-xs font-mono overflow-auto">
                  <div className="text-red-600 mb-2">
                    <strong>Errore:</strong> {this.state.error.message}
                  </div>
                  {this.state.errorInfo && (
                    <div className="text-neutral-600">
                      <strong>Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <Button
                onClick={this.handleReset}
                variant="primary"
              >
                Riprova
              </Button>
              <Button
                onClick={() => window.location.reload()}
                variant="secondary"
              >
                Ricarica Pagina
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
