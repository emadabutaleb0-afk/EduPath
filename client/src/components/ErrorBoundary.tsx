import { cn } from "@/lib/utils";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-6 bg-background">
          <div className="flex flex-col items-center w-full max-w-xl p-8 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md shadow-xl text-center animate-slide-up">
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-6 text-red-600 dark:text-red-400">
              <AlertCircle size={28} className="animate-pulse-subtle" />
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Something went wrong</h2>
            <p className="text-sm text-muted-foreground mb-6">
              An unexpected error occurred while rendering this page. You can try reloading or contacting support.
            </p>

            <div className="p-4 w-full rounded-xl bg-muted/50 border border-border/60 text-left overflow-auto max-h-48 mb-8">
              <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {this.state.error?.message || "Unknown error"}
                {this.state.error?.stack && `\n\n${this.state.error.stack}`}
              </pre>
            </div>

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium tracking-tight",
                "bg-primary text-primary-foreground",
                "hover:opacity-95 shadow-md shadow-primary/10 hover-lift active-scale cursor-pointer transition-all"
              )}
            >
              <RotateCcw size={16} />
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
