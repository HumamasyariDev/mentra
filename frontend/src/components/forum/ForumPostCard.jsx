import { MessageCircle, User, Clock } from 'lucide-react';

function formatTimestamp(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
}

export default function ForumPostCard({ post, onClick }) {
  const replyCount = post.replies?.length || 0;

  return (
    <button
      onClick={() => onClick(post)}
      className="w-full bg-white border border-slate-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-md transition-all text-left group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0 font-semibold">
          {post.user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition mb-1 line-clamp-2">
            {post.title || 'Untitled Post'}
          </h3>
          
          <p className="text-sm text-slate-600 line-clamp-2 mb-3">
            {post.content}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{post.user?.name || 'Anonymous'}</span>
            </div>
            
            {replyCount > 0 && (
              <div className="flex items-center gap-1">
                <MessageCircle size={14} />
                <span>{replyCount}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{formatTimestamp(post.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
