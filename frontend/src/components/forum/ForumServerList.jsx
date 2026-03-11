import { Plus } from 'lucide-react';
import '../../styles/components/forum/ForumComponents.css';

export default function ForumServerList({ forums, activeForumId, onForumSelect, onCreateForum }) {
  return (
    <div className="forum-server-list">
      {forums.map((forum) => (
        <button
          key={forum.id}
          onClick={() => onForumSelect(forum)}
          title={forum.name}
          className={`forum-server-btn ${activeForumId === forum.id ? 'active' : ''}`}
        >
          {forum.icon || forum.name.charAt(0).toUpperCase()}
        </button>
      ))}

      <div className="forum-server-divider" />

      <button
        onClick={onCreateForum}
        title="Create Forum"
        className="forum-server-create-btn"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
