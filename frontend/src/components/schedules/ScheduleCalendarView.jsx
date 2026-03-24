import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react';
import ScheduleItem, { isCompletedOnDate, formatTime } from './ScheduleItem';
import '../../styles/components/schedules/ScheduleComponents.css';

const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export default function ScheduleCalendarView({ schedules, isLoading, onComplete, onUncomplete, onDelete, onEdit }) {
  const { t, i18n } = useTranslation(['schedules', 'common']);
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

  const getSchedulesForDate = (date) => {
    const dow = date.getDay();
    const dom = date.getDate();

    return (schedules || []).filter((s) => {
      if (!s.is_active) return false;
      if (s.type === 'daily') return true;
      if (s.type === 'weekly') {
        const days = s.days_of_week || [];
        return days.includes(dow);
      }
      if (s.type === 'monthly') {
        return s.day_of_month === dom;
      }
      return false;
    });
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(todayStr);
  };

  const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';

  const monthLabel = currentDate.toLocaleDateString(locale, {
    month: 'long',
    year: 'numeric',
  });

  const selectedDaySchedules = useMemo(() => {
    if (!selectedDate) return [];
    const daySchedules = getSchedulesForDate(new Date(selectedDate + 'T00:00:00'));
    // Sort by start_time for timeline display (nulls last)
    return [...daySchedules].sort((a, b) => {
      if (!a.start_time && !b.start_time) return 0;
      if (!a.start_time) return 1;
      if (!b.start_time) return -1;
      return a.start_time.localeCompare(b.start_time);
    });
  }, [selectedDate, schedules]);

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString(locale, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : '';

  const isSelectedToday = selectedDate === todayStr;

  if (isLoading) {
    return (
      <div className="schedule-loading">
        <Loader2 className="schedule-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="schedule-calendar-grid">
      {/* Left: Timeline list for selected date */}
      <div className="schedule-list-panel">
        <h4 className="schedule-list-title">{selectedDateLabel}</h4>
        <p className="schedule-list-count">
          {t('schedules:calendarView.scheduleCount', { count: selectedDaySchedules.length })}
        </p>

        <div className="schedule-cal-timeline">
          {selectedDaySchedules.length === 0 ? (
            <div className="schedule-list-empty">
              <Calendar style={{ width: '2.5rem', height: '2.5rem', opacity: 0.4 }} />
              <p>{t('schedules:calendarView.noSchedulesForDay')}</p>
            </div>
          ) : (
            <div className="schedule-cal-timeline-inner">
              <div className="schedule-timeline-line" />
              {selectedDaySchedules.map((schedule) => (
                <div key={schedule.id} className="schedule-timeline-item">
                  <div className="schedule-timeline-node item-node" />
                  <ScheduleItem
                    schedule={schedule}
                    onComplete={isSelectedToday ? onComplete : undefined}
                    onUncomplete={isSelectedToday ? onUncomplete : undefined}
                    onDelete={onDelete}
                    onEdit={onEdit}
                    checkDate={selectedDate}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Calendar panel */}
      <div className="schedule-calendar-panel">
        {/* Calendar Header */}
        <div className="schedule-calendar-header">
          <h3 className="schedule-calendar-month">{monthLabel}</h3>
          <div className="schedule-calendar-nav">
            <button onClick={goToday} className="schedule-today-btn">
              {t('common:today')}
            </button>
            <button onClick={prevMonth} className="schedule-nav-btn">
              <ChevronLeft style={{ width: '1rem', height: '1rem' }} />
            </button>
            <button onClick={nextMonth} className="schedule-nav-btn">
              <ChevronRight style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="schedule-calendar-days-header">
          {dayKeys.map((key) => (
            <div key={key} className="schedule-day-name">
              {t(`common:days.${key}`)}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="schedule-calendar-days">
          {calendarDays.map(({ date, isCurrentMonth }, i) => {
            const dateStr = formatDate(date);
            const daySchedules = getSchedulesForDate(date);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            const completedCount = daySchedules.filter((s) => isCompletedOnDate(s, dateStr)).length;
            const totalCount = daySchedules.length;

            let badgeClass = 'pending';
            if (totalCount > 0 && completedCount === totalCount) badgeClass = 'completed';
            else if (completedCount > 0) badgeClass = 'partial';

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                className={`schedule-calendar-cell ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''}`}
              >
                <span className={`schedule-calendar-date ${isToday ? 'today' : ''}`}>
                  {date.getDate()}
                </span>

                {totalCount > 0 && isCurrentMonth && (
                  <div className="schedule-calendar-badge-container">
                    <span className={`schedule-calendar-badge ${badgeClass}`}>
                      {completedCount}/{totalCount}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="schedule-calendar-legend">
          <span className="schedule-legend-item">
            <span className="schedule-legend-dot pending" /> {t('schedules:calendarView.legend.pending')}
          </span>
          <span className="schedule-legend-item">
            <span className="schedule-legend-dot partial" /> {t('schedules:calendarView.legend.partial')}
          </span>
          <span className="schedule-legend-item">
            <span className="schedule-legend-dot completed" /> {t('schedules:calendarView.legend.done')}
          </span>
        </div>
      </div>
    </div>
  );
}
