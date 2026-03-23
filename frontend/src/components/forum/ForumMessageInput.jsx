import { useState, useRef, useEffect } from 'react';
import { Send, X, Plus, Smile } from 'lucide-react';
import '../../styles/components/forum/ForumComponents.css';

export default function ForumMessageInput({ onSend, replyTo, onCancelReply, editMessage, onCancelEdit }) {
  const [message, setMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editMessage) {
      setMessage(editMessage.content);
      inputRef.current?.focus();
    }
  }, [editMessage]);

  useEffect(() => {
    if (replyTo) {
      inputRef.current?.focus();
    }
  }, [replyTo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
    if (e.key === 'Escape') {
      if (editMessage) onCancelEdit();
      if (replyTo) onCancelReply();
    }
  };

  return (
    <div className="forum-input-container">
      {/* Reply Bar */}
      {replyTo && (
        <div className="forum-reply-bar">
          <div className="forum-reply-info">
            <span className="forum-reply-label">
              Replying to <span className="forum-reply-username">{replyTo.user?.name}</span>
            </span>
            <p className="forum-reply-content">{replyTo.content}</p>
          </div>
          <button onClick={onCancelReply} className="forum-cancel-btn">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Edit Bar */}
      {editMessage && (
        <div className="forum-edit-bar">
          <span className="forum-edit-label">Editing message</span>
          <button onClick={onCancelEdit} className="forum-cancel-edit-btn">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="forum-input-form">
        <button
          type="button"
          className="forum-input-action-btn"
          title="Attachments coming soon"
          onClick={() => {/* Attachment feature not yet implemented */}}
        >
          <Plus size={20} />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a reply..."
          className="forum-input-field"
          maxLength={2000}
        />
        <div className="forum-input-actions">
          <button
            type="button"
            className="forum-input-action-btn"
            title="Emoji picker coming soon"
            onClick={() => {/* Emoji picker not yet implemented */}}
          >
            <Smile size={20} />
          </button>
          {message.trim() && (
            <button
              type="submit"
              className="forum-input-send-btn"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
