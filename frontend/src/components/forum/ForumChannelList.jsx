import { Hash, Volume2, Plus, ChevronDown, Settings, Trash2 } from 'lucide-react';
import '../../styles/components/forum/ForumComponents.css';
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
    <div className="forum-channel-panel">
      {/* Channel List */}
      <div className="forum-channel-list">
        {/* Category Header */}
        <button
          onClick={() => toggleCategory(forum.id)}
          className="forum-channel-category"
        >
          <ChevronDown
            size={12}
            className="forum-category-chevron"
            style={{ transform: collapsed[forum.id] ? 'rotate(-90deg)' : 'rotate(0deg)' }}
          />
          Text Channels
        </button>

        {!collapsed[forum.id] &&
          channels
            .filter((c) => c.type === 'text')
            .map((channel) => (
              <div key={channel.id} className="forum-channel-item-wrapper">
                <button
                  onClick={() => onChannelSelect(channel)}
                  className={`forum-channel-btn ${activeChannelId === channel.id ? 'active' : ''}`}
                >
                  <Hash size={18} style={{ color: activeChannelId === channel.id ? '#6366f1' : '#94a3b8' }} />
                  <span className="forum-channel-name">{channel.name}</span>
                  {onDeleteChannel && (
                    <Trash2
                      size={14}
                      className="forum-channel-delete"
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
            <button className="forum-channel-category" style={{ marginTop: '0.75rem' }}>
              <ChevronDown size={12} />
              Voice Channels
            </button>
            {channels
              .filter((c) => c.type === 'voice')
              .map((channel) => (
                <div key={channel.id} className="forum-channel-item-wrapper">
                  <button
                    onClick={() => onChannelSelect(channel)}
                    className={`forum-channel-btn ${activeChannelId === channel.id ? 'active' : ''}`}
                  >
                    <Volume2 size={18} style={{ color: activeChannelId === channel.id ? '#6366f1' : '#94a3b8' }} />
                    <span className="forum-channel-name">{channel.name}</span>
                  </button>
                </div>
              ))}
          </>
        )}
      </div>

      {/* Create Channel Button */}
      <div className="forum-channel-footer">
        <button
          onClick={onCreateChannel}
          className="forum-create-channel-btn"
        >
          <Plus size={16} />
          Create Channel
        </button>
      </div>
    </div>
  );
}
