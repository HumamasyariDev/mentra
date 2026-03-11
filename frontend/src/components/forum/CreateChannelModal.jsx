import { useState } from 'react';
import { X, Hash, Volume2 } from 'lucide-react';
import '../../styles/components/forum/ForumModals.css';

export default function CreateChannelModal({ forumId, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('text');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        forum_id: forumId,
        name: name.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description.trim(),
        type,
      });
      onClose();
    } catch (err) {
      console.error('Failed to create channel:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create Channel</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Channel Type */}
          <div className="form-group">
            <label className="form-label">Channel Type</label>
            <div className="channel-type-buttons">
              <button
                type="button"
                onClick={() => setType('text')}
                className={`channel-type-btn ${type === 'text' ? 'selected' : ''}`}
              >
                <Hash size={20} />
                <div className="channel-type-info">
                  <p className="channel-type-title">Text</p>
                  <p className="channel-type-desc">Send messages</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setType('voice')}
                className={`channel-type-btn ${type === 'voice' ? 'selected' : ''}`}
              >
                <Volume2 size={20} />
                <div className="channel-type-info">
                  <p className="channel-type-title">Voice</p>
                  <p className="channel-type-desc">Hang out together</p>
                </div>
              </button>
            </div>
          </div>

          {/* Channel Name */}
          <div className="form-group">
            <label className="form-label">Channel Name</label>
            <div className="channel-name-input">
              {type === 'text' ? <Hash size={16} style={{ color: '#94a3b8' }} /> : <Volume2 size={16} style={{ color: '#94a3b8' }} />}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="new-channel"
                className="channel-name-field"
                autoFocus
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              className="form-input"
            />
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
