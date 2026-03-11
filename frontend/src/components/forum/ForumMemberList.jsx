import { Crown, Circle } from 'lucide-react';
import '../../styles/components/forum/ForumComponents.css';
import { useAuth } from '../../contexts/AuthContext';

const AVATAR_COLORS = [
  '#4f46e5', '#059669', '#d97706', '#e11d48',
  '#0891b2', '#7c3aed', '#db2777', '#0d9488',
];

function getAvatarColor(userId) {
  return AVATAR_COLORS[(userId || 0) % AVATAR_COLORS.length];
}

export default function ForumMemberList({ members }) {
  const { user: currentUser } = useAuth();

  const uniqueMembers = [];
  const seen = new Set();
  (members || []).forEach((m) => {
    if (!seen.has(m.user_id) && m.user) {
      seen.add(m.user_id);
      uniqueMembers.push(m.user);
    }
  });

  if (currentUser && !seen.has(currentUser.id)) {
    uniqueMembers.unshift(currentUser);
  }

  return (
    <div className="forum-member-panel">
      <div className="forum-member-header">
        <div className="forum-member-header-content">
          <Users size={16} />
          <span className="forum-member-header-title">
            Members — {uniqueMembers.length}
          </span>
        </div>
      </div>

      <div className="forum-member-list">
        {uniqueMembers.map((member) => (
          <div
            key={member.id}
            className="forum-member-item"
          >
            <div className="forum-member-avatar-container">
              <div className="forum-member-avatar" style={{ backgroundColor: getAvatarColor(member.id) }}>
                {member.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="forum-member-status" />
            </div>
            <div className="forum-member-info">
              <p className="forum-member-name">
                {member.name}
                {member.id === currentUser?.id && (
                  <span className="forum-member-you">(you)</span>
                )}
              </p>
              {member.level && (
                <p className="forum-member-level">Level {member.level}</p>
              )}
            </div>
          </div>
        ))}

        {uniqueMembers.length === 0 && (
          <div className="forum-member-empty">
            No members yet
          </div>
        )}
      </div>
    </div>
  );
}
