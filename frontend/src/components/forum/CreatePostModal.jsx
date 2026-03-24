import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import '../../styles/components/forum/ForumModals.css';

export default function CreatePostModal({ onClose, onSubmit }) {
  const { t } = useTranslation(['forum', 'common']);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setLoading(true);
    try {
      await onSubmit({ 
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
          <h3 className="modal-title">{t('forum:createModal.title')}</h3>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="modal-form">
            <div className="form-group">
              <label className="form-label">{t('forum:createModal.titleLabel')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('forum:createModal.titlePlaceholder')}
                className="form-input"
                autoFocus
                maxLength={255}
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('forum:createModal.contentLabel')}</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t('forum:createModal.contentPlaceholder')}
                className="form-input form-textarea"
                rows={8}
                maxLength={2000}
              />
              <div className="form-char-count">
                {t('forum:createModal.charCount', { count: content.length, max: 2000 })}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary">
                {t('common:cancel')}
              </button>
              <button 
                type="submit" 
                disabled={!title.trim() || !content.trim() || loading} 
                className="btn btn-primary"
              >
                {loading ? t('forum:createModal.creating') : t('forum:createModal.createPost')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
