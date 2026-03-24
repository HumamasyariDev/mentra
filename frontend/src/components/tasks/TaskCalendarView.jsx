import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import TaskItem from './TaskItem';
import '../../styles/components/tasks/TaskComponents.css';

const dayKeyMap = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function TaskCalendarView({ tasks, isLoading, onComplete, onUncomplete, onDelete }) {
  const { t, i18n } = useTranslation(['tasks', 'common']);
  const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';

  const todayStr = formatDate(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    let startDow = firstDay.getDay() - 1;
    if (startDow < 0) startDow = 6;

    const days = [];
    for (let i = startDow - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month, -i), isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [year, month]);

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks?.forEach((task) => {
      const dateStr = task.due_date
        ? task.due_date.split('T')[0]
        : task.created_at?.split('T')[0];
      if (dateStr) {
        if (!map[dateStr]) map[dateStr] = [];
        map[dateStr].push(task);
      }
    });
    return map;
  }, [tasks]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(todayStr);
  };

  const monthLabel = currentDate.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] || []) : [];
  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : '';

  if (isLoading) {
    return (
      <div className="task-loading">
        <Loader2 className="task-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="task-calendar-grid">
      {/* Left: Task list for selected date */}
      <div className="task-list-panel">
        <h4 className="task-list-title">{selectedDateLabel}</h4>
        <p className="task-list-count">
          {t('tasks:calendarView.taskCount', { count: selectedTasks.length })}
        </p>

        <div className="task-list-container">
          {selectedTasks.length === 0 ? (
            <div className="task-list-empty">
              <CheckCircle2 style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.5rem', opacity: '0.4' }} />
              <p>{t('tasks:calendarView.noTasksForDay')}</p>
            </div>
          ) : (
            selectedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onComplete={onComplete}
                onUncomplete={onUncomplete}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </div>

      {/* Right: Mini calendar */}
      <div className="task-calendar-panel">
        {/* Calendar Header */}
        <div className="task-calendar-header">
          <h3 className="task-calendar-month">{monthLabel}</h3>
          <div className="task-calendar-nav">
            <button onClick={goToday} className="task-today-btn">
              {t('common:today')}
            </button>
            <button onClick={prevMonth} className="task-nav-btn">
              <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
            </button>
            <button onClick={nextMonth} className="task-nav-btn">
              <ChevronRight style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="task-calendar-days-header">
          {dayKeyMap.map((d) => (
            <div key={d} className="task-day-name">
              {t(`common:days.${d}`)}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="task-calendar-days">
          {calendarDays.map(({ date, isCurrentMonth }, i) => {
            const dateStr = formatDate(date);
            const dayTasks = tasksByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            const completedCount = dayTasks.filter((t) => t.status === 'completed').length;
            const pendingCount = dayTasks.length - completedCount;

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                className={`task-calendar-cell ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''}`}
              >
                <span
                  className="task-calendar-date"
                  style={{
                    backgroundColor: isToday ? '#6366f1' : 'transparent',
                    color: isToday ? '#ffffff' : '#475569'
                  }}
                >
                  {date.getDate()}
                </span>

                {dayTasks.length > 0 && isCurrentMonth && (
                  <div className="task-calendar-badge-container">
                    {pendingCount > 0 && (
                      <span className="task-calendar-badge pending">
                        {pendingCount}
                      </span>
                    )}
                    {completedCount > 0 && (
                      <span className="task-calendar-badge completed">
                        {completedCount}✓
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
