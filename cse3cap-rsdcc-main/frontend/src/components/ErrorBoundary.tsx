import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-center flex-col space-y-4">
            <div className="flex items-center text-red-400">
              <AlertTriangle className="h-8 w-8 mr-3" />
              <div>
                <h3 className="text-lg font-semibold">Something went wrong</h3>
                <p className="text-sm text-slate-300 mt-1">
                  A component error occurred. This shouldn't affect the rest of the application.
                </p>
              </div>
            </div>
            
            {this.state.error && (
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 w-full">
                <p className="text-xs text-red-300 font-mono">
                  {this.state.error.message}
                </p>
              </div>
            )}
            
            <button
              onClick={this.handleRetry}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;