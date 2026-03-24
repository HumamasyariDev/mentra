import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import '../../styles/components/schedules/ScheduleComponents.css';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleCreateForm({ onSubmit, isPending }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'daily',
    start_time: '',
    end_time: '',
    days_of_week: [],
    day_of_month: '',
  });

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (payload.days_of_week.length === 0) delete payload.days_of_week;
    if (!payload.day_of_month) delete payload.day_of_month;
    if (!payload.start_time) delete payload.start_time;
    if (!payload.end_time) delete payload.end_time;
    onSubmit(payload, () => {
      setForm({
        title: '',
        description: '',
        type: 'daily',
        start_time: '',
        end_time: '',
        days_of_week: [],
        day_of_month: '',
      });
    });
  };

  return (
    <form onSubmit={handleSubmit} className="schedule-create-form">
      <div className="schedule-create-form-grid">
        {/* Title */}
        <div className="schedule-form-group">
          <label className="schedule-form-label">Title</label>
          <input
            type="text"
            className="schedule-form-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g., Morning Exercise"
            required
          />
        </div>

        {/* Description */}
        <div className="schedule-form-group">
          <label className="schedule-form-label">Description (optional)</label>
          <textarea
            className="schedule-form-input schedule-form-textarea"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description of this schedule..."
          />
        </div>

        {/* Type / Times row */}
        <div className="schedule-create-form-row">
          <div className="schedule-form-group">
            <label className="schedule-form-label">Type</label>
            <select
              className="schedule-form-input schedule-form-select"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="schedule-form-group">
            <label className="schedule-form-label">Start Time</label>
            <input
              type="time"
              className="schedule-form-input"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            />
          </div>
          <div className="schedule-form-group">
            <label className="schedule-form-label">End Time</label>
            <input
              type="time"
              className="schedule-form-input"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            />
          </div>
        </div>

        {/* Weekly: Days of Week */}
        {form.type === 'weekly' && (
          <div className="schedule-form-group">
            <label className="schedule-form-label">Days of Week</label>
            <div className="schedule-days-grid">
              {dayNames.map((name, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggleDay(i)}
                  className={`schedule-day-btn ${form.days_of_week.includes(i) ? 'selected' : ''}`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Monthly: Day of Month */}
        {form.type === 'monthly' && (
          <div className="schedule-form-group">
            <label className="schedule-form-label">Day of Month</label>
            <input
              type="number"
              className="schedule-form-input schedule-day-input"
              min={1}
              max={31}
              value={form.day_of_month}
              onChange={(e) => setForm({ ...form, day_of_month: e.target.value })}
              placeholder="1-31"
            />
          </div>
        )}

        {/* Submit */}
        <div className="schedule-form-actions">
          <button
            type="submit"
            className="schedule-form-btn schedule-form-btn-primary schedule-form-submit-btn"
            disabled={isPending}
          >
            {isPending && <Loader2 className="schedule-form-spinner" />}
            Create Schedule
          </button>
        </div>
      </div>
    </form>
  );
}
