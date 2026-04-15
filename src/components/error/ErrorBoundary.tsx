"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Here we can integrate with a logging service like Sentry or Datadog
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 border border-rose-200 bg-rose-50 rounded-xl flex flex-col items-center justify-center text-center space-y-3">
          <AlertOctagon className="w-10 h-10 text-rose-500" />
          <div>
            <h2 className="text-lg font-bold text-rose-800">Something went wrong</h2>
            <p className="text-sm text-rose-600 mt-1 max-w-sm">
              We encountered an unexpected error processing this module. Our team has been notified.
            </p>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-lg text-sm font-semibold hover:bg-rose-50 transition-colors"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try recovering
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
