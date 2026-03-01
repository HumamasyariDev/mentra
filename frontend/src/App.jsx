import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Pomodoro from './pages/Pomodoro';
import Schedules from './pages/Schedules';
import Mood from './pages/Mood';
import Chat from './pages/Chat';
import Sandbox from './pages/Sandbox';
import SandboxChat from './pages/SandboxChat';
import ForestWorld from './components/gameworld/ForestWorld';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Forest visualization — full viewport, outside AppLayout */}
        <Route path="/forest" element={<ForestWorld />} />

        {/* Protected routes */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/pomodoro" element={<Pomodoro />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/mood" element={<Mood />} />
          <Route path="/sandbox" element={<Sandbox />} />
          <Route path="/sandbox/:id" element={<SandboxChat />} />
          <Route path="/chat" element={<Chat />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
