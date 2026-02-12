import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from 'lucide-react';
import TaskItem from './TaskItem';

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export default function TaskCalendarView({ tasks, isLoading, onComplete, onUncomplete, onDelete }) {
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

  const monthLabel = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] || []) : [];
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
      {/* Left: Task list for selected date */}
      <div className="lg:col-span-2 card p-4 flex flex-col">
        <h4 className="text-sm font-semibold text-slate-900 mb-1">{selectedDateLabel}</h4>
        <p className="text-xs text-slate-400 mb-3">
          {selectedTasks.length} task{selectedTasks.length !== 1 ? 's' : ''}
        </p>

        <div className="flex-1 overflow-y-auto space-y-2 max-h-[500px]">
          {selectedTasks.length === 0 ? (
            <div className="text-center py-10 text-slate-300">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No tasks for this day</p>
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
            const dayTasks = tasksByDate[dateStr] || [];
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            const completedCount = dayTasks.filter((t) => t.status === 'completed').length;
            const pendingCount = dayTasks.length - completedCount;

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

                {dayTasks.length > 0 && isCurrentMonth && (
                  <div className="mt-auto flex flex-wrap gap-0.5 px-0.5 pb-0.5">
                    {pendingCount > 0 && (
                      <span className="text-[9px] bg-amber-100 text-amber-700 px-1 rounded font-medium leading-tight">
                        {pendingCount}
                      </span>
                    )}
                    {completedCount > 0 && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1 rounded font-medium leading-tight">
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
