import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
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

export default function App() {
  return (
    <BrowserRouter>
      <DashboardUIProvider>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Forest Tree Care — full viewport, outside AppLayout */}
        <Route path="/forest" element={<Forest />} />

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
      </DashboardUIProvider>
    </BrowserRouter>
  );
}
