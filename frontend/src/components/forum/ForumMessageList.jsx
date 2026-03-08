import { useEffect, useRef } from 'react';
import { Trash2, Edit2, Reply, MessageSquare } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AVATAR_COLORS = [
  'bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600',
  'bg-cyan-600', 'bg-purple-600', 'bg-pink-600', 'bg-teal-600',
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
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="text-center text-slate-400">
          <MessageSquare size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-lg font-semibold text-slate-700">No replies yet</p>
          <p className="text-sm mt-1">Be the first to reply to this post!</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto bg-white">
      <div className="px-4 py-4 space-y-0.5">
        {messageList.map((message, index) => {
          const showHeader = shouldShowHeader(messageList, index);
          const isOwn = message.user_id === user?.id;
          // Only show reply indicator for nested replies (reply to other messages, not main post)
          const isNestedReply = message.reply_to && message.reply_to_id !== selectedPost?.id;

          return (
            <div
              key={message.id}
              className={`group relative rounded-md px-3 transition ${showHeader ? 'pt-3' : 'pt-0.5'} ${
                isNestedReply
                  ? 'ml-6 border-l-2 border-indigo-200 bg-indigo-50/30 hover:bg-indigo-50/50 pl-4' 
                  : 'hover:bg-slate-50'
              }`}
            >
              {/* Reply indicator - only for nested replies */}
              {isNestedReply && (
                <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500">
                  <Reply size={12} className="text-indigo-400" />
                  <span className="font-medium text-indigo-600">Replying to {message.reply_to.user?.name}</span>
                  <span className="truncate max-w-[200px] text-slate-400">"{message.reply_to.content}"</span>
                </div>
              )}

              <div className="flex gap-3">
                {/* Avatar or spacer */}
                {showHeader ? (
                  <div className={`w-10 h-10 rounded-full ${getAvatarColor(message.user_id)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {message.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                ) : (
                  <div className="w-10 flex-shrink-0 flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {showHeader && (
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="font-semibold text-sm text-slate-900 hover:underline cursor-pointer">
                        {message.user?.name || 'Unknown'}
                      </span>
                      <span className="text-xs text-slate-400">{formatTimestamp(message.created_at)}</span>
                      {message.is_edited && (
                        <span className="text-[10px] text-slate-400">(edited)</span>
                      )}
                    </div>
                  )}
                  <p className="text-sm text-slate-700 break-words leading-relaxed">{message.content}</p>
                </div>

                {/* Action buttons */}
                <div className="absolute right-2 -top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center bg-white border border-slate-200 rounded-md shadow-sm">
                    <button
                      onClick={() => onReply(message)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-l-md transition"
                      title="Reply"
                    >
                      <Reply size={16} />
                    </button>
                    {isOwn && (
                      <>
                        <button
                          onClick={() => onEdit(message)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(message)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-r-md transition"
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
