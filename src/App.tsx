import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Paywall from "./pages/Paywall";
import Scanner from "./pages/Scanner";
import History from "./pages/History";
import Health from "./pages/Health";
import HealthProfile from "./pages/HealthProfile";
import Feed from "./pages/Feed";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { onboarded } = useProfile();

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={onboarded ? <Navigate to="/scanner" /> : <Onboarding />} />
      <Route path="/paywall" element={<Paywall />} />
      <Route path="/scanner" element={<Scanner />} />
      <Route path="/history" element={<History />} />
      <Route path="/health" element={<Health />} />
      <Route path="/profile" element={<HealthProfile />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
