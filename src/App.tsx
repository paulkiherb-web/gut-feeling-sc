import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useDayReminders } from "@/hooks/useDayReminders";
import { useCoreSync } from "@/core/hooks/useCoreSync";
import { useLegacyBootstrap } from "@/core/hooks/useLegacyBootstrap";
import { AdaptiveExperienceProvider } from "@/design/adaptive";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Paywall from "./pages/Paywall";
import Scanner from "./pages/Scanner";
import History from "./pages/History";
import Assistant from "./pages/Assistant";
import HealthProfile from "./pages/HealthProfile";
import Feed from "./pages/Feed";
import Home from "./pages/Home";
import HomeV2 from "./pages/HomeV2";
import NotFound from "./pages/NotFound";
import LegacyRedirect from "./components/legacy/LegacyRedirect";
import BoostaShell from "./pages/boosta/BoostaShell";
import OnboardingFlow from "./pages/boosta/onboarding/OnboardingFlow";

const queryClient = new QueryClient();

function BoostaGate() {
  const onboarded = localStorage.getItem('boosta_onboarded') === 'true';
  if (!onboarded) return <Navigate to="/boosta/onboarding" replace />;
  return <BoostaShell />;
}

function AppRoutes() {
  const { onboarded } = useProfile();
  useCoreSync();
  useLegacyBootstrap();
  useDayReminders();

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={onboarded ? <Navigate to="/home" /> : <Onboarding />} />
      <Route path="/home" element={<Home />} />
      <Route path="/home-v2" element={<HomeV2 />} />
      <Route path="/paywall" element={<Paywall />} />
      <Route path="/scanner" element={<Scanner />} />
      <Route path="/history" element={<History />} />
      {/* Legacy routes — soft redirect to course */}
      <Route path="/day" element={<LegacyRedirect />} />
      <Route path="/health" element={<LegacyRedirect />} />
      <Route path="/intensive" element={<LegacyRedirect />} />
      <Route path="/assistant" element={<Assistant />} />
      <Route path="/profile" element={<HealthProfile />} />
      <Route path="/feed" element={<Feed />} />
      <Route path="/boosta" element={<BoostaGate />} />
      <Route path="/boosta/onboarding" element={<OnboardingFlow />} />
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
        <AdaptiveExperienceProvider>
          <AppRoutes />
        </AdaptiveExperienceProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
