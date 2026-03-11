import { MessageCircle, User, Clock } from 'lucide-react';
import '../../styles/components/forum/ForumComponents.css';

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
      className="forum-post-card"
    >
      <div className="forum-post-card-content">
        <div className="forum-post-avatar">
          {post.user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        
        <div className="forum-post-body">
          <h3 className="forum-post-card-title">
            {post.title || 'Untitled Post'}
          </h3>
          
          <p className="forum-post-card-preview">
            {post.content}
          </p>
          
          <div className="forum-post-card-meta">
            <div className="forum-post-meta-item">
              <User size={14} />
              <span>{post.user?.name || 'Anonymous'}</span>
            </div>
            
            {replyCount > 0 && (
              <div className="forum-post-meta-item">
                <MessageCircle size={14} />
                <span>{replyCount}</span>
              </div>
            )}
            
            <div className="forum-post-meta-item">
              <Clock size={14} />
              <span>{formatTimestamp(post.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
