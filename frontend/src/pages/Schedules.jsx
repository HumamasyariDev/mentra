import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { scheduleApi } from "../services/api";
import { ChevronLeft, ChevronRight, Filter, HelpCircle } from "lucide-react";
import "../styles/pages/Schedules.css";

const MONTHS = [
  "Jan",
  "Feb",
  "March",
  "April",
  "May",
  "June",
  "July",
  "Aug",
  "Sept",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const formatDate = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function Schedules() {
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const { data: schedules, isLoading } = useQuery({
    queryKey: ["schedules", "calendar"],
    queryFn: () =>
      scheduleApi.list({ with_all_completions: true }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => scheduleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setShowForm(false);
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id) => scheduleApi.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => scheduleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, data }) => scheduleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

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
    const remaining = 35 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  }, [year, month]);

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    return (schedules || []).filter((s) => {
      if (!s.is_active) return false;
      const dow = date.getDay();
      const dom = date.getDate();
      if (s.type === "daily") return true;
      if (s.type === "weekly") return (s.days_of_week || []).includes(dow);
      if (s.type === "monthly") return s.day_of_month === dom;
      return false;
    });
  };

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    const events = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayEvents = getEventsForDate(date);
      dayEvents.forEach((event) => {
        const eventDate = new Date(date);
        const dateLabel = eventDate.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        });
        events.push({
          ...event,
          date: formatDate(date),
          dateLabel,
          daysLeft: i,
          displayTime:
            event.start_time && event.end_time
              ? `${event.start_time} - ${event.end_time}`
              : null,
        });
      });
    }
    return events.slice(0, 10);
  }, [schedules]);

  const activityByDate = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const dateMap = [];

    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      const dateStr = formatDate(date);
      const dayEvents = getEventsForDate(date);

      if (dayEvents.length > 0) {
        dateMap.push({
          date: i,
          dateStr,
          events: dayEvents,
        });
      }
    }

    return dateMap;
  }, [year, month, schedules]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const uncompleteMutation = useMutation({
    mutationFn: (id) => scheduleApi.uncomplete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const monthLabel = currentDate.toLocaleDateString("en-US", { month: "long" });
  const todayStr = formatDate(new Date());

  return (
    <div className="schedule-page">
      <div className="schedule-container">
        {/* Left Panel - Calendar */}
        <div className="schedule-calendar-panel">
          <div className="schedule-header">
            <h1 className="schedule-title">Activity Calendar</h1>
            <div className="schedule-header-actions">
              <button className="schedule-btn-icon">
                <Filter className="schedule-icon" />
                <span>Filter</span>
              </button>
              <button className="schedule-btn-icon-only">
                <HelpCircle className="schedule-icon" />
              </button>
            </div>
          </div>

          {/* Month Selector */}
          <div className="schedule-month-selector">
            {MONTHS.map((m, idx) => (
              <button
                key={m}
                onClick={() => {
                  setSelectedMonth(idx);
                  setCurrentDate(new Date(year, idx, 1));
                }}
                className={`schedule-month-btn ${idx === month ? "active" : ""}`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="schedule-calendar">
            <div className="schedule-calendar-header">
              <div className="schedule-calendar-nav-group">
                <button onClick={prevMonth} className="schedule-nav-btn">
                  <ChevronLeft className="schedule-icon" />
                </button>
                <h2 className="schedule-calendar-month">{monthLabel}</h2>
                <button onClick={nextMonth} className="schedule-nav-btn">
                  <ChevronRight className="schedule-icon" />
                </button>
              </div>
            </div>

            <div className="schedule-calendar-days-header">
              {DAYS.map((day) => (
                <div key={day} className="schedule-day-name">
                  {day}
                </div>
              ))}
            </div>

            <div className="schedule-calendar-grid">
              {activityByDate.map(({ date, dateStr, events }) => (
                <div key={dateStr} className="schedule-date-card">
                  <div className="schedule-date-header">
                    <span className="schedule-date-number">{date}</span>
                    <span className="schedule-date-label">
                      {new Date(dateStr).toLocaleDateString("en-US", {
                        weekday: "short",
                      })}
                    </span>
                  </div>
                  <div className="schedule-date-events">
                    {events.map((event, i) => (
                      <div
                        key={i}
                        className={`schedule-event-item event-${event.type || "daily"}`}
                      >
                        <span className="schedule-event-label">
                          {event.title}
                        </span>
                        {event.start_time && (
                          <span className="schedule-event-time">
                            {event.start_time}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="schedule-legend">
              <div className="schedule-legend-item">
                <span className="schedule-legend-dot daily"></span>
                <span>Daily</span>
              </div>
              <div className="schedule-legend-item">
                <span className="schedule-legend-dot weekly"></span>
                <span>Weekly</span>
              </div>
              <div className="schedule-legend-item">
                <span className="schedule-legend-dot monthly"></span>
                <span>Monthly</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Mini Calendar + Upcoming Events */}
        <div className="schedule-sidebar">
          {/* Mini Calendar Widget */}
          <div className="schedule-mini-calendar">
            <div className="schedule-mini-header">
              <button onClick={prevMonth} className="schedule-mini-nav-btn">
                <ChevronLeft className="schedule-icon" />
              </button>
              <h3 className="schedule-mini-month">{monthLabel}</h3>
              <button onClick={nextMonth} className="schedule-mini-nav-btn">
                <ChevronRight className="schedule-icon" />
              </button>
            </div>
            <div className="schedule-mini-days-header">
              {DAYS.map((day) => (
                <div key={day} className="schedule-mini-day-name">
                  {day}
                </div>
              ))}
            </div>
            <div className="schedule-mini-grid">
              {calendarDays.map(({ date, isCurrentMonth }, idx) => {
                const dateStr = formatDate(date);
                const isToday = dateStr === todayStr;
                const isSelected = dateStr === selectedDate;
                const dayEvents = getEventsForDate(date);
                const hasEvents = dayEvents.length > 0 && isCurrentMonth;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(dateStr)}
                    className={`schedule-mini-day ${
                      !isCurrentMonth ? "other-month" : ""
                    } ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`}
                  >
                    {date.getDate()}
                    {hasEvents && (
                      <span className="schedule-mini-day-dot"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="schedule-sidebar-header">
            <h2 className="schedule-sidebar-title">Upcoming events</h2>
            <button className="schedule-btn-icon">
              <Filter className="schedule-icon" />
            </button>
          </div>

          <div className="schedule-events-list">
            {upcomingEvents.length === 0 ? (
              <div className="schedule-events-empty">
                <p>No upcoming events</p>
              </div>
            ) : (
              upcomingEvents.map((event, idx) => (
                <div
                  key={idx}
                  className={`schedule-event-card event-${event.type || "daily"}`}
                >
                  <div className="schedule-event-header">
                    <h3 className="schedule-event-title">{event.title}</h3>
                    <span className="schedule-event-days">
                      {event.daysLeft === 0
                        ? "Today"
                        : event.daysLeft === 1
                          ? "Tomorrow"
                          : `${event.daysLeft} Days left`}
                    </span>
                  </div>
                  <div className="schedule-event-details">
                    <span className="schedule-event-date">
                      {event.dateLabel}
                    </span>
                    {event.displayTime && (
                      <>
                        <span className="schedule-event-separator">•</span>
                        <span className="schedule-event-time">
                          {event.displayTime}
                        </span>
                      </>
                    )}
                  </div>
                  {event.description && (
                    <div className="schedule-event-description">
                      {event.description}
                    </div>
                  )}
                  <div className="schedule-event-footer">
                    <div className="schedule-event-type-badge">
                      {event.type === "daily"
                        ? "📅 Daily"
                        : event.type === "weekly"
                          ? "📆 Weekly"
                          : "📆 Monthly"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
