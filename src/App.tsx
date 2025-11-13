import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import Login from "./views/Login";
import Dashboard from "./views/Dashboard";
import NotFound from "./views/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";
import { QuickAccessProvider } from "./contexts/QuickAccessContext";
import { QuickAccessDialogs } from "./components/QuickAccessDialogs";

const Cliente = lazy(() => import("./views/Cliente"));
const Mecanico = lazy(() => import("./views/Mecanico"));
const Usuario = lazy(() => import("./views/Usuario"));
const Marca = lazy(() => import("./views/Marca"));
const Veiculo = lazy(() => import("./views/Veiculo"));
const Pecas = lazy(() => import("./views/Pecas"));
const Servicos = lazy(() => import("./views/Servicos"));
const Orcamento = lazy(() => import("./views/Orcamento"));
const OS = lazy(() => import("./views/OS"));
const Relatorio = lazy(() => import("./views/Relatorio"));

const queryClient = new QueryClient();

const AppContent = () => {
  useKeyboardShortcuts();
  
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Carregando...</div>}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente"
          element={
            <ProtectedRoute>
              <Cliente />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mecanico"
          element={
            <ProtectedRoute>
              <Mecanico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/usuario"
          element={
            <ProtectedRoute>
              <Usuario />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marca"
          element={
            <ProtectedRoute>
              <Marca />
            </ProtectedRoute>
          }
        />
        <Route
          path="/veiculo"
          element={
            <ProtectedRoute>
              <Veiculo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pecas"
          element={
            <ProtectedRoute>
              <Pecas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/servicos"
          element={
            <ProtectedRoute>
              <Servicos />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orcamento"
          element={
            <ProtectedRoute>
              <Orcamento />
            </ProtectedRoute>
          }
        />
        <Route
          path="/os"
          element={
            <ProtectedRoute>
              <OS />
            </ProtectedRoute>
          }
        />
        <Route
          path="/relatorio"
          element={
            <ProtectedRoute>
              <Relatorio />
            </ProtectedRoute>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <QuickAccessProvider>
          <AppContent />
          <QuickAccessDialogs />
        </QuickAccessProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
