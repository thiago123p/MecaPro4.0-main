import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: Error | null; errorInfo?: string | null };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console for easier debugging
    console.error("[ErrorBoundary] Captured error:", error, info);
    this.setState({ error, errorInfo: info.componentStack });
  }

  handleReload = () => {
    // Try a hard reload to recover from the error
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
          <div className="max-w-2xl w-full bg-card border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">Ocorreu um erro</h2>
            <p className="mb-4">Algo deu errado ao carregar a aplicação. Você pode recarregar a página ou inspecionar o console para mais detalhes.</p>
            <div className="flex gap-2 mb-4">
              <button onClick={this.handleReload} className="btn btn-primary">Recarregar</button>
            </div>
            {this.state.error && (
              <details className="text-sm text-muted-foreground whitespace-pre-wrap overflow-auto max-h-48">
                <summary className="cursor-pointer">Ver detalhes do erro</summary>
                <pre className="mt-2">{String(this.state.error)}{this.state.errorInfo ? "\n" + this.state.errorInfo : ""}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}
