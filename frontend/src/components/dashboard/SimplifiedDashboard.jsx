import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Play, Plus, Calendar, CheckCircle2, Circle, Clock, ArrowRight, MoreHorizontal } from 'lucide-react';
import { forestApi } from '../../services/api';
import streakHappy from '../../assets/streak_fire/streak_fire_state_happy.png';
import streakSad from '../../assets/streak_fire/streak_fire_state_sad.png';
import streakNormal from '../../assets/streak_fire/streak_fire_state_normal.png';
import streakSleep from '../../assets/streak_fire/streak_fire_state_sleep.png';

import pinePurpleSeed from '../../assets/pine_purple/pine_purple_seed.png';
import pinePurpleStage1 from '../../assets/pine_purple/pine_purple_stage_1.png';
import pinePurpleStage2 from '../../assets/pine_purple/pine_purple_stage_2.png';
import pinePurpleStage3 from '../../assets/pine_purple/pine_purple_stage_3.png';
import pinePurpleStage4 from '../../assets/pine_purple/pine_purple_stage_4.png';
import pinePurpleFinal from '../../assets/pine_purple/pine_purple_stage_final.png';

import '../../styles/components/dashboard/SimplifiedDashboard.css';

const TREE_STAGES = [pinePurpleSeed, pinePurpleStage1, pinePurpleStage2, pinePurpleStage3, pinePurpleStage4, pinePurpleFinal];

function getTreeImage(stage) {
  if (stage == null || stage < 0) return pinePurpleSeed;
  if (stage >= 5) return pinePurpleFinal;
  return TREE_STAGES[stage] ?? pinePurpleSeed;
}

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

  // Fetch forest data for the tree decoration
  const { data: forestData } = useQuery({
    queryKey: ['forest'],
    queryFn: () => forestApi.getForest().then((res) => res.data),
    staleTime: 60000,
  });

  const activeTree = forestData?.active_tree ?? null;
  const archivedTrees = forestData?.archived_trees ?? [];

  // Build forest row: archived trees (final stage) + active tree, max 15
  // Layout inspired by Forest page's getBackgroundTreeLayout
  const forestRow = useMemo(() => {
    const trees = [];

    // Add archived trees first (all at final stage)
    for (const tree of archivedTrees) {
      if (trees.length >= 15) break;
      trees.push({ id: tree.id, stage: 5, type: 'archived' });
    }

    // Add active tree if exists and still room
    if (activeTree && trees.length < 15) {
      trees.push({ id: `active-${activeTree.id}`, stage: activeTree.stage, type: 'active' });
    }

    const total = trees.length;
    if (total === 0) return [];

    // Layout each tree with organic positioning (left-to-right, varied sizes)
    return trees.slice(0, 15).map((tree, i) => {
      const seed = ((i * 73856093) ^ 19349663) >>> 0;

      // Horizontal: packed tighter, shifted left (-8% to 62%)
      // This creates a dense forest cluster on the left-center of the card
      const baseLeft = -8 + (i / Math.max(1, total - 1)) * 70;
      const jitterX = (Math.sin(seed) * 2.5); // +-2.5% jitter
      const left = Math.max(-10, Math.min(65, baseLeft + jitterX));

      // Scale: vary between 0.7 and 1.3 — bigger overall
      const centerFactor = 1 - Math.abs((i / Math.max(1, total - 1)) - 0.45) * 0.35;
      const randomVariance = 0.9 + (Math.abs(Math.sin(seed * 3)) * 0.4); // 0.9-1.3
      const scale = centerFactor * randomVariance;

      // Bottom offset: slight variance for uneven ground (-2% to 2%)
      const bottomShift = (Math.sin(seed * 2) * 2);

      // Sway animation delay
      const swayDelay = (seed % 50) / 10; // 0-5s

      return {
        ...tree,
        layout: {
          left: `${left}%`,
          bottom: `${bottomShift}%`,
          scale: Math.max(0.55, Math.min(1.15, scale)),
          opacity: 0.7 + (Math.abs(Math.sin(seed * 5)) * 0.3), // 0.7-1.0
          swayDelay: `${swayDelay}s`,
          enterDelay: `${i * 0.05}s`,
        },
      };
    });
  }, [archivedTrees, activeTree]);

  const hasForest = forestRow.length > 0;

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
          {/* Forest tree row decoration */}
          {hasForest && (
            <div className="profile-forest-layer">
              {forestRow.map((tree) => (
                <div
                  key={tree.id}
                  className={`profile-forest-tree ${tree.type}`}
                  style={{
                    '--tree-left': tree.layout.left,
                    '--tree-bottom': tree.layout.bottom,
                    '--tree-scale': tree.layout.scale,
                    '--tree-opacity': tree.layout.opacity,
                    '--sway-delay': tree.layout.swayDelay,
                    animationDelay: tree.layout.enterDelay,
                  }}
                >
                  <img
                    src={getTreeImage(tree.stage)}
                    alt=""
                    className="profile-forest-tree-img"
                    draggable={false}
                  />
                </div>
              ))}
            </div>
          )}

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
