import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
          <div className="text-center p-8 max-w-2xl">
            <h1 className="text-4xl font-bold mb-4 text-red-500">Something went wrong</h1>
            <p className="text-xl mb-6">An error occurred while loading the application.</p>
            
            <div className="bg-gray-900 p-4 rounded-lg text-left mb-6">
              <h3 className="text-lg font-semibold mb-2">Error Details:</h3>
              <pre className="text-sm text-red-400 whitespace-pre-wrap">
                {this.state.error && this.state.error.toString()}
              </pre>
              {this.state.errorInfo && this.state.errorInfo.componentStack && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-blue-400">Stack Trace</summary>
                  <pre className="text-xs text-gray-400 mt-2 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>

            <button 
              onClick={() => window.location.reload()} 
              className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;