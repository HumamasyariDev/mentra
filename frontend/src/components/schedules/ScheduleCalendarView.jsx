import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react';
import ScheduleItem, { isCompletedOnDate } from './ScheduleItem';
import '../../styles/components/schedules/ScheduleComponents.css';

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function ScheduleCalendarView({ schedules, isLoading, onComplete, onUncomplete, onDelete }) {
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

  const monthLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const selectedDaySchedules = selectedDate
    ? getSchedulesForDate(new Date(selectedDate + 'T00:00:00'))
    : [];

  const selectedDateLabel = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : '';

  if (isLoading) {
    return (
      <div className="schedule-loading">
        <Loader2 className="schedule-loading-spinner" />
      </div>
    );
  }

  return (
    <div className="schedule-calendar-grid">
      {/* Left: Schedule list for selected date */}
      <div className="schedule-list-panel">
        <h4 className="schedule-list-title">{selectedDateLabel}</h4>
        <p className="schedule-list-count">
          {selectedDaySchedules.length} schedule{selectedDaySchedules.length !== 1 ? 's' : ''}
        </p>

        <div className="schedule-list-container">
          {selectedDaySchedules.length === 0 ? (
            <div className="schedule-list-empty">
              <Calendar style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 0.5rem', opacity: '0.4' }} />
              <p>No schedules for this day</p>
            </div>
          ) : (
            selectedDaySchedules.map((schedule) => (
              <ScheduleItem
                key={schedule.id}
                schedule={schedule}
                onComplete={onComplete}
                onUncomplete={onUncomplete}
                onDelete={onDelete}
                checkDate={selectedDate}
              />
            ))
          )}
        </div>
      </div>

      {/* Right: Mini calendar */}
      <div className="schedule-calendar-panel">
        {/* Calendar Header */}
        <div className="schedule-calendar-header">
          <h3 className="schedule-calendar-month">{monthLabel}</h3>
          <div className="schedule-calendar-nav">
            <button onClick={goToday} className="schedule-today-btn">
              Today
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
          {dayNames.map((d) => (
            <div key={d} className="schedule-day-name">
              {d}
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

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(dateStr)}
                className={`schedule-calendar-cell ${!isCurrentMonth ? 'other-month' : ''} ${isSelected ? 'selected' : ''}`}
              >
                <span
                  className="schedule-calendar-date"
                  style={{
                    backgroundColor: isToday ? '#6366f1' : 'transparent',
                    color: isToday ? '#ffffff' : '#475569'
                  }}
                >
                  {date.getDate()}
                </span>

                {totalCount > 0 && isCurrentMonth && (
                  <div className="schedule-calendar-badge-container">
                    <span className="schedule-calendar-badge" style={{
                      backgroundColor: completedCount === totalCount ? '#d1fae5' : completedCount > 0 ? '#fef3c7' : '#dbeafe',
                      color: completedCount === totalCount ? '#047857' : completedCount > 0 ? '#a16207' : '#1e40af'
                    }}>
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
            <span className="schedule-legend-dot" style={{ backgroundColor: '#dbeafe', border: '1px solid #bfdbfe' }} /> Pending
          </span>
          <span className="schedule-legend-item">
            <span className="schedule-legend-dot" style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a' }} /> Partial
          </span>
          <span className="schedule-legend-item">
            <span className="schedule-legend-dot" style={{ backgroundColor: '#d1fae5', border: '1px solid #a7f3d0' }} /> Done
          </span>
        </div>
      </div>
    </div>
  );
}
