import { Plus } from 'lucide-react';

export default function ForumServerList({ forums, activeForumId, onForumSelect, onCreateForum }) {
  return (
    <div className="w-[72px] bg-slate-100 border-r border-slate-200 flex flex-col items-center py-3 gap-2 flex-shrink-0">
      {forums.map((forum) => (
        <button
          key={forum.id}
          onClick={() => onForumSelect(forum)}
          title={forum.name}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold transition-all duration-200 hover:rounded-xl ${
            activeForumId === forum.id
              ? 'bg-indigo-600 text-white rounded-xl shadow-md'
              : 'bg-white text-slate-600 hover:bg-indigo-100 hover:text-indigo-600'
          }`}
        >
          {forum.icon || forum.name.charAt(0).toUpperCase()}
        </button>
      ))}

      <div className="w-8 border-t border-slate-300 my-1" />

      <button
        onClick={onCreateForum}
        title="Create Forum"
        className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center hover:bg-emerald-100 hover:rounded-xl transition-all duration-200"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}
