import { useState } from 'react';
import { X } from 'lucide-react';
import '../../styles/components/forum/ForumModals.css';

export default function CreatePostModal({ onClose, onSubmit, channels = [] }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [channelId, setChannelId] = useState(channels.length > 0 ? channels[0].id : '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !channelId) return;
    
    setLoading(true);
    try {
      await onSubmit({ 
        channel_id: channelId,
        title: title.trim(), 
        content: content.trim() 
      });
      onClose();
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Create New Post</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="modal-form">
            <div className="form-group">
              <label className="form-label">Channel</label>
              <select
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="form-input"
              >
                <option value="">Select a channel...</option>
                {channels.map((channel) => (
                  <option key={channel.id} value={channel.id}>
                    {channel.name} {channel.forum && `(${channel.forum.name})`}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's your post about?"
                className="form-input"
                autoFocus
                maxLength={255}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, ask questions, or start a discussion..."
                className="form-input form-textarea"
                rows={8}
                maxLength={2000}
              />
              <div className="form-char-count">
                {content.length}/2000
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!title.trim() || !content.trim() || !channelId || loading} 
                className="btn btn-primary"
              >
                {loading ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
