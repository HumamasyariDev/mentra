import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function TaskCreateForm({ onSubmit, isPending }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form, () => {
      setForm({ title: '', description: '', priority: 'medium', due_date: '' });
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
          placeholder="What needs to be done?"
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
          placeholder="Add details..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Priority</label>
          <select
            className="input-field"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div>
          <label className="label">Due Date (optional)</label>
          <input
            type="date"
            className="input-field"
            value={form.due_date}
            onChange={(e) => setForm({ ...form, due_date: e.target.value })}
          />
        </div>
      </div>
      <button
        type="submit"
        className="btn-primary flex items-center gap-2"
        disabled={isPending}
      >
        {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
        Create Task
      </button>
    </form>
  );
}
