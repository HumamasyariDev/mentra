import { Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AVATAR_COLORS = [
  'bg-indigo-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600',
  'bg-cyan-600', 'bg-purple-600', 'bg-pink-600', 'bg-teal-600',
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
    <div className="w-60 bg-slate-50 border-l border-slate-200 flex flex-col flex-shrink-0">
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-slate-700">
          <Users size={16} />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Members — {uniqueMembers.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {uniqueMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 px-4 py-1.5 hover:bg-slate-100 transition"
          >
            <div className="relative">
              <div className={`w-8 h-8 rounded-full ${getAvatarColor(member.id)} flex items-center justify-center text-white text-xs font-bold`}>
                {member.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-50 rounded-full" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">
                {member.name}
                {member.id === currentUser?.id && (
                  <span className="text-xs text-slate-400 ml-1">(you)</span>
                )}
              </p>
              {member.level && (
                <p className="text-[10px] text-slate-400">Level {member.level}</p>
              )}
            </div>
          </div>
        ))}

        {uniqueMembers.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-slate-400">
            No members yet
          </div>
        )}
      </div>
    </div>
  );
}
