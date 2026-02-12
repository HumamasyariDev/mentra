import { useState } from 'react';
import { Loader2 } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="card space-y-4">
      <div>
        <label className="label">Title</label>
        <input
          type="text"
          className="input-field"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g., Morning Exercise"
          required
        />
      </div>
      <div>
        <label className="label">Description (optional)</label>
        <textarea
          className="input-field"
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="label">Type</label>
          <select
            className="input-field"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="label">Start Time</label>
          <input
            type="time"
            className="input-field"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          />
        </div>
        <div>
          <label className="label">End Time</label>
          <input
            type="time"
            className="input-field"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
          />
        </div>
      </div>

      {form.type === 'weekly' && (
        <div>
          <label className="label">Days of Week</label>
          <div className="flex gap-2">
            {dayNames.map((name, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={`w-10 h-10 rounded-lg text-xs font-medium transition-colors ${
                  form.days_of_week.includes(i)
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {form.type === 'monthly' && (
        <div>
          <label className="label">Day of Month</label>
          <input
            type="number"
            className="input-field w-24"
            min={1}
            max={31}
            value={form.day_of_month}
            onChange={(e) => setForm({ ...form, day_of_month: e.target.value })}
          />
        </div>
      )}

      <button
        type="submit"
        className="btn-primary flex items-center gap-2"
        disabled={isPending}
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Create Schedule
      </button>
    </form>
  );
}
