import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDayReminders } from "@/hooks/useDayReminders";
import { usePlanReminders } from "@/hooks/usePlanReminders";
import { useLegacyBootstrap } from "@/core/hooks/useLegacyBootstrap";
import { useSupabaseBootstrap } from "@/core/hooks/useSupabaseBootstrap";
import { useGhostWhisperRouter } from "@/core/hooks/useGhostWhisperRouter";
import { AdaptiveExperienceProvider } from "@/design/adaptive";
import Auth from "./pages/Auth";
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
import BoostaProfile from "./pages/boosta/social/BoostaProfile";
import MarryFlow from "./pages/boosta/social/MarryFlow";
import ParoleFlow from "./pages/boosta/social/ParoleFlow";
import Teams from "./pages/boosta/social/Teams";
import StoryComposer from "./pages/boosta/social/StoryComposer";
import TokenGallery from "./pages/TokenGallery";
import PlanForgeScreen from "./pages/boosta/PlanForgeScreen";
import DualPathScreen from "./pages/boosta/DualPathScreen";
import HealthDashboardScreen from "./pages/boosta/HealthDashboardScreen";

const queryClient = new QueryClient();

function BoostaGate() {
  const onboarded =
    localStorage.getItem('boosta_onboarded') === 'true' ||
    localStorage.getItem('greenred_onboarded') === 'true';
  if (!onboarded) return <Navigate to="/boosta/onboarding" replace />;
  return <BoostaShell />;
}

function AppRoutes() {
  useLegacyBootstrap();
  useSupabaseBootstrap();
  useDayReminders();
  usePlanReminders();
  useGhostWhisperRouter();

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<Navigate to="/boosta" replace />} />
      <Route path="/onboarding" element={<Navigate to="/boosta/onboarding" replace />} />
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
      <Route path="/boosta/plan-forge" element={<PlanForgeScreen />} />
      <Route path="/boosta/dual-path" element={<DualPathScreen />} />
      <Route path="/boosta/health" element={<HealthDashboardScreen />} />
      <Route path="/boosta/profile" element={<BoostaProfile />} />
      <Route path="/boosta/marry" element={<MarryFlow />} />
      <Route path="/boosta/parole" element={<ParoleFlow />} />
      <Route path="/boosta/teams" element={<Teams />} />
      <Route path="/boosta/share" element={<StoryComposer />} />
      {import.meta.env.DEV && (
        <Route path="/tokens" element={<TokenGallery />} />
      )}
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
