import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Index from "./pages/Index";
import UserHome from "./pages/UserHome";
import Sources from "./pages/Sources";
import SourceDetail from "./pages/SourceDetail";
import Insights from "./pages/Insights";
import InsightDetail from "./pages/InsightDetail";
import Teachings from "./pages/Teachings";
import TeachingDetail from "./pages/TeachingDetail";
import ContentCalendar from "./pages/ContentCalendar";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            {/* Page d'accueil personnalisée pour utilisateurs authentifiés */}
            <Route path="/home" element={
              <ProtectedRoute>
                <UserHome />
              </ProtectedRoute>
            } />
            {/* Pages accessibles à tous les utilisateurs authentifiés */}
            <Route path="/teachings" element={
              <ProtectedRoute>
                <Teachings />
              </ProtectedRoute>
            } />
            <Route path="/teachings/:id" element={
              <ProtectedRoute>
                <TeachingDetail />
              </ProtectedRoute>
            } />
            <Route path="/insights" element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            } />
            <Route path="/insights/:id" element={
              <ProtectedRoute>
                <InsightDetail />
              </ProtectedRoute>
            } />
            
            {/* Pages réservées aux administrateurs */}
            <Route path="/dashboard" element={
              <ProtectedRoute requireAdmin>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/sources" element={
              <ProtectedRoute requireAdmin>
                <Sources />
              </ProtectedRoute>
            } />
            <Route path="/sources/:id" element={
              <ProtectedRoute requireAdmin>
                <SourceDetail />
              </ProtectedRoute>
            } />
            <Route path="/calendar" element={
              <ProtectedRoute requireAdmin>
                <ContentCalendar />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute requireAdmin>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
