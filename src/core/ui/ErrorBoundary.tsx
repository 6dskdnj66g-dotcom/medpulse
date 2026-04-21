"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 m-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-2">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">System Anomaly Detected</h2>
            <p className="text-slate-500 font-medium leading-relaxed">
              Medical platform state encountered a critical interruption. Self-healing protocols are ready to re-initialize your clinical session.
            </p>
            <button
              onClick={this.handleReset}
              className="inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-lg active:scale-95"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retry Initialization</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
