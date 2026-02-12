import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2, Calendar } from 'lucide-react';
import ScheduleItem, { isCompletedOnDate } from './ScheduleItem';

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
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      {/* Left: Schedule list for selected date */}
      <div className="lg:col-span-2 card p-4 flex flex-col">
        <h4 className="text-sm font-semibold text-slate-900 mb-1">{selectedDateLabel}</h4>
        <p className="text-xs text-slate-400 mb-3">
          {selectedDaySchedules.length} schedule{selectedDaySchedules.length !== 1 ? 's' : ''}
        </p>

        <div className="flex-1 overflow-y-auto space-y-2 max-h-[500px]">
          {selectedDaySchedules.length === 0 ? (
            <div className="text-center py-10 text-slate-300">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No schedules for this day</p>
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
      <div className="lg:col-span-3 card p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">{monthLabel}</h3>
          <div className="flex items-center gap-1">
            <button onClick={goToday} className="px-2 py-1 text-[10px] font-medium bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors">
              Today
            </button>
            <button onClick={prevMonth} className="p-1 rounded-md hover:bg-slate-100 transition-colors">
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <button onClick={nextMonth} className="p-1 rounded-md hover:bg-slate-100 transition-colors">
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
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
                className={`relative p-1 min-h-[56px] border border-slate-50 text-left transition-all flex flex-col rounded-lg ${
                  !isCurrentMonth ? 'opacity-30' : 'hover:bg-slate-50'
                } ${isSelected ? 'ring-2 ring-indigo-500 bg-indigo-50/60' : ''}`}
              >
                <span
                  className={`text-[11px] font-medium inline-flex items-center justify-center w-5 h-5 rounded-full ${
                    isToday
                      ? 'bg-indigo-500 text-white'
                      : 'text-slate-600'
                  }`}
                >
                  {date.getDate()}
                </span>

                {totalCount > 0 && isCurrentMonth && (
                  <div className="mt-auto flex flex-wrap gap-0.5 px-0.5 pb-0.5">
                    <span className={`text-[9px] px-1 rounded font-medium leading-tight ${
                      completedCount === totalCount
                        ? 'bg-emerald-100 text-emerald-700'
                        : completedCount > 0
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {completedCount}/{totalCount}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] text-slate-400 mt-3 pt-3 border-t border-slate-100">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-blue-100 border border-blue-200" /> Pending
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-200" /> Partial
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-200" /> Done
          </span>
        </div>
      </div>
    </div>
  );
}
