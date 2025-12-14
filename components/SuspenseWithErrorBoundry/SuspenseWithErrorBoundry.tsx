"use client";

import { Skeleton } from "antd";
import React, { ReactNode, Suspense } from "react";
import AppErrorUI from "../AppErrorUI/AppErrorUI";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: string | null, onRetry: () => void) => ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: string | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry);
      }
      return <div>Something went wrong: {this.state.error}</div>;
    }
    return this.props.children;
  }
}

interface SuspenseWithBoundaryProps {
  children: ReactNode;
  loading?: ReactNode;
  errorFallback?: (error: string | null, onRetry: () => void) => ReactNode;
}

export default function SuspenseWithBoundary({
  children,
  loading =<Suspense> <Skeleton active /> </Suspense>,
  errorFallback = (error: any, onRetry: () => void) => {
      return <AppErrorUI
        message={error || "Something went wrong."}
        onRetry={onRetry}
        code={error?.status}
      />
  }
}: SuspenseWithBoundaryProps) {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={loading}>{children}</Suspense>
    </ErrorBoundary>
  );
}
