import { AlertTriangle, X } from 'lucide-react';
import '../../styles/components/forum/ForumModals.css';

export default function DeleteConfirmModal({ onClose, onConfirm, loading }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container modal-container-small" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} style={{ color: '#dc2626' }} />
            </div>
            <h3 className="modal-title">Delete Post</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="delete-modal-message">
            Are you sure you want to delete this post?
          </p>
          <div className="delete-modal-warning">
            This action cannot be undone. All replies to this post will also be deleted.
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
              Cancel
            </button>
            <button 
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="btn btn-danger"
            >
              {loading ? 'Deleting...' : 'Delete Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
