import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Play, Plus, Calendar, CheckCircle2, Circle, Clock, ArrowRight, MoreHorizontal } from 'lucide-react';
import streakHappy from '../../assets/streak_fire/streak_fire_state_happy.png';
import streakSad from '../../assets/streak_fire/streak_fire_state_sad.png';
import streakNormal from '../../assets/streak_fire/streak_fire_state_normal.png';
import streakSleep from '../../assets/streak_fire/streak_fire_state_sleep.png';
import '../../styles/components/dashboard/SimplifiedDashboard.css';

function getStreakState(streak, todayCompleted) {
  if (!streak?.last_activity_date || (streak?.current_streak ?? 0) === 0) return 'sleep';

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const lastActivity = new Date(streak.last_activity_date);
  lastActivity.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));

  if (diffDays > 1) return 'sad';
  if (todayCompleted > 0) return 'happy';
  return 'normal';
}

const STREAK_IMAGES = {
  happy: streakHappy,
  sad: streakSad,
  normal: streakNormal,
  sleep: streakSleep,
};

function useGreeting() {
  const { t } = useTranslation('common');
  const hour = new Date().getHours();
  if (hour < 12) return t('common:greeting.morning');
  if (hour < 17) return t('common:greeting.afternoon');
  return t('common:greeting.evening');
}

export function SimplifiedDashboard({ dashboardData, loading }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['dashboard', 'common']);
  const greeting = useGreeting();

  // Build display data from API response, with sensible fallbacks
  const data = useMemo(() => {
    if (!dashboardData) return null;

    const d = dashboardData;
    return {
      userName: d.user?.name ?? t('dashboard:greeting.explorer'),
      level: d.user?.level ?? 1,
      currentExp: d.user?.current_exp ?? 0,
      maxExp: d.user?.exp_to_next_level ?? 100,
      streak: d.streak?.current_streak ?? 0,
      streakObj: d.streak ?? null,
      todayCompleted: d.tasks?.today_completed ?? 0,
      pomodoroSessions: d.pomodoro?.today_sessions ?? 0,
      todaySchedules: d.today_schedules ?? [],
    };
  }, [dashboardData, t]);

  // While loading or no data yet, show skeleton-ish state
  if (loading || !data) {
    return (
      <div className="bento-container">
        <div className="bento-grid">
          <div className="bento-card card-profile">
            <div className="profile-header">
              <div>
                <p className="greeting">{greeting}</p>
                <h1 className="name">...</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const expPercentage = data.maxExp > 0 ? (data.currentExp / data.maxExp) * 100 : 0;
  const streakState = getStreakState(data.streakObj, data.todayCompleted);
  const streakImg = STREAK_IMAGES[streakState];

  const dateLocale = i18n.language === 'id' ? 'id-ID' : 'en-US';

  // Build schedule events from today_schedules
  const scheduleEvents = data.todaySchedules.slice(0, 3).map((s) => {
    const startTime = s.start_time ? new Date(`2000-01-01T${s.start_time}`) : null;
    return {
      time: startTime ? startTime.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--',
      period: startTime ? (startTime.getHours() < 12 ? 'AM' : 'PM') : '',
      title: s.title ?? t('dashboard:schedule.untitled'),
      duration: s.duration_minutes ? `${s.duration_minutes}m` : '',
    };
  });

  return (
    <div className="bento-container">
      <div className="bento-grid">
        
        {/* Profile / Overview (Span 2x1) */}
        <div className="bento-card card-profile">
          <div className="profile-header">
            <div>
              <p className="greeting">{greeting}</p>
              <h1 className="name">{data.userName}.</h1>
            </div>
            <div className="date-badge">
              {new Date().toLocaleDateString(dateLocale, { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
          
          <div className="level-overview">
            <div className="level-info">
              <span className="level-tag">{t('dashboard:level.level')} {data.level}</span>
              <span className="exp-count">{data.currentExp} / {data.maxExp} {t('common:xp')}</span>
            </div>
            <div className="exp-track">
              <div className="exp-fill" style={{ width: `${expPercentage}%` }}></div>
            </div>
          </div>
        </div>

        {/* Quick Actions (Span 2x1) */}
        <div className="bento-card card-actions">
          <button className="action-btn primary" onClick={() => navigate('/pomodoro')}>
            <div className="action-icon-wrap"><Play size={24} fill="currentColor" /></div>
            <span className="action-label">{t('dashboard:quickActions.focusSession')}</span>
          </button>
          <button className="action-btn secondary" onClick={() => navigate('/tasks')}>
            <div className="action-icon-wrap"><Plus size={24} /></div>
            <span className="action-label">{t('dashboard:quickActions.newTask')}</span>
          </button>
          <button className="action-btn secondary" onClick={() => navigate('/schedules')}>
            <div className="action-icon-wrap"><Calendar size={24} /></div>
            <span className="action-label">{t('dashboard:quickActions.scheduleEvent')}</span>
          </button>
        </div>

        {/* Tasks / Up Next (Span 2x2) — placeholder for now, tasks need separate fetch */}
        <div className="bento-card card-tasks">
          <div className="card-header">
            <h2 className="card-title">{t('dashboard:upNext.title')}</h2>
            <button className="icon-btn" onClick={() => navigate('/tasks')}><MoreHorizontal size={20} /></button>
          </div>
          <div className="task-list">
            <div className="task-empty-state">
              <p className="task-empty-text">
                {data.todayCompleted > 0
                  ? t('dashboard:upNext.tasksCompletedToday', { count: data.todayCompleted })
                  : t('dashboard:upNext.noTasksYet')}
              </p>
            </div>
          </div>
        </div>

        {/* Schedule */}
        <div className="bento-card card-schedule">
          <div className="card-header">
            <h2 className="card-title">{t('dashboard:schedule.todaysSchedule')}</h2>
            <button className="icon-btn" onClick={() => navigate('/schedules')}><ArrowRight size={20} /></button>
          </div>
          <div className="timeline">
            {scheduleEvents.length > 0 ? (
              scheduleEvents.map((event, i) => (
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
              ))
            ) : (
              <p className="schedule-empty-text">{t('dashboard:schedule.noEventsToday')}</p>
            )}
          </div>
        </div>

        {/* Pomodoro Focus */}
        <div className="bento-card card-pomodoro">
          <div className="pomodoro-content">
            <div className="pomo-header">
              <img src={streakImg} alt="streak" className="streak-icon-img-simplified" />
              <span className="streak-text">{t('dashboard:streak.dayStreakCount', { count: data.streak })}</span>
            </div>
            <div className="pomo-stats">
              <span className="pomo-count">{data.pomodoroSessions}</span>
              <span className="pomo-label" dangerouslySetInnerHTML={{ __html: t('dashboard:pomodoro.sessionsToday') }} />
            </div>
            
            <button className="pomo-quick-start" onClick={() => navigate('/pomodoro')}>
              <Play size={18} fill="currentColor" />
              {t('dashboard:quickActions.startFocus')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
