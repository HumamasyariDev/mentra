import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import ForestLayout from "./layouts/ForestLayout";
import { TransitionWrapper } from "./components/TransitionWrapper";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import Tasks from "./pages/Tasks";
import Pomodoro from "./pages/Pomodoro";
import Schedules from "./pages/Schedules";
import Mood from "./pages/Mood";
import Chat from "./pages/Chat";
import Sandbox from "./pages/Sandbox";
import SandboxChat from "./pages/SandboxChat";
import Forum from "./pages/Forum";
import Forest from "./pages/Forest";
import MentraAgentWithSessions from "./agents/MentraAgentWithSessions";
import LandingPage from "./pages/LandingPage";
import { DashboardUIProvider } from "./contexts/DashboardUIContext";
import { PageTransitionProvider } from "./contexts/PageTransitionContext";

export default function App() {
  return (
    <BrowserRouter>
      <DashboardUIProvider>
        <PageTransitionProvider>
          <TransitionWrapper>
            <Routes>
              {/* Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
              </Route>
              <Route path="/register" element={<Register />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route element={<AuthLayout />}>
                <Route path="/reset-password" element={<ResetPassword />} />
              </Route>

              {/* Forest Tree Care — separate layout with transition overlay but no sidebar */}
              <Route element={<ForestLayout />}>
                <Route path="/forest" element={<Forest />} />
              </Route>

              {/* Protected routes */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/pomodoro" element={<Pomodoro />} />
                <Route path="/schedules" element={<Schedules />} />
                <Route path="/mood" element={<Mood />} />
                <Route path="/sandbox" element={<Sandbox />} />
                <Route path="/sandbox/:id" element={<SandboxChat />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/agent" element={<MentraAgentWithSessions />} />
                <Route path="/forum" element={<Forum />} />
              </Route>

              {/* Default redirect */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </TransitionWrapper>
        </PageTransitionProvider>
      </DashboardUIProvider>
    </BrowserRouter>
  );
}
