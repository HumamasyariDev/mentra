import { useState } from 'react';
import { X } from 'lucide-react';
import '../../styles/components/forum/ForumModals.css';

export default function EditPostModal({ post, onClose, onSubmit }) {
  const isReply = !!post?.reply_to_id;
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!isReply && !title.trim()) || !content.trim()) return;
    
    setLoading(true);
    try {
      const data = { content: content.trim() };
      if (!isReply) data.title = title.trim();
      await onSubmit(data);
      onClose();
    } catch (err) {
      console.error('Failed to update:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isReply ? 'Edit Reply' : 'Edit Post'}</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="modal-form">
            {!isReply && (
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
            )}

            <div className="form-group">
              <label className="form-label">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={isReply ? "Edit your reply..." : "Share your thoughts, ask questions, or start a discussion..."}
                className="form-input form-textarea"
                autoFocus={isReply}
                rows={isReply ? 4 : 8}
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
                disabled={(!isReply && !title.trim()) || !content.trim() || loading} 
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
