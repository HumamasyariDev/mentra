import { useEffect, useRef } from 'react';
import { Loader2, Reply, Edit2, Trash2, MoreVertical } from 'lucide-react';
import '../../styles/components/forum/ForumComponents.css';
import { useAuth } from '../../contexts/AuthContext';

const AVATAR_COLORS = [
  '#4f46e5', '#059669', '#d97706', '#e11d48',
  '#0891b2', '#7c3aed', '#db2777', '#0d9488',
];

function getAvatarColor(userId) {
  return AVATAR_COLORS[(userId || 0) % AVATAR_COLORS.length];
}

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function shouldShowHeader(messages, index) {
  if (index === 0) return true;
  const current = messages[index];
  const previous = messages[index - 1];
  if (current.user_id !== previous.user_id) return true;
  const diff = new Date(current.created_at) - new Date(previous.created_at);
  return diff > 5 * 60 * 1000;
}

export default function ForumMessageList({ messages, selectedPost, onReply, onEdit, onDelete }) {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const messageList = messages?.data || [];

  if (messageList.length === 0) {
    return (
      <div className="forum-message-list-empty">
        <div className="forum-empty-state">
          <MessageSquare size={48} style={{ margin: '0 auto 0.75rem', color: '#cbd5e1' }} />
          <p className="forum-empty-title">No replies yet</p>
          <p className="forum-empty-subtitle">Be the first to reply to this post!</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="forum-message-list">
      <div className="forum-message-list-content">
        {messageList.map((message, index) => {
          const showHeader = shouldShowHeader(messageList, index);
          const isOwn = message.user_id === user?.id;
          // Only show reply indicator for nested replies (reply to other messages, not main post)
          const isNestedReply = message.reply_to && message.reply_to_id !== selectedPost?.id;

          return (
            <div
              key={message.id}
              className={`forum-message-item ${isNestedReply ? 'nested-reply' : ''}`}
              style={{
                paddingTop: showHeader ? '0.75rem' : '0.125rem'
              }}
            >
              {/* Reply indicator - only for nested replies */}
              {isNestedReply && (
                <div className="forum-reply-indicator">
                  <Reply size={12} style={{ color: '#818cf8' }} />
                  <span className="forum-reply-to-user">Replying to {message.reply_to.user?.name}</span>
                  <span className="forum-reply-preview">"{message.reply_to.content}"</span>
                </div>
              )}

              <div className="forum-message-content">
                {/* Avatar or spacer */}
                {showHeader ? (
                  <div className="forum-message-avatar" style={{ backgroundColor: getAvatarColor(message.user_id) }}>
                    {message.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                ) : (
                  <div className="forum-message-spacer">
                    <span className="forum-message-time-hover">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="forum-message-body">
                  {showHeader && (
                    <div className="forum-message-header">
                      <span className="forum-message-username">
                        {message.user?.name || 'Unknown'}
                      </span>
                      <span className="forum-message-timestamp">{formatTimestamp(message.created_at)}</span>
                      {message.is_edited && (
                        <span className="forum-message-edited">(edited)</span>
                      )}
                    </div>
                  )}
                  <p className="forum-message-text">{message.content}</p>
                </div>

                {/* Action buttons */}
                <div className="forum-message-actions">
                  <div className="forum-message-actions-toolbar">
                    <button
                      onClick={() => onReply(message)}
                      className="forum-action-btn reply"
                      title="Reply"
                    >
                      <Reply size={16} />
                    </button>
                    {isOwn && (
                      <>
                        <button
                          onClick={() => onEdit(message)}
                          className="forum-action-btn edit"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(message)}
                          className="forum-action-btn delete"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
