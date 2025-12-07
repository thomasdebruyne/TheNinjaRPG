"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import ContentBox from "@/layout/ContentBox";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ error, reset }) => {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <ContentBox title="Something Went Wrong" defaultBackHref="/">
      <div className="flex flex-col items-center justify-center space-y-6 p-8">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse" />
          <AlertTriangle className="relative w-24 h-24 text-red-500" />
        </div>

        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-xl font-bold text-red-500">
            Oops! An unexpected error occurred
          </h2>
          <p className="text-muted-foreground">
            We&apos;ve been notified and are working to fix the issue. In the meantime,
            you can try refreshing the page or returning to the home page.
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground/70 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Button onClick={reset} variant="default" size="lg" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" size="lg" className="gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </div>

        <details className="w-full  mt-4">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
            Technical details
          </summary>
          <pre className="mt-2 p-4 bg-popover rounded-md text-xs overflow-auto max-h-40 border">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      </div>
    </ContentBox>
  );
};

export default ErrorBoundary;
