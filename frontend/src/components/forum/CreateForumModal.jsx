import { useState } from 'react';
import { X } from 'lucide-react';
import '../../styles/components/forum/ForumModals.css';

const EMOJI_OPTIONS = ['💬', '🚀', '🎮', '📚', '🎨', '💡', '🔥', '⭐', '🎯', '🌟', '💪', '🧠'];

export default function CreateForumModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('💬');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        icon,
      });
      onClose();
    } catch (err) {
      console.error('Failed to create forum:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create Forum</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Icon Picker */}
          <div className="form-group">
            <label className="form-label">Icon</label>
            <div className="emoji-picker">
              {EMOJI_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`emoji-btn ${icon === emoji ? 'selected' : ''}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Forum Name */}
          <div className="form-group">
            <label className="form-label">Forum Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Forum"
              className="form-input"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this forum about?"
              className="form-input"
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Forum'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
