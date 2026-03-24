import { useTranslation } from 'react-i18next';
import { AlertTriangle, X } from 'lucide-react';
import '../../styles/components/forum/ForumModals.css';

export default function DeleteConfirmModal({ onClose, onConfirm, loading }) {
  const { t } = useTranslation(['forum', 'common']);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-container-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="delete-modal-icon-wrapper">
            <div className="delete-modal-icon-circle">
              <AlertTriangle size={20} />
            </div>
            <h3 className="modal-title">{t('forum:deleteModal.title')}</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="delete-modal-message">
            {t('forum:deleteModal.message')}
          </p>
          <div className="delete-modal-warning">
            {t('forum:deleteModal.warning')}
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-footer">
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-secondary"
              disabled={loading}
            >
              {t('common:cancel')}
            </button>
            <button 
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="btn btn-danger"
            >
              {loading ? t('common:deleting') : t('forum:deleteModal.deletePost')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
