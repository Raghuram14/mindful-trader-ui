import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/auth/auth.context";
import { TradeProvider } from "@/context/TradeContext";
import { RulesProvider } from "@/context/RulesContext";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import TodayPage from "./pages/TodayPage";
import CoachingPage from "./features/coaching/pages/CoachingPage";
import AddTradePage from "./pages/AddTradePage";
import TradeDetailPage from "./pages/TradeDetailPage";
import ExitTradePage from "./pages/ExitTradePage";
import InsightsPage from "./features/insights/pages/InsightsPage";
import InsightsV2Page from "./features/insights-v2/pages/InsightsV2Page";
import HistoryPage from "./pages/HistoryPage";
import TradingRulesPage from "./pages/TradingRulesPage";
import TradeImportPage from "./features/trade-import/pages/TradeImportPage";
import SuggestionsPage from "./pages/SuggestionsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route
        path="/auth"
        element={
          isAuthenticated ? <Navigate to="/today" replace /> : <AuthPage />
        }
      />
      <Route
        path="/today"
        element={
          <ProtectedRoute>
            <CoachingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/add-trade"
        element={
          <ProtectedRoute>
            <AddTradePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rules"
        element={
          <ProtectedRoute>
            <TradingRulesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trade/:id"
        element={
          <ProtectedRoute>
            <TradeDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exit-trade/:id"
        element={
          <ProtectedRoute>
            <ExitTradePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/insights"
        element={
          <ProtectedRoute>
            <InsightsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/insights-v2"
        element={
          <ProtectedRoute>
            <InsightsV2Page />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/import"
        element={
          <ProtectedRoute>
            <TradeImportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/suggestions"
        element={
          <ProtectedRoute>
            <SuggestionsPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TradeProvider>
        <RulesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </RulesProvider>
      </TradeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
