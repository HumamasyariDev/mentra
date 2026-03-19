import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import '../../styles/components/tasks/TaskComponents.css';

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
    <form onSubmit={handleSubmit} className="task-create-form">
      <div className="task-create-form-grid">
        <div className="task-form-group">
          <label className="task-form-label">Title</label>
          <input
            type="text"
            className="task-form-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="What needs to be done?"
            required
          />
        </div>
        <div className="task-form-group">
          <label className="task-form-label">Description (optional)</label>
          <textarea
            className="task-form-input task-form-textarea"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Add details..."
          />
        </div>
        <div className="task-create-form-row">
          <div className="task-form-group">
            <label className="task-form-label">Priority</label>
            <select
              className="task-form-select"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="task-form-group">
            <label className="task-form-label">Due Date (optional)</label>
            <input
              type="date"
              className="task-form-input"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>
        </div>
      </div>
      <div className="task-form-actions">
        <button
          type="submit"
          className="task-form-btn task-form-btn-primary task-form-submit-btn"
          disabled={isPending}
        >
          {isPending && <Loader2 className="task-form-spinner" />}
          Create Task
        </button>
      </div>
    </form>
  );
}
