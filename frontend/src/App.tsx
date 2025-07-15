
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import Index from "./pages/Index";
import ExploreAgents from "./pages/ExploreAgents";
import Workspace from "./pages/Workspace";
import Summary from "./pages/Summary";
import NotFound from "./pages/NotFound";
import LanguageInitializer from "./components/LanguageInitializer";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LanguageInitializer /> {/* ✅ Now Redux is available here */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explore" element={<ExploreAgents />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/summary" element={<Summary />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
