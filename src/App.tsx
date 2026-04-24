import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Simulador from "./pages/Simulador";
import Permuta from "./pages/Permuta";
import HighestBestUse from "./pages/HighestBestUse";
import Decisor from "./pages/Decisor";
import PrecoTeto from "./pages/PrecoTeto";
import Dashboard from "./pages/Dashboard";
import CompareProjects from "./pages/CompareProjects";
import AdminUsers from "./pages/AdminUsers";
import AdminProjects from "./pages/AdminProjects";
import Vitrine from "./pages/Vitrine";
import VitrineDetail from "./pages/VitrineDetail";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
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
            {/* Public routes without sidebar */}
            <Route path="/" element={<Index />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
            <Route path="/termos" element={<TermsOfUse />} />
            <Route path="/vitrine" element={<Vitrine />} />
            <Route path="/vitrine/:id" element={<VitrineDetail />} />
            
            {/* Tool routes with sidebar */}
            <Route path="/simulador" element={
              <AppLayout title="Simulador de Incorporação">
                <Simulador />
              </AppLayout>
            } />
            <Route path="/permuta" element={
              <AppLayout title="Calculadora de Permuta">
                <Permuta />
              </AppLayout>
            } />
            <Route path="/highest-best-use" element={
              <AppLayout title="Highest & Best Use">
                <HighestBestUse />
              </AppLayout>
            } />
            <Route path="/decisor" element={
              <AppLayout title="Decisor Go/No-Go">
                <Decisor />
              </AppLayout>
            } />
            <Route path="/preco-teto" element={
              <AppLayout title="Preço Teto">
                <PrecoTeto />
              </AppLayout>
            } />
            <Route path="/dashboard" element={
              <AppLayout title="Dashboard">
                <Dashboard />
              </AppLayout>
            } />
            <Route path="/comparar" element={
              <AppLayout title="Comparar Projetos">
                <CompareProjects />
              </AppLayout>
            } />
            <Route path="/admin/users" element={
              <AppLayout title="Gestão de Usuários">
                <AdminUsers />
              </AppLayout>
            } />
            <Route path="/admin/projects" element={
              <AppLayout title="Projetos dos Usuários">
                <AdminProjects />
              </AppLayout>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
