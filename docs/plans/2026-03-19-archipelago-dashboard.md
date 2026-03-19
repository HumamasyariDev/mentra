# Archipelago Dashboard Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the dashboard into an innovative, explorable archipelago map experience with 6 navigable islands, floating HUD, and a simplified dashboard fallback mode.

**Architecture:** Desktop users get an SVG-based interactive map with pan/zoom functionality powered by GSAP and CSS transforms. Mobile users see a simplified card-based dashboard. A new Settings page allows desktop users to toggle between modes. The system uses localStorage to persist user preferences across sessions.

**Tech Stack:** React 19, React Router v7, GSAP v3.14 + @gsap/react, Tailwind CSS v4, Lucide React icons, SVG for islands

---

## Task 1: Create useDashboardMode Hook

**Files:**
- Create: `frontend/src/hooks/useDashboardMode.js`

**Step 1: Write the custom hook**

```javascript
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'dashboard-mode';
const MODES = {
  MAP: 'map',
  SIMPLIFIED: 'simplified',
};

export function useDashboardMode() {
  const [mode, setModeState] = useState(() => {
    // Initialize from localStorage, default to 'map'
    if (typeof window === 'undefined') return MODES.MAP;
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored || MODES.MAP;
  });

  const setMode = (newMode) => {
    if (Object.values(MODES).includes(newMode)) {
      setModeState(newMode);
      localStorage.setItem(STORAGE_KEY, newMode);
    }
  };

  return { mode, setMode, MODES };
}
```

**Step 2: Add hook to exports in `frontend/src/hooks/index.js`**

Add to existing hooks file:
```javascript
export { useDashboardMode } from './useDashboardMode';
```

**Step 3: Commit**

```bash
cd /home/schris/Projects/Competition/mentra/frontend
git add src/hooks/useDashboardMode.js src/hooks/index.js
git commit -m "feat: add useDashboardMode hook for dashboard mode persistence"
```

---

## Task 2: Create Simplified Dashboard Card Components

**Files:**
- Create: `frontend/src/components/dashboard/SimplifiedDashboardCards.jsx`
- Create: `frontend/src/styles/components/dashboard/SimplifiedDashboardCards.css`

**Step 1: Create the card components**

```javascript
import React from 'react';
import { Plus, Flame, Clock, Target, TreePine, Play } from 'lucide-react';
import '../../../styles/components/dashboard/SimplifiedDashboardCards.css';

export function TasksCard({ tasksData = {} }) {
  const { active = 3, overdue = 1, completed = 12 } = tasksData;
  
  return (
    <div className="dashboard-card tasks-card">
      <h3 className="card-title">Today's Tasks</h3>
      <div className="card-content">
        <div className="stat-row">
          <span className="stat-label">Active:</span>
          <span className="stat-value">{active}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Overdue:</span>
          <span className="stat-value danger">{overdue}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Completed:</span>
          <span className="stat-value success">{completed}</span>
        </div>
      </div>
      <button className="card-action-btn">
        <Plus size={18} /> Add Task
      </button>
    </div>
  );
}

export function PomodoroStatsCard({ pomodoroData = {} }) {
  const { sessionsToday = 5, streak = 7 } = pomodoroData;
  
  return (
    <div className="dashboard-card pomodoro-card">
      <h3 className="card-title">Pomodoro Stats</h3>
      <div className="card-content">
        <div className="stat-row">
          <span className="stat-label">Today:</span>
          <span className="stat-value">{sessionsToday} sessions</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Streak:</span>
          <span className="stat-value"><Flame size={16} /> {streak} days</span>
        </div>
      </div>
      <button className="card-action-btn">
        <Play size={18} /> Start Pomodoro
      </button>
    </div>
  );
}

export function SchedulePreviewCard({ scheduleData = {} }) {
  const { events = [] } = scheduleData;
  
  return (
    <div className="dashboard-card schedule-card">
      <h3 className="card-title">Today's Schedule</h3>
      <div className="card-content">
        {events.length > 0 ? (
          <div className="events-list">
            {events.slice(0, 3).map((event, idx) => (
              <div key={idx} className="event-item">
                <Clock size={16} />
                <div>
                  <div className="event-time">{event.time}</div>
                  <div className="event-title">{event.title}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="empty-state">No events today</p>
        )}
      </div>
    </div>
  );
}

export function WeeklySummaryCard({ summaryData = {} }) {
  const { completedThisWeek = 34, dailyBreakdown = [5, 6, 8, 7, 4, 3, 1] } = summaryData;
  
  return (
    <div className="dashboard-card summary-card">
      <h3 className="card-title">Weekly Summary</h3>
      <div className="card-content">
        <div className="summary-stat">
          <span className="summary-label">Completed this week:</span>
          <span className="summary-value">{completedThisWeek} tasks</span>
        </div>
        <div className="daily-breakdown">
          {dailyBreakdown.map((count, idx) => (
            <div key={idx} className="day-bar" style={{ height: `${(count / 10) * 100}%` }} title={`Day ${idx + 1}: ${count}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ForestHealthCard({ forestData = {} }) {
  const { level = 3, health = 85 } = forestData;
  
  return (
    <div className="dashboard-card forest-card">
      <h3 className="card-title">Forest Health</h3>
      <div className="card-content">
        <div className="forest-status">
          <TreePine size={48} />
          <div className="tree-info">
            <div className="tree-level">Level {level}</div>
            <div className="tree-health">
              <div className="health-bar">
                <div className="health-fill" style={{ width: `${health}%` }} />
              </div>
              <span className="health-text">{health}%</span>
            </div>
          </div>
        </div>
      </div>
      <button className="card-action-btn">
        <span>🌊</span> Water Tree
      </button>
    </div>
  );
}

export function QuickActionsCard() {
  return (
    <div className="dashboard-card quick-actions-card">
      <h3 className="card-title">Quick Actions</h3>
      <div className="card-content quick-actions-grid">
        <button className="quick-action-btn pomodoro-btn">
          <Play size={20} /> Pomodoro
        </button>
        <button className="quick-action-btn task-btn">
          <Plus size={20} /> Task
        </button>
        <button className="quick-action-btn schedule-btn">
          <Clock size={20} /> Schedule
        </button>
        <button className="quick-action-btn forest-btn">
          <TreePine size={20} /> Forest
        </button>
      </div>
    </div>
  );
}
```

**Step 2: Create CSS for simplified dashboard cards**

```css
/* Simplified Dashboard Cards */

.dashboard-card {
  background: var(--color-surface, white);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  color: var(--color-text-primary, #1f2937);
}

.card-content {
  margin-bottom: 1rem;
}

/* Stat Rows */

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.95rem;
}

.stat-label {
  color: var(--color-text-secondary, #6b7280);
  font-weight: 500;
}

.stat-value {
  color: var(--color-text-primary, #1f2937);
  font-weight: 600;
  font-size: 1.1rem;
}

.stat-value.success {
  color: #10b981;
}

.stat-value.danger {
  color: #ef4444;
}

.stat-value.warning {
  color: #f59e0b;
}

/* Card Action Buttons */

.card-action-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.tasks-card .card-action-btn {
  background: #3b82f6;
  color: white;
}

.tasks-card .card-action-btn:hover {
  background: #2563eb;
  transform: scale(1.02);
}

.pomodoro-card .card-action-btn {
  background: #f97316;
  color: white;
}

.pomodoro-card .card-action-btn:hover {
  background: #ea580c;
  transform: scale(1.02);
}

.schedule-card .card-action-btn {
  background: #8b5cf6;
  color: white;
}

.schedule-card .card-action-btn:hover {
  background: #7c3aed;
  transform: scale(1.02);
}

.forest-card .card-action-btn {
  background: #10b981;
  color: white;
}

.forest-card .card-action-btn:hover {
  background: #059669;
  transform: scale(1.02);
}

/* Events List */

.events-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-item {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.5rem;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.02);
}

.event-time {
  font-size: 0.85rem;
  font-weight: 600;
  color: #8b5cf6;
}

.event-title {
  font-size: 0.9rem;
  color: var(--color-text-primary, #1f2937);
}

.empty-state {
  text-align: center;
  color: var(--color-text-secondary, #6b7280);
  font-size: 0.9rem;
  padding: 1rem 0;
}

/* Weekly Summary */

.summary-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.summary-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #6b7280);
}

.summary-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #14b8a6;
}

.daily-breakdown {
  display: flex;
  gap: 0.4rem;
  align-items: flex-end;
  height: 80px;
}

.day-bar {
  flex: 1;
  background: linear-gradient(to top, #14b8a6, #6ee7b7);
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: all 0.2s ease;
}

.day-bar:hover {
  opacity: 0.8;
  filter: brightness(0.9);
}

/* Forest Health */

.forest-status {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.forest-status svg {
  color: #10b981;
  flex-shrink: 0;
}

.tree-info {
  flex: 1;
}

.tree-level {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-primary, #1f2937);
  margin-bottom: 0.5rem;
}

.tree-health {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.health-bar {
  flex: 1;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.health-fill {
  height: 100%;
  background: linear-gradient(to right, #10b981, #6ee7b7);
  transition: width 0.3s ease;
}

.health-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #10b981;
  min-width: 30px;
  text-align: right;
}

/* Quick Actions */

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.quick-action-btn {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
  font-size: 0.85rem;
}

.quick-action-btn:hover {
  transform: translateY(-2px);
}

.pomodoro-btn {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

.pomodoro-btn:hover {
  background: rgba(249, 115, 22, 0.2);
}

.task-btn {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.task-btn:hover {
  background: rgba(59, 130, 246, 0.2);
}

.schedule-btn {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}

.schedule-btn:hover {
  background: rgba(139, 92, 246, 0.2);
}

.forest-btn {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.forest-btn:hover {
  background: rgba(16, 185, 129, 0.2);
}

/* Responsive */

@media (max-width: 768px) {
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .dashboard-card {
    padding: 1.25rem;
  }
}
```

**Step 3: Commit**

```bash
cd /home/schris/Projects/Competition/mentra/frontend
git add src/components/dashboard/SimplifiedDashboardCards.jsx src/styles/components/dashboard/SimplifiedDashboardCards.css
git commit -m "feat: create simplified dashboard card components"
```

---

## Task 3: Create Simplified Dashboard Layout Component

**Files:**
- Create: `frontend/src/components/dashboard/SimplifiedDashboard.jsx`
- Create: `frontend/src/styles/components/dashboard/SimplifiedDashboard.css`

**Step 1: Create the layout component**

```javascript
import React, { useState, useEffect } from 'react';
import {
  TasksCard,
  PomodoroStatsCard,
  SchedulePreviewCard,
  WeeklySummaryCard,
  ForestHealthCard,
  QuickActionsCard,
} from './SimplifiedDashboardCards';
import '../../../styles/components/dashboard/SimplifiedDashboard.css';

export function SimplifiedDashboard() {
  const [dashboardData, setDashboardData] = useState({
    tasks: { active: 3, overdue: 1, completed: 12 },
    pomodoro: { sessionsToday: 5, streak: 7 },
    schedule: { events: [
      { time: '9:00 AM', title: 'Team Meeting' },
      { time: '2:00 PM', title: 'Project Review' },
      { time: '4:30 PM', title: '1-on-1 with Manager' },
    ]},
    summary: { completedThisWeek: 34, dailyBreakdown: [5, 6, 8, 7, 4, 3, 1] },
    forest: { level: 3, health: 85 },
  });

  // TODO: Connect to real data sources via API or context
  // For now, using placeholder data

  return (
    <div className="simplified-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Your productivity at a glance</p>
      </div>

      <div className="dashboard-grid">
        <TasksCard tasksData={dashboardData.tasks} />
        <PomodoroStatsCard pomodoroData={dashboardData.pomodoro} />
        <SchedulePreviewCard scheduleData={dashboardData.schedule} />
        <WeeklySummaryCard summaryData={dashboardData.summary} />
        <ForestHealthCard forestData={dashboardData.forest} />
        <QuickActionsCard />
      </div>
    </div>
  );
}
```

**Step 2: Create CSS for simplified dashboard layout**

```css
/* Simplified Dashboard Layout */

.simplified-dashboard {
  padding: 2rem 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary, #1f2937);
  margin: 0 0 0.5rem 0;
}

.dashboard-subtitle {
  font-size: 0.95rem;
  color: var(--color-text-secondary, #6b7280);
  margin: 0;
}

/* Dashboard Grid */

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* Responsive Grid */

@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 480px) {
  .simplified-dashboard {
    padding: 1rem;
  }

  .dashboard-header h1 {
    font-size: 1.5rem;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
```

**Step 3: Commit**

```bash
cd /home/schris/Projects/Competition/mentra/frontend
git add src/components/dashboard/SimplifiedDashboard.jsx src/styles/components/dashboard/SimplifiedDashboard.css
git commit -m "feat: create simplified dashboard layout component"
```

---

## Task 4: Create Island SVG Component

**Files:**
- Create: `frontend/src/components/dashboard/Island.jsx`
- Create: `frontend/src/styles/components/dashboard/Island.css`

**Step 1: Create the Island SVG component**

```javascript
import React from 'react';
import { MapPin } from 'lucide-react';
import '../../../styles/components/dashboard/Island.css';

export function Island({ id, x, y, label, color, icon: Icon, onClick }) {
  return (
    <g className="island-group" onClick={onClick} role="button" tabIndex={0}>
      {/* Island shadow */}
      <defs>
        <filter id={`shadow-${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" floodOpacity="0.15" />
        </filter>
        <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color.light} />
          <stop offset="100%" stopColor={color.dark} />
        </linearGradient>
      </defs>

      {/* Island base (circle) */}
      <circle
        cx={x}
        cy={y}
        r="45"
        fill={`url(#gradient-${id})`}
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth="2"
        filter={`url(#shadow-${id})`}
        className="island-base"
      />

      {/* Island border highlight */}
      <circle
        cx={x}
        cy={y}
        r="45"
        fill="none"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1"
        opacity="0.6"
      />

      {/* Icon placeholder (we'll render a simple circle with text for now) */}
      <circle cx={x} cy={y} r="20" fill="rgba(255, 255, 255, 0.2)" className="icon-placeholder" />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="12"
        fill="white"
        fontWeight="600"
        className="island-icon-text"
      >
        {label.charAt(0).toUpperCase()}
      </text>

      {/* Island label */}
      <text
        x={x}
        y={y + 65}
        textAnchor="middle"
        fontSize="14"
        fontWeight="600"
        fill="#1f2937"
        className="island-label"
      >
        {label}
      </text>

      {/* Hover effect background (hidden by default, shown on hover via CSS) */}
      <circle
        cx={x}
        cy={y}
        r="50"
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="2"
        opacity="0"
        className="island-hover-ring"
      />
    </g>
  );
}

/**
 * Island configuration with positions and colors
 * Positions are in SVG viewBox coordinates (0 0 1200 800)
 */
export const ISLANDS = [
  {
    id: 'tasks',
    label: 'Tasks',
    x: 200,
    y: 150,
    color: { light: '#93c5fd', dark: '#1e40af' },
    route: '/tasks',
  },
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    x: 900,
    y: 200,
    color: { light: '#fed7aa', dark: '#c2410c' },
    route: '/pomodoro',
  },
  {
    id: 'forest',
    label: 'Forest',
    x: 150,
    y: 550,
    color: { light: '#86efac', dark: '#15803d' },
    route: '/forest',
  },
  {
    id: 'schedules',
    label: 'Schedules',
    x: 600,
    y: 600,
    color: { light: '#d8b4fe', dark: '#6d28d9' },
    route: '/schedules',
  },
  {
    id: 'chat',
    label: 'AI & Chat',
    x: 950,
    y: 650,
    color: { light: '#a5f3fc', dark: '#0e7490' },
    route: '/chat',
  },
  {
    id: 'forum',
    label: 'Forum',
    x: 500,
    y: 250,
    color: { light: '#fef08a', dark: '#ca8a04' },
    route: '/forum',
  },
];
```

**Step 2: Create CSS for islands**

```css
/* Island SVG Styles */

.island-group {
  cursor: pointer;
  user-select: none;
}

.island-group:hover .island-base {
  filter: brightness(1.1);
}

.island-group:hover .island-hover-ring {
  animation: hoverRing 0.6s ease-out forwards;
}

.island-group:hover .island-label {
  font-size: 15px;
  font-weight: 700;
}

.island-base {
  transition: filter 0.3s ease;
}

.icon-placeholder {
  transition: all 0.3s ease;
}

.island-icon-text {
  pointer-events: none;
  user-select: none;
}

.island-label {
  pointer-events: none;
  user-select: none;
  transition: all 0.3s ease;
  paint-order: stroke;
  stroke: white;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.island-hover-ring {
  transition: all 0.3s ease;
}

@keyframes hoverRing {
  from {
    r: 50;
    opacity: 0.6;
    stroke-width: 2;
  }
  to {
    r: 65;
    opacity: 0;
    stroke-width: 1;
  }
}
```

**Step 3: Commit**

```bash
cd /home/schris/Projects/Competition/mentra/frontend
git add src/components/dashboard/Island.jsx src/styles/components/dashboard/Island.css
git commit -m "feat: create island SVG component with placeholder styling"
```

---

## Task 5: Create Map Viewport Component

**Files:**
- Create: `frontend/src/components/dashboard/MapViewport.jsx`
- Create: `frontend/src/styles/components/dashboard/MapViewport.css`

**Step 1: Create the map viewport component**

```javascript
import React, { useRef, useEffect, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { Island, ISLANDS } from './Island';
import '../../../styles/components/dashboard/MapViewport.css';

export function MapViewport({ onIslandClick }) {
  const svgRef = useRef(null);
  const mapGroupRef = useRef(null);
  const containerRef = useRef(null);

  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // GSAP context for animations
  const { contextSafe } = useGSAP(() => {
    // Initialize with all islands visible
    fitToViewport();
  }, { scope: containerRef });

  // Fit all islands in viewport on mount
  const fitToViewport = contextSafe(() => {
    if (!svgRef.current) return;

    // Reset to default zoom and center
    gsap.to(mapGroupRef.current, {
      attr: {
        transform: 'translate(0, 0) scale(1)',
      },
      duration: 0.5,
      ease: 'power2.inOut',
    });

    setTransform({ x: 0, y: 0, scale: 1 });
  });

  // Handle mouse wheel zoom
  const handleWheel = contextSafe((e) => {
    if (!svgRef.current) return;
    e.preventDefault();

    const delta = e.deltaY > 0 ? 0.9 : 1.1; // Scroll down = zoom out, scroll up = zoom in
    const newScale = Math.max(0.8, Math.min(3, transform.scale * delta));

    if (newScale !== transform.scale) {
      gsap.to(mapGroupRef.current, {
        attr: {
          transform: `translate(${transform.x}, ${transform.y}) scale(${newScale})`,
        },
        duration: 0.3,
        ease: 'power2.inOut',
      });

      setTransform({ ...transform, scale: newScale });
    }
  });

  // Handle mouse drag pan
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = contextSafe((e) => {
    if (!isDragging || !svgRef.current) return;

    const dx = (e.clientX - dragStart.x) / transform.scale;
    const dy = (e.clientY - dragStart.y) / transform.scale;

    const newOffset = {
      x: dragOffset.x + dx,
      y: dragOffset.y + dy,
    };

    gsap.to(mapGroupRef.current, {
      attr: {
        transform: `translate(${newOffset.x}, ${newOffset.y}) scale(${transform.scale})`,
      },
      duration: 0.05,
      overwrite: false,
    });

    setDragOffset(newOffset);
    setDragStart({ x: e.clientX, y: e.clientY });
  });

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add wheel event listener
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.addEventListener('wheel', handleWheel, { passive: false });
    svg.addEventListener('mousedown', handleMouseDown);
    svg.addEventListener('mousemove', handleMouseMove);
    svg.addEventListener('mouseup', handleMouseUp);
    svg.addEventListener('mouseleave', handleMouseUp);

    return () => {
      svg.removeEventListener('wheel', handleWheel);
      svg.removeEventListener('mousedown', handleMouseDown);
      svg.removeEventListener('mousemove', handleMouseMove);
      svg.removeEventListener('mouseup', handleMouseUp);
      svg.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [isDragging, dragStart, dragOffset, transform]);

  const handleIslandClick = (island) => {
    // Trigger fade out animation before navigation
    onIslandClick?.(island);
  };

  return (
    <div className="map-viewport-container" ref={containerRef}>
      <svg
        ref={svgRef}
        viewBox="0 0 1200 800"
        className="map-svg"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {/* Background (water) */}
        <defs>
          <linearGradient id="water-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
        </defs>

        <rect width="1200" height="800" fill="url(#water-gradient)" />

        {/* Islands group (will be transformed for pan/zoom) */}
        <g ref={mapGroupRef} className="islands-group" transform="translate(0, 0) scale(1)">
          {ISLANDS.map((island) => (
            <Island
              key={island.id}
              id={island.id}
              x={island.x}
              y={island.y}
              label={island.label}
              color={island.color}
              onClick={() => handleIslandClick(island)}
            />
          ))}
        </g>
      </svg>

      {/* Zoom info (optional, for debugging) */}
      <div className="zoom-info">
        Zoom: {transform.scale.toFixed(1)}x
      </div>
    </div>
  );
}
```

**Step 2: Create CSS for map viewport**

```css
/* Map Viewport Container */

.map-viewport-container {
  position: relative;
  width: 100%;
  height: 600px;
  background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
  border-radius: 12px;
  overflow: hidden;
  user-select: none;
}

.map-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.islands-group {
  transform-origin: center;
  transition: cursor 0.2s ease;
}

/* Zoom Info Display */

.zoom-info {
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: #6b7280;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

/* Responsive */

@media (max-width: 768px) {
  .map-viewport-container {
    height: 400px;
  }
}

@media (max-width: 480px) {
  .map-viewport-container {
    height: 300px;
  }
}
```

**Step 3: Commit**

```bash
cd /home/schris/Projects/Competition/mentra/frontend
git add src/components/dashboard/MapViewport.jsx src/styles/components/dashboard/MapViewport.css
git commit -m "feat: create interactive map viewport with pan/zoom functionality"
```

---

## Task 6: Create Floating HUD Component

**Files:**
- Create: `frontend/src/components/dashboard/FloatingHUD.jsx`
- Create: `frontend/src/styles/components/dashboard/FloatingHUD.css`

**Step 1: Create the floating HUD component**

```javascript
import React, { useEffect, useState } from 'react';
import { Menu, Flame } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import '../../../styles/components/dashboard/FloatingHUD.css';

export function FloatingHUD({ userLevel = 12, expProgress = 65, streakDays = 7, onMenuToggle }) {
  const hudRef = useRef(null);
  const { contextSafe } = useGSAP(() => {
    // Fade in on mount
    gsap.from(hudRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: 'power2.out',
    });
  }, { scope: hudRef });

  return (
    <div className="floating-hud" ref={hudRef}>
      {/* Hamburger Menu */}
      <button className="hud-hamburger" onClick={onMenuToggle} aria-label="Toggle menu">
        <Menu size={24} />
      </button>

      {/* Level & EXP Bar */}
      <div className="hud-level-section">
        <div className="level-label">LVL {userLevel}</div>
        <div className="exp-bar-container">
          <div className="exp-bar-background">
            <div className="exp-bar-fill" style={{ width: `${expProgress}%` }} />
          </div>
          <span className="exp-text">{expProgress}%</span>
        </div>
      </div>

      {/* Streak Counter */}
      <div className="hud-streak-section">
        <Flame size={20} className="flame-icon" />
        <span className="streak-text">{streakDays}</span>
      </div>
    </div>
  );
}

import { useRef } from 'react';
```

Actually, let me fix the import order:

```javascript
import React, { useRef } from 'react';
import { Menu, Flame } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import '../../../styles/components/dashboard/FloatingHUD.css';

export function FloatingHUD({ userLevel = 12, expProgress = 65, streakDays = 7, onMenuToggle }) {
  const hudRef = useRef(null);
  const { contextSafe } = useGSAP(() => {
    // Fade in on mount
    gsap.from(hudRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.4,
      ease: 'power2.out',
    });
  }, { scope: hudRef });

  return (
    <div className="floating-hud" ref={hudRef}>
      {/* Hamburger Menu */}
      <button className="hud-hamburger" onClick={onMenuToggle} aria-label="Toggle menu">
        <Menu size={24} />
      </button>

      {/* Level & EXP Bar */}
      <div className="hud-level-section">
        <div className="level-label">LVL {userLevel}</div>
        <div className="exp-bar-container">
          <div className="exp-bar-background">
            <div className="exp-bar-fill" style={{ width: `${expProgress}%` }} />
          </div>
          <span className="exp-text">{expProgress}%</span>
        </div>
      </div>

      {/* Streak Counter */}
      <div className="hud-streak-section">
        <Flame size={20} className="flame-icon" />
        <span className="streak-text">{streakDays}</span>
      </div>
    </div>
  );
}
```

**Step 2: Create CSS for floating HUD**

```css
/* Floating HUD */

.floating-hud {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 40;
}

/* Hamburger Menu */

.hud-hamburger {
  position: absolute;
  left: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary, #1f2937);
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.hud-hamburger:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #3b82f6;
}

.hud-hamburger:active {
  transform: scale(0.95);
}

/* Level Section */

.hud-level-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 2rem;
}

.level-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--color-text-primary, #1f2937);
  min-width: 45px;
}

.exp-bar-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.exp-bar-background {
  width: 150px;
  height: 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.exp-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.exp-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  min-width: 30px;
  text-align: right;
}

/* Streak Section */

.hud-streak-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.08);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}

.flame-icon {
  color: #ef4444;
  flex-shrink: 0;
}

.streak-text {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ef4444;
  font-style: italic;
}

/* Responsive */

@media (max-width: 768px) {
  .floating-hud {
    top: 0.5rem;
    left: auto;
    right: 0.5rem;
    transform: none;
    gap: 1rem;
    padding: 0.5rem 1rem;
  }

  .hud-level-section {
    display: none;
  }

  .hud-hamburger {
    position: static;
  }
}

@media (max-width: 480px) {
  .floating-hud {
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
  }

  .hud-streak-section {
    padding: 0.4rem 0.5rem;
    font-size: 0.85rem;
  }
}
```

**Step 3: Commit**

```bash
cd /home/schris/Projects/Competition/mentra/frontend
git add src/components/dashboard/FloatingHUD.jsx src/styles/components/dashboard/FloatingHUD.css
git commit -m "feat: create floating HUD with level, EXP bar, and streak"
```

---

## Task 7: Create Floating Sidebar Component

**Files:**
- Create: `frontend/src/components/dashboard/FloatingSidebar.jsx`
- Create: `frontend/src/styles/components/dashboard/FloatingSidebar.css`

**Step 1: Create floating sidebar wrapper component**

```javascript
import React, { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { X } from 'lucide-react';
import Sidebar from '../Sidebar';
import '../../../styles/components/dashboard/FloatingSidebar.css';

export function FloatingSidebar({ isOpen, onClose }) {
  const sidebarRef = useRef(null);
  const overlayRef = useRef(null);

  const { contextSafe } = useGSAP(() => {
    // Animate sidebar slide in/out
    if (isOpen) {
      gsap.to(sidebarRef.current, {
        x: 0,
        opacity: 1,
        duration: 0.3,
        ease: 'power2.out',
      });
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.3,
      });
    } else {
      gsap.to(sidebarRef.current, {
        x: -280,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.inOut',
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
      });
    }
  }, { dependencies: [isOpen] });

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="floating-sidebar-overlay"
        onClick={onClose}
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="floating-sidebar"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(-280px)', opacity: isOpen ? 1 : 0 }}
      >
        <button className="floating-sidebar-close" onClick={onClose} aria-label="Close sidebar">
          <X size={24} />
        </button>
        <Sidebar />
      </div>
    </>
  );
}
```

**Step 2: Create CSS for floating sidebar**

```css
/* Floating Sidebar Overlay */

.floating-sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 30;
  transition: opacity 0.3s ease;
}

/* Floating Sidebar */

.floating-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  width: 280px;
  height: 100vh;
  background: var(--color-surface, white);
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.15);
  z-index: 35;
  overflow-y: auto;
  will-change: transform;
}

/* Close Button */

.floating-sidebar-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary, #1f2937);
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  z-index: 10;
}

.floating-sidebar-close:hover {
  background: rgba(0, 0, 0, 0.05);
}

/* Sidebar content inside floating sidebar needs top padding for close button */

.floating-sidebar .sidebar-content {
  padding-top: 3.5rem;
}

@media (min-width: 1024px) {
  .floating-sidebar {
    display: none;
  }

  .floating-sidebar-overlay {
    display: none;
  }
}
```

**Step 3: Commit**

```bash
cd /home/schris/Projects/Competition/mentra/frontend
git add src/components/dashboard/FloatingSidebar.jsx src/styles/components/dashboard/FloatingSidebar.css
git commit -m "feat: create floating sidebar component for map mode"
```

---

## Task 8: Refactor Dashboard Component to Include Map & Simplified Modes

**Files:**
- Modify: `frontend/src/pages/Dashboard.jsx`
- Create: `frontend/src/styles/pages/Dashboard_MapMode.css`

**Step 1: Refactor Dashboard component**

This is a larger modification. The current Dashboard.jsx shows Instagram analytics. We're adding mode-switching logic:

```javascript
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useDashboardMode } from '../hooks/useDashboardMode';
import { SimplifiedDashboard } from '../components/dashboard/SimplifiedDashboard';
import { MapViewport } from '../components/dashboard/MapViewport';
import { FloatingHUD } from '../components/dashboard/FloatingHUD';
import { FloatingSidebar } from '../components/dashboard/FloatingSidebar';
import '../../styles/pages/Dashboard_MapMode.css';

export function Dashboard() {
  const navigate = useNavigate();
  const { mode, MODES } = useDashboardMode();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDesktop = window.innerWidth >= 1024;

  const mapContainerRef = useRef(null);
  const pageTransitionRef = useRef(null);

  const { contextSafe } = useGSAP(() => {
    // Mount animation (fade in)
    if (mapContainerRef.current) {
      gsap.from(mapContainerRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  }, { scope: mapContainerRef });

  // Determine which view to show
  const showMapMode = isDesktop && mode === MODES.MAP;

  const handleIslandClick = contextSafe((island) => {
    // Fade out animation
    gsap.to([mapContainerRef.current], {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: () => {
        navigate(island.route);
      },
    });
  });

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isDesktop) {
    // Mobile: always show simplified dashboard
    return <SimplifiedDashboard />;
  }

  return (
    <div className="dashboard-container">
      {showMapMode ? (
        // Map Mode
        <div className="dashboard-map-mode" ref={mapContainerRef}>
          <FloatingHUD onMenuToggle={handleMenuToggle} />
          <MapViewport onIslandClick={handleIslandClick} />
          <FloatingSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>
      ) : (
        // Simplified Mode
        <SimplifiedDashboard />
      )}
    </div>
  );
}
```

**Step 2: Create CSS for map mode dashboard**

```css
/* Dashboard Container */

.dashboard-container {
  min-height: 100vh;
  background: var(--color-bg, #f8fafc);
}

/* Map Mode */

.dashboard-map-mode {
  min-height: 100vh;
  padding: 5rem 2rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
}

.dashboard-map-mode > .map-viewport-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

/* Desktop Responsive */

@media (max-width: 1400px) {
  .dashboard-map-mode {
    padding: 5rem 1.5rem 2rem;
  }
}

@media (max-width: 1024px) {
  .dashboard-map-mode {
    display: none;
  }
}

@media (max-width: 768px) {
  .dashboard-map-mode {
    padding: 4rem 1rem 2rem;
  }
}
```

**Step 3: Commit**

```bash
cd /home/schris/Projects/Competition/mentra/frontend
git add src/pages/Dashboard.jsx src/styles/pages/Dashboard_MapMode.css
git commit -m "feat: refactor Dashboard to support map and simplified modes with animations"
```

---

## Task 9: Create Settings Page with Dashboard Mode Toggle

**Files:**
- Create: `frontend/src/pages/Settings.jsx`
- Create: `frontend/src/styles/pages/Settings.css`

**Step 1: Create Settings page**

```javascript
import React from 'react';
import { useDashboardMode } from '../hooks/useDashboardMode';
import '../../styles/pages/Settings.css';

export function Settings() {
  const { mode, setMode, MODES } = useDashboardMode();
  const isDesktop = window.innerWidth >= 1024;

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        {/* Header */}
        <div className="settings-header">
          <h1>Settings</h1>
          <p>Customize your Mentra experience</p>
        </div>

        {/* Settings Sections */}
        <div className="settings-sections">
          {/* Dashboard Display Section - Desktop Only */}
          {isDesktop && (
            <section className="settings-section">
              <h2 className="section-title">Dashboard Display</h2>
              <p className="section-description">Choose how you want to view your dashboard</p>

              <div className="settings-options">
                <label className="radio-option">
                  <input
                    type="radio"
                    name="dashboard-mode"
                    value={MODES.MAP}
                    checked={mode === MODES.MAP}
                    onChange={() => handleModeChange(MODES.MAP)}
                  />
                  <div className="radio-content">
                    <span className="radio-label">Map Mode (Innovative)</span>
                    <span className="radio-description">Explore your dashboard as an interactive archipelago</span>
                  </div>
                </label>

                <label className="radio-option">
                  <input
                    type="radio"
                    name="dashboard-mode"
                    value={MODES.SIMPLIFIED}
                    checked={mode === MODES.SIMPLIFIED}
                    onChange={() => handleModeChange(MODES.SIMPLIFIED)}
                  />
                  <div className="radio-content">
                    <span className="radio-label">Simplified Dashboard (Focus)</span>
                    <span className="radio-description">View your key metrics in a card-based layout</span>
                  </div>
                </label>
              </div>
            </section>
          )}

          {/* Placeholder for other settings */}
          <section className="settings-section">
            <h2 className="section-title">Other Settings</h2>
            <p className="section-description">Coming soon: Theme, Notifications, Account</p>
          </section>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Create CSS for Settings page**

```css
/* Settings Page */

.settings-page {
  min-height: 100vh;
  background: var(--color-bg, #f8fafc);
  padding: 2rem 1.5rem;
}

.settings-container {
  max-width: 800px;
  margin: 0 auto;
}

/* Header */

.settings-header {
  margin-bottom: 3rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 2rem;
}

.settings-header h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary, #1f2937);
  margin: 0 0 0.5rem 0;
}

.settings-header p {
  font-size: 0.95rem;
  color: var(--color-text-secondary, #6b7280);
  margin: 0;
}

/* Settings Sections */

.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.settings-section {
  background: var(--color-surface, white);
  border-radius: 12px;
  padding: 2rem;
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-text-primary, #1f2937);
  margin: 0 0 0.5rem 0;
}

.section-description {
  font-size: 0.9rem;
  color: var(--color-text-secondary, #6b7280);
  margin: 0 0 1.5rem 0;
}

/* Radio Options */

.settings-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: rgba(0, 0, 0, 0.01);
}

.radio-option:hover {
  background: rgba(59, 130, 246, 0.05);
  border-color: rgba(59, 130, 246, 0.2);
}

.radio-option input[type="radio"] {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-top: 2px;
  cursor: pointer;
}

.radio-option input[type="radio"]:checked {
  accent-color: #3b82f6;
}

.radio-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.radio-label {
  font-weight: 600;
  color: var(--color-text-primary, #1f2937);
}

.radio-description {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #6b7280);
}

.radio-option input[type="radio"]:checked ~ .radio-content .radio-label {
  color: #3b82f6;
}

/* Responsive */

@media (max-width: 768px) {
  .settings-page {
    padding: 1rem;
  }

  .settings-container {
    max-width: 100%;
  }

  .settings-header h1 {
    font-size: 1.5rem;
  }

  .settings-section {
    padding: 1.5rem;
  }
}

@media (max-width: 480px) {
  .settings-header {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
  }

  .settings-section {
    padding: 1rem;
  }

  .radio-option {
    padding: 0.75rem;
  }
}
```

**Step 3: Add Settings route to App.jsx**

Modify `frontend/src/App.jsx` to include the Settings route:

```javascript
// In your router config, add:
{
  path: '/settings',
  element: <Settings />,
}
```

**Step 4: Commit**

```bash
cd /home/schris/Projects/Competition/mentra/frontend
git add src/pages/Settings.jsx src/styles/pages/Settings.css
git commit -m "feat: create Settings page with dashboard display mode toggle"
```

---

## Task 10: Update App Router with Settings Route

**Files:**
- Modify: `frontend/src/App.jsx`

**Step 1: Add Settings import and route**

In `App.jsx`, locate the router configuration and add:

```javascript
import { Settings } from './pages/Settings';

// In your route array, add:
{
  path: '/settings',
  element: <Settings />,
}
```

**Step 2: Commit**

```bash
cd /home/schris/Projects/Competition/mentra/frontend
git add src/App.jsx
git commit -m "feat: add Settings route to app router"
```

---

## Task 11: Add Settings Link to Sidebar

**Files:**
- Modify: `frontend/src/components/Sidebar.jsx`

**Step 1: Add Settings navigation link**

In `Sidebar.jsx`, add a link to Settings (typically in the account section or as a new section):

```javascript
// Add import
import { Settings as SettingsIcon } from 'lucide-react';

// In the sidebar JSX, add a Settings link (e.g., before Account section):
<NavLink to="/settings" className="sidebar-nav-link">
  <SettingsIcon size={20} />
  <span>Settings</span>
</NavLink>
```

**Step 2: Commit**

```bash
cd /home/schris/Projects/Competition/mentra/frontend
git add src/components/Sidebar.jsx
git commit -m "feat: add Settings link to sidebar navigation"
```

---

## Task 12: Test Map Mode Navigation Flow

**Files:**
- Test: Manual testing (smoke test)

**Step 1: Start dev server**

```bash
cd /home/schris/Projects/Competition/mentra/frontend
npm run dev
```

**Step 2: Test sequence**

1. Navigate to Dashboard (`/`)
2. Verify map mode displays (should show archipelago with 6 islands)
3. Verify floating HUD displays (hamburger, level, streak)
4. Test zoom: scroll wheel on map (should zoom in/out)
5. Test pan: click and drag on map (should move islands)
6. Click on an island (should fade out and navigate to page)
7. Verify sidebar becomes normal (not floating) on target page
8. Click back to Dashboard (should animate back to map)
9. Test hamburger menu (should open/close floating sidebar)
10. Navigate to Settings (`/settings`)
11. Verify dashboard mode toggle appears
12. Change to "Simplified Dashboard" mode
13. Navigate back to Dashboard (`/`)
14. Verify simplified dashboard displays (card grid)
15. Change back to "Map Mode" and verify map reappears

**Step 3: Test mobile**

1. Open DevTools and set viewport to mobile (< 1024px)
2. Navigate to Dashboard
3. Verify simplified dashboard displays (not map)
4. Navigate to Settings
5. Verify dashboard mode toggle is hidden
6. Test card layout responsiveness

**Step 4: Commit if tests pass**

```bash
git commit -m "test: verify archipelago dashboard and simplified mode work correctly"
```

---

## Task 13: Add Loading States and Fallbacks

**Files:**
- Modify: `frontend/src/components/dashboard/SimplifiedDashboard.jsx`
- Modify: `frontend/src/components/dashboard/MapViewport.jsx`

**Step 1: Add error boundary for map**

```javascript
// In MapViewport.jsx, wrap SVG in try-catch and add error state
const [hasError, setHasError] = useState(false);

if (hasError) {
  return (
    <div className="map-error">
      <p>Unable to load map. Please refresh the page.</p>
    </div>
  );
}

try {
  return (
    // ... map SVG JSX
  );
} catch (e) {
  setHasError(true);
}
```

**Step 2: Add skeleton loaders for cards**

```javascript
// In SimplifiedDashboard.jsx, add loading state and skeleton components
export function SimplifiedDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // ... rest of component
}

function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton">
      {Array(6).fill(0).map((_, idx) => (
        <div key={idx} className="skeleton-card" />
      ))}
    </div>
  );
}
```

**Step 3: Commit**

```bash
cd /home/schris/Projects/Competition/mentra/frontend
git add src/components/dashboard/SimplifiedDashboard.jsx src/components/dashboard/MapViewport.jsx
git commit -m "feat: add error boundaries and loading states to dashboard"
```

---

## Summary

This plan creates the complete archipelago dashboard system with 13 focused tasks:

1. **Hook** — State management for mode persistence
2-3. **Simplified Dashboard** — Card components + layout
4-5. **Map System** — Island SVG + Interactive viewport
6-7. **HUD & Sidebar** — Floating UI elements
8. **Dashboard Refactor** — Mode switching logic
9-11. **Settings** — New page + route + sidebar link
12. **Testing** — Smoke test map/simplified flows
13. **Resilience** — Error handling + loading states

**Total estimated implementation time:** 3-4 hours (all tasks, with testing)

**Key technical decisions:**
- SVG-based islands (scalable, CSS-styleable)
- GSAP for smooth animations (already in project)
- localStorage for persistence
- Mobile detection via viewport width
- Responsive grid for simplified dashboard

---

**Plan saved to `docs/plans/2026-03-19-archipelago-dashboard.md`**

Would you like me to execute these tasks? Two options:

**1. Subagent-Driven (this session)** - I execute each task one-by-one with code review between tasks

**2. Parallel Session** - You open a new session and use the executing-plans skill to batch execute with checkpoints

Which approach would you prefer?
