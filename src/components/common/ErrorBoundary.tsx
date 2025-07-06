import { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

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
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error details for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-royal-gradient-cream flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full bg-white rounded-royal p-8 shadow-xl border border-royal-gold/30"
          >
            <div className="text-center">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center"
              >
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </motion.div>

              <h1 className="text-2xl font-royal font-bold text-royal-charcoal mb-4">
                Etwas ist schiefgelaufen
              </h1>

              <p className="text-gray-600 mb-6">
                Es ist ein unerwarteter Fehler aufgetreten. Wir entschuldigen
                uns für die Unannehmlichkeiten.
              </p>

              {/* Error details for development */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Technische Details (Entwicklung)
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-auto max-h-32">
                    <div className="font-bold text-red-600">Error:</div>
                    <div>{this.state.error.message}</div>
                    {this.state.errorInfo && (
                      <>
                        <div className="font-bold text-red-600 mt-2">
                          Stack:
                        </div>
                        <div>{this.state.errorInfo.componentStack}</div>
                      </>
                    )}
                  </div>
                </details>
              )}

              <div className="space-y-3">
                <button
                  onClick={this.handleReset}
                  className="w-full bg-royal-gradient-gold text-royal-charcoal font-semibold py-3 px-6 rounded-royal hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Erneut versuchen</span>
                </button>

                <button
                  onClick={this.handleReload}
                  className="w-full bg-royal-charcoal text-white font-semibold py-3 px-6 rounded-royal hover:bg-royal-charcoal-dark transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Seite neu laden</span>
                </button>

                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full text-royal-purple hover:text-royal-purple-dark font-medium py-2 transition-colors flex items-center justify-center space-x-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Zur Startseite</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
