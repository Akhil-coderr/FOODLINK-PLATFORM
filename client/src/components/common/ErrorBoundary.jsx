import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-surface-light">
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-surface-border max-w-md w-full text-center">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-brandText-primary mb-2">Something went wrong</h2>
            <p className="text-sm text-brandText-muted mb-4">
              An unexpected error occurred while rendering this component.
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-left text-xs font-mono text-rose-700 mb-6 break-words max-h-36 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="inline-flex items-center px-4 py-2 bg-forest-900 text-white rounded-lg hover:bg-forest-800 transition"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
