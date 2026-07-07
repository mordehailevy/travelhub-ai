import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled error caught by ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center px-6">
          <Card className="max-w-[440px] p-9 text-center">
            <CardContent className="flex flex-col items-center gap-4 px-0">
              <h1 className="font-heading text-xl font-extrabold text-foreground">Something went wrong</h1>
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred. Try reloading the page — if it keeps happening, let us know.
              </p>
              <Button onClick={() => window.location.assign("/")}>Back to home</Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
