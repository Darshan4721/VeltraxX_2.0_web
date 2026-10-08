import React, { Component } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// LAUNCH-01: Root Error Boundary preventing fatal blank white screen crashes
class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[RootErrorBoundary] Unhandled runtime crash caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-6 text-[#111116]">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl border-3 border-[#111116] shadow-[8px_8px_0px_0px_#111116] text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#FFE500] border-2 border-[#111116] shadow-[3px_3px_0px_0px_#FF2E93] mx-auto mb-5 flex items-center justify-center text-2xl font-black">
              ⚠️
            </div>
            <div className="inline-block px-3 py-1 bg-[#111116] text-[#FFE500] rounded-md font-mono text-xs font-black uppercase mb-3">
              SILICON EXCEPTION
            </div>
            <h1 className="text-2xl font-black tracking-tight mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-[#111116]/70 leading-relaxed mb-6 font-medium">
              An unexpected render issue occurred. Your registration draft is saved locally. Please reload the arena to continue.
            </p>
            <button
              onClick={this.handleReload}
              className="w-full h-12 bg-[#FFE500] hover:bg-[#F5DC00] text-[#111116] font-black text-sm rounded-xl border-2 border-[#111116] shadow-[3px_3px_0px_0px_#111116] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            >
              RELOAD APPLICATION
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </React.StrictMode>
);
