import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Flame, Clock, TreePine, Play } from 'lucide-react';
import '../../styles/components/dashboard/SimplifiedDashboardCards.css';

export function TasksCard({ tasksData = {} }) {
  const { t } = useTranslation(['dashboard', 'common']);
  const { active = 3, overdue = 1, completed = 12 } = tasksData;
  
  return (
    <div className="dashboard-card tasks-card">
      <h3 className="card-title">{t('dashboard:cards.todaysTasks')}</h3>
      <div className="card-content">
        <div className="stat-row">
          <span className="stat-label">{t('dashboard:cards.active')}:</span>
          <span className="stat-value">{active}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">{t('dashboard:cards.overdue')}:</span>
          <span className="stat-value danger">{overdue}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">{t('dashboard:cards.completed')}:</span>
          <span className="stat-value success">{completed}</span>
        </div>
      </div>
      <button className="card-action-btn">
        <Plus size={18} /> {t('dashboard:cards.addTask')}
      </button>
    </div>
  );
}

export function PomodoroStatsCard({ pomodoroData = {} }) {
  const { t } = useTranslation(['dashboard', 'common']);
  const { sessionsToday = 5, streak = 7 } = pomodoroData;
  
  return (
    <div className="dashboard-card pomodoro-card">
      <h3 className="card-title">{t('dashboard:cards.pomodoroStats')}</h3>
      <div className="card-content">
        <div className="stat-row">
          <span className="stat-label">{t('dashboard:cards.today')}:</span>
          <span className="stat-value">{t('dashboard:cards.sessions', { count: sessionsToday })}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">{t('dashboard:cards.streak')}:</span>
          <span className="stat-value"><Flame size={16} /> {t('dashboard:cards.days', { count: streak })}</span>
        </div>
      </div>
      <button className="card-action-btn">
        <Play size={18} /> {t('dashboard:pomodoro.startPomodoro')}
      </button>
    </div>
  );
}

export function SchedulePreviewCard({ scheduleData = {} }) {
  const { t } = useTranslation(['dashboard', 'common']);
  const { events = [] } = scheduleData;
  
  return (
    <div className="dashboard-card schedule-card">
      <h3 className="card-title">{t('dashboard:schedule.todaysSchedule')}</h3>
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
          <p className="empty-state">{t('dashboard:schedule.noEventsToday')}</p>
        )}
      </div>
    </div>
  );
}

export function WeeklySummaryCard({ summaryData = {} }) {
  const { t } = useTranslation(['dashboard', 'common']);
  const { completedThisWeek = 34, dailyBreakdown = [5, 6, 8, 7, 4, 3, 1] } = summaryData;
  
  return (
    <div className="dashboard-card summary-card">
      <h3 className="card-title">{t('dashboard:cards.weeklySummary')}</h3>
      <div className="card-content">
        <div className="summary-stat">
          <span className="summary-label">{t('dashboard:cards.completedThisWeek')}:</span>
          <span className="summary-value">{t('dashboard:cards.tasks', { count: completedThisWeek })}</span>
        </div>
        <div className="daily-breakdown">
          {dailyBreakdown.map((count, idx) => (
            <div key={idx} className="day-bar" style={{ height: `${(count / 10) * 100}%` }} title={t('dashboard:cards.dayCount', { number: idx + 1, count })} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ForestHealthCard({ forestData = {} }) {
  const { t } = useTranslation(['dashboard', 'common']);
  const { level = 3, health = 85 } = forestData;
  
  return (
    <div className="dashboard-card forest-card">
      <h3 className="card-title">{t('dashboard:cards.forestHealth')}</h3>
      <div className="card-content">
        <div className="forest-status">
          <TreePine size={48} />
          <div className="tree-info">
            <div className="tree-level">{t('dashboard:level.level')} {level}</div>
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
        <span>🌊</span> {t('dashboard:cards.waterTree')}
      </button>
    </div>
  );
}

export function QuickActionsCard() {
  const { t } = useTranslation(['dashboard', 'common']);
  return (
    <div className="dashboard-card quick-actions-card">
      <h3 className="card-title">{t('dashboard:cards.quickActions')}</h3>
      <div className="card-content quick-actions-grid">
        <button className="quick-action-btn pomodoro-btn">
          <Play size={20} /> {t('common:nav.pomodoro')}
        </button>
        <button className="quick-action-btn task-btn">
          <Plus size={20} /> {t('common:nav.tasks')}
        </button>
        <button className="quick-action-btn schedule-btn">
          <Clock size={20} /> {t('common:nav.schedules')}
        </button>
        <button className="quick-action-btn forest-btn">
          <TreePine size={20} /> {t('common:nav.forest')}
        </button>
      </div>
    </div>
  );
}

export function ExperienceProgressCard({ level = 12, currentExp = 3200, maxExp = 5000, nextLevelExp = 5000 }) {
  const { t } = useTranslation(['dashboard', 'common']);
  const percentage = (currentExp / maxExp) * 100;
  const expToNextLevel = maxExp - currentExp;
  
  return (
    <div className="dashboard-card experience-card">
      <h3 className="card-title">{t('dashboard:cards.yourProgress')}</h3>
      <div className="card-content">
        <div className="level-display">
          <div className="level-badge">{t('dashboard:level.lvl')} {level}</div>
          <div className="exp-text">{currentExp.toLocaleString()} / {maxExp.toLocaleString()} {t('common:xp')}</div>
        </div>
        
        <div className="exp-progress-container">
          <div className="exp-bar">
            <div className="exp-fill" style={{ width: `${percentage}%` }} />
          </div>
          <div className="exp-percentage">{Math.round(percentage)}%</div>
        </div>
        
        <div className="exp-info">
          <span className="exp-label">{t('dashboard:level.toNextLevel')}:</span>
          <span className="exp-value">{expToNextLevel.toLocaleString()} {t('common:xp')}</span>
        </div>
      </div>
      <button className="card-action-btn exp-btn">
        <span>⭐</span> {t('dashboard:cards.earnMoreXP')}
      </button>
    </div>
  );
}
