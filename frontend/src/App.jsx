import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "./layouts/AuthLayout";
import AppLayout from "./layouts/AppLayout";
import ForestLayout from "./layouts/ForestLayout";

import { TransitionWrapper } from "./components/TransitionWrapper";
import { DashboardUIProvider } from "./contexts/DashboardUIContext";
import { PageTransitionProvider } from "./contexts/PageTransitionContext";
import { ThemeProvider } from "./contexts/ThemeContext";

/* ── Lazy-loaded pages ─────────────────────────────── */
const LandingPage = React.lazy(() => import("./pages/LandingPage"));
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const AuthCallback = React.lazy(() => import("./pages/AuthCallback"));
const TermsOfService = React.lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Tasks = React.lazy(() => import("./pages/Tasks"));
const Pomodoro = React.lazy(() => import("./pages/Pomodoro"));
const Schedules = React.lazy(() => import("./pages/Schedules"));
const Mood = React.lazy(() => import("./pages/Mood"));
const Journal = React.lazy(() => import("./pages/Journal"));
const Sandbox = React.lazy(() => import("./pages/Sandbox"));
const SandboxChat = React.lazy(() => import("./pages/SandboxChat"));
const Forum = React.lazy(() => import("./pages/Forum"));
const Forest = React.lazy(() => import("./pages/Forest"));
const MentraAgentWithSessions = React.lazy(() => import("./agents/MentraAgentWithSessions"));

/* ── Minimal full-screen loader ────────────────────── */
function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100%',
      background: 'var(--bg-base, #0f1117)',
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid rgba(255,255,255,0.08)',
        borderTopColor: 'var(--accent, #6366f1)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <DashboardUIProvider>
        <PageTransitionProvider>
          <TransitionWrapper>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Landing Page */}
                <Route path="/" element={<LandingPage />} />

                {/* Auth routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                </Route>
                <Route path="/register" element={<Register />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
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
                  <Route path="/journal" element={<Journal />} />
                  <Route path="/sandbox" element={<Sandbox />} />
                  <Route path="/sandbox/:id" element={<SandboxChat />} />
                  <Route path="/agent" element={<MentraAgentWithSessions />} />
                  <Route path="/forum" element={<Forum />} />
                </Route>

                {/* Default redirect */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </TransitionWrapper>
        </PageTransitionProvider>
      </DashboardUIProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
