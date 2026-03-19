import React, { useState } from 'react';
import { Play, Plus, Calendar, CheckCircle2, Circle, Clock, Flame, ArrowRight, MoreHorizontal } from 'lucide-react';
import '../../styles/components/dashboard/SimplifiedDashboard.css';

export function SimplifiedDashboard() {
  const [dashboardData] = useState({
    user: { name: 'Alex' },
    tasks: { 
      active: [
        { id: 1, title: 'Review Q3 Marketing Deck', time: '10:00 AM', urgent: true },
        { id: 2, title: 'Sync with Engineering Team', time: '1:30 PM', urgent: false },
        { id: 3, title: 'Draft Product Requirements', time: 'Tomorrow', urgent: false },
        { id: 4, title: 'Update Onboarding Docs', time: 'This Week', urgent: false },
      ],
      completed: 12 
    },
    pomodoro: { sessionsToday: 5, streak: 7 },
    schedule: { events: [
      { time: '09:00', period: 'AM', title: 'Daily Standup', duration: '30m' },
      { time: '11:00', period: 'AM', title: 'Design Review', duration: '1h' },
      { time: '14:00', period: 'PM', title: '1-on-1 Sync', duration: '45m' },
    ]},
    forest: { level: 3, health: 85 },
    experience: { level: 12, currentExp: 3200, maxExp: 5000 },
  });

  const expPercentage = (dashboardData.experience.currentExp / dashboardData.experience.maxExp) * 100;

  return (
    <div className="bento-container">
      <div className="bento-grid">
        
        {/* Profile / Overview (Span 2x1) */}
        <div className="bento-card card-profile">
          <div className="profile-header">
            <div>
              <p className="greeting">Good morning,</p>
              <h1 className="name">{dashboardData.user.name}.</h1>
            </div>
            <div className="date-badge">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          <div className="level-overview">
            <div className="level-info">
              <span className="level-tag">Level {dashboardData.experience.level}</span>
              <span className="exp-count">{dashboardData.experience.currentExp} / {dashboardData.experience.maxExp} XP</span>
            </div>
            <div className="exp-track">
              <div className="exp-fill" style={{ width: `${expPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Quick Actions (Span 2x1) */}
        <div className="bento-card card-actions">
          <button className="action-btn primary">
            <div className="action-icon-wrap"><Play size={24} fill="currentColor" /></div>
            <span className="action-label">Focus Session</span>
          </button>
          <button className="action-btn secondary">
            <div className="action-icon-wrap"><Plus size={24} /></div>
            <span className="action-label">New Task</span>
          </button>
          <button className="action-btn secondary">
            <div className="action-icon-wrap"><Calendar size={24} /></div>
            <span className="action-label">Schedule Event</span>
          </button>
        </div>

        {/* Tasks / Up Next (Span 2x2) */}
        <div className="bento-card card-tasks">
          <div className="card-header">
            <h2 className="card-title">Up Next</h2>
            <button className="icon-btn"><MoreHorizontal size={20} /></button>
          </div>
          <div className="task-list">
            {dashboardData.tasks.active.map((task) => (
              <div key={task.id} className="task-item">
                <button className="check-btn">
                  <div className="check-circle-wrapper">
                    <CheckCircle2 size={20} className="check-icon" />
                  </div>
                </button>
                <div className="task-content">
                  <p className="task-title">{task.title}</p>
                  <span className={`task-time ${task.urgent ? 'urgent' : ''}`}>
                    <Clock size={12} className="clock-icon" /> {task.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule (Span 1x2 -> now 1x1 in new grid) */}
        <div className="bento-card card-schedule">
          <div className="card-header">
            <h2 className="card-title">Today's Schedule</h2>
            <button className="icon-btn"><ArrowRight size={20} /></button>
          </div>
          <div className="timeline">
            {dashboardData.schedule.events.map((event, i) => (
              <div key={i} className="timeline-event">
                <div className="event-time">
                  <span className="time-val">{event.time}</span>
                  <span className="time-period">{event.period}</span>
                </div>
                <div className="event-details">
                  <p className="event-title">{event.title}</p>
                  <p className="event-duration">{event.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pomodoro Focus (Span 1x1 in new grid) */}
        <div className="bento-card card-pomodoro">
          <div className="pomodoro-content">
            <div className="pomo-header">
              <Flame size={20} className="flame-icon" />
              <span className="streak-text">{dashboardData.pomodoro.streak} Day Streak</span>
            </div>
            <div className="pomo-stats">
              <span className="pomo-count">{dashboardData.pomodoro.sessionsToday}</span>
              <span className="pomo-label">Sessions<br/>Today</span>
            </div>
            
            <button className="pomo-quick-start">
              <Play size={18} fill="currentColor" />
              Start Focus
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
