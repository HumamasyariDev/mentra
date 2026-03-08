import { useState, useRef, useEffect } from 'react';
import { Send, X, Plus, Smile } from 'lucide-react';

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
    <div className="px-4 pb-4 bg-white">
      {/* Reply Bar */}
      {replyTo && (
        <div className="mb-2 px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-t-lg flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <span className="text-xs font-medium text-indigo-600">
              Replying to <span className="font-bold">{replyTo.user?.name}</span>
            </span>
            <p className="text-xs text-slate-600 truncate">{replyTo.content}</p>
          </div>
          <button onClick={onCancelReply} className="text-slate-400 hover:text-slate-600 ml-2 transition">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Edit Bar */}
      {editMessage && (
        <div className="mb-2 px-3 py-2 bg-amber-50 border border-amber-100 rounded-t-lg flex items-center justify-between">
          <span className="text-xs font-medium text-amber-700">Editing message</span>
          <button onClick={onCancelEdit} className="text-amber-600 hover:text-amber-700 ml-2 transition">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1 border border-slate-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition">
        <button type="button" className="text-slate-400 hover:text-slate-600 transition p-1">
          <Plus size={20} />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write a reply..."
          className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 py-2 focus:outline-none"
          maxLength={2000}
        />
        <div className="flex items-center gap-1">
          <button type="button" className="text-slate-400 hover:text-slate-600 transition p-1">
            <Smile size={20} />
          </button>
          {message.trim() && (
            <button
              type="submit"
              className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              <Send size={16} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
