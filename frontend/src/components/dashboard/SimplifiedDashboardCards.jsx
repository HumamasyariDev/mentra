import React from 'react';
import { Plus, Flame, Clock, TreePine, Play } from 'lucide-react';
import '../../styles/components/dashboard/SimplifiedDashboardCards.css';

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

export function ExperienceProgressCard({ level = 12, currentExp = 3200, maxExp = 5000, nextLevelExp = 5000 }) {
  const percentage = (currentExp / maxExp) * 100;
  const expToNextLevel = maxExp - currentExp;
  
  return (
    <div className="dashboard-card experience-card">
      <h3 className="card-title">Your Progress</h3>
      <div className="card-content">
        <div className="level-display">
          <div className="level-badge">Lvl {level}</div>
          <div className="exp-text">{currentExp.toLocaleString()} / {maxExp.toLocaleString()} XP</div>
        </div>
        
        <div className="exp-progress-container">
          <div className="exp-bar">
            <div className="exp-fill" style={{ width: `${percentage}%` }} />
          </div>
          <div className="exp-percentage">{Math.round(percentage)}%</div>
        </div>
        
        <div className="exp-info">
          <span className="exp-label">To Next Level:</span>
          <span className="exp-value">{expToNextLevel.toLocaleString()} XP</span>
        </div>
      </div>
      <button className="card-action-btn exp-btn">
        <span>⭐</span> Earn More XP
      </button>
    </div>
  );
}
