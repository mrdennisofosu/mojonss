import { Component } from "react";

// If any page crashes unexpectedly, show a friendly screen instead of a blank page.
class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Unexpected error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-dvh place-items-center bg-slate-50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              Something went wrong
            </h1>
            <p className="mt-2 text-slate-600">
              An unexpected error happened. Please go back to the homepage and
              try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Go to homepage
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
