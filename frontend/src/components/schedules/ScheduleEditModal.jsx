import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import '../../styles/components/schedules/ScheduleComponents.css';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleEditModal({ schedule, onSave, onClose, isPending }) {
  const [form, setForm] = useState({
    title: schedule.title || '',
    description: schedule.description || '',
    type: schedule.type || 'daily',
    start_time: schedule.start_time || '',
    end_time: schedule.end_time || '',
    days_of_week: schedule.days_of_week || [],
    day_of_month: schedule.day_of_month || '',
    is_active: Boolean(schedule.is_active ?? true),
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
    onSave(payload);
  };

  return (
    <div className="schedule-modal-overlay" onClick={onClose}>
      <div className="schedule-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="schedule-modal-header">
          <h2 className="schedule-modal-title">Edit Schedule</h2>
          <button onClick={onClose} className="schedule-modal-close-btn">
            <X className="schedule-modal-close-icon" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="schedule-modal-body">
          <div className="schedule-create-form-grid">
            {/* Title */}
            <div className="schedule-form-group">
              <label className="schedule-form-label">Title</label>
              <input
                type="text"
                className="schedule-form-input"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="schedule-form-group">
              <label className="schedule-form-label">Description</label>
              <textarea
                className="schedule-form-input schedule-form-textarea"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Type / Times */}
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
                />
              </div>
            )}

            {/* Active toggle switch */}
            <div className="schedule-form-group">
              <label className="schedule-form-label">Status</label>
              <label className="schedule-toggle-switch">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <span className="schedule-toggle-slider" />
                <span className={`schedule-toggle-label ${form.is_active ? 'active' : 'paused'}`}>
                  {form.is_active ? 'Active' : 'Paused'}
                </span>
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="schedule-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="schedule-form-btn schedule-form-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="schedule-form-btn schedule-form-btn-primary schedule-form-submit-btn"
              disabled={isPending}
            >
              {isPending && <Loader2 className="schedule-form-spinner" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
