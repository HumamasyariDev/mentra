import { Hash, Volume2, Plus, ChevronDown, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function ForumChannelList({
  forum,
  channels,
  activeChannelId,
  onChannelSelect,
  onCreateChannel,
  onDeleteChannel,
}) {
  const [collapsed, setCollapsed] = useState({});

  const toggleCategory = (forumId) => {
    setCollapsed((prev) => ({ ...prev, [forumId]: !prev[forumId] }));
  };

  if (!forum) return null;

  return (
    <div className="w-60 bg-slate-50 border-r border-slate-200 flex flex-col flex-shrink-0">
      {/* Channel List */}
      <div className="flex-1 overflow-y-auto py-2 pt-3">
        {/* Category Header */}
        <button
          onClick={() => toggleCategory(forum.id)}
          className="w-full px-2 py-1 flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition"
        >
          <ChevronDown
            size={12}
            className={`transition-transform ${collapsed[forum.id] ? '-rotate-90' : ''}`}
          />
          Text Channels
        </button>

        {!collapsed[forum.id] &&
          channels
            .filter((c) => c.type === 'text')
            .map((channel) => (
              <div key={channel.id} className="group px-2">
                <button
                  onClick={() => onChannelSelect(channel)}
                  className={`w-full px-2 py-1.5 rounded flex items-center gap-2 transition text-sm ${
                    activeChannelId === channel.id
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                  }`}
                >
                  <Hash size={18} className={activeChannelId === channel.id ? 'text-indigo-500' : 'text-slate-400'} />
                  <span className="truncate flex-1 text-left">{channel.name}</span>
                  {onDeleteChannel && (
                    <Trash2
                      size={14}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChannel(channel);
                      }}
                    />
                  )}
                </button>
              </div>
            ))}

        {/* Voice Channels */}
        {channels.some((c) => c.type === 'voice') && (
          <>
            <button className="w-full px-2 py-1 mt-3 flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-700 transition">
              <ChevronDown size={12} />
              Voice Channels
            </button>
            {channels
              .filter((c) => c.type === 'voice')
              .map((channel) => (
                <div key={channel.id} className="group px-2">
                  <button
                    onClick={() => onChannelSelect(channel)}
                    className={`w-full px-2 py-1.5 rounded flex items-center gap-2 transition text-sm ${
                      activeChannelId === channel.id
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900'
                    }`}
                  >
                    <Volume2 size={18} className={activeChannelId === channel.id ? 'text-indigo-500' : 'text-slate-400'} />
                    <span className="truncate flex-1 text-left">{channel.name}</span>
                  </button>
                </div>
              ))}
          </>
        )}
      </div>

      {/* Create Channel Button */}
      <div className="p-3 border-t border-slate-200">
        <button
          onClick={onCreateChannel}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded-lg transition"
        >
          <Plus size={16} />
          Create Channel
        </button>
      </div>
    </div>
  );
}
