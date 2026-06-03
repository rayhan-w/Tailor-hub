import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Tailors from "./pages/Tailors";
import TailorProfile from "./pages/TailorProfile";
import BookTailor from "./pages/BookTailor";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import TailorDashboard from "./pages/tailor/TailorDashboard";
import TailorSetup from "./pages/tailor/TailorSetup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import AiChatWidget from "./components/ai/AiChatWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/tailors" element={<Tailors />} />
              <Route path="/tailor/:id" element={<TailorProfile />} />
              <Route path="/book/:id" element={<BookTailor />} />
              <Route path="/customer/dashboard" element={<CustomerDashboard />} />
              <Route path="/tailor/dashboard" element={<TailorDashboard />} />
              <Route path="/tailor/setup" element={<TailorSetup />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:id" element={<Messages />} />
              <Route path="/notifications" element={<Notifications />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <AiChatWidget />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
