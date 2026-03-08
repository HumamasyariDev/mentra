import { useState } from 'react';
import { X, Hash, Volume2 } from 'lucide-react';

export default function CreateChannelModal({ forumId, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('text');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSubmit({
        forum_id: forumId,
        name: name.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description.trim(),
        type,
      });
      onClose();
    } catch (err) {
      console.error('Failed to create channel:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-900">Create Channel</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Channel Type */}
          <div>
            <label className="label">Channel Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType('text')}
                className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                  type === 'text'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Hash size={20} />
                <div className="text-left">
                  <p className="font-medium text-sm">Text</p>
                  <p className="text-xs opacity-70">Send messages</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setType('voice')}
                className={`flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
                  type === 'voice'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Volume2 size={20} />
                <div className="text-left">
                  <p className="font-medium text-sm">Voice</p>
                  <p className="text-xs opacity-70">Hang out together</p>
                </div>
              </button>
            </div>
          </div>

          {/* Channel Name */}
          <div>
            <label className="label">Channel Name</label>
            <div className="flex items-center gap-2 input-field">
              {type === 'text' ? <Hash size={16} className="text-slate-400" /> : <Volume2 size={16} className="text-slate-400" />}
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="new-channel"
                className="flex-1 bg-transparent focus:outline-none text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              className="input-field"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={!name.trim() || loading} className="btn-primary">
              {loading ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
