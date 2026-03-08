import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { forumPostApi } from '../services/api';
import ForumPostCard from '../components/forum/ForumPostCard';
import CreatePostModal from '../components/forum/CreatePostModal';
import ForumMessageList from '../components/forum/ForumMessageList';
import ForumMessageInput from '../components/forum/ForumMessageInput';
import { Search, ChevronDown, Plus, Loader2, MessageSquare, ArrowLeft } from 'lucide-react';

export default function Forum() {
  const [selectedPost, setSelectedPost] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editMessage, setEditMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const queryClient = useQueryClient();

  // ─── Queries ───
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['forum-posts'],
    queryFn: () => forumPostApi.list().then((r) => r.data),
    refetchInterval: 5000,
  });

  // ─── Mutations ───
  const createPostMutation = useMutation({
    mutationFn: (data) => forumPostApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      setReplyTo(null); // Clear reply state after successful send
      setEditMessage(null); // Clear edit state too
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }) => forumPostApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      setEditMessage(null);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => forumPostApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['forum-posts'] }),
  });

  // ─── Handlers ───
  const handleSendMessage = (content) => {
    if (editMessage) {
      updatePostMutation.mutate({ 
        id: editMessage.id, 
        data: { content, title: editMessage.title } 
      });
    } else {
      // Reply to specific message if replyTo is set, otherwise reply to main post
      const replyToId = replyTo ? replyTo.id : (selectedPost ? selectedPost.id : null);
      createPostMutation.mutate({ 
        content, 
        reply_to_id: replyToId,
        title: null // Replies never have titles
      });
    }
  };

  const handleDeletePost = (post) => {
    if (confirm('Delete this post?')) {
      deletePostMutation.mutate(post.id);
    }
  };

  // Filter and sort posts
  const allPosts = (posts?.data || []).filter(m => !m.reply_to_id);
  const filteredPosts = allPosts.filter(post => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(search) ||
      post.content?.toLowerCase().includes(search) ||
      post.user?.name?.toLowerCase().includes(search)
    );
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    return 0;
  });

  // Get replies for selected post
  const postReplies = selectedPost 
    ? (posts?.data || []).filter(m => m.reply_to_id === selectedPost.id)
    : [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Forum</h1>
          <p className="text-slate-500 text-sm mt-0.5">Community discussions and posts</p>
        </div>
        <button onClick={() => setShowCreatePost(true)} className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          New Post
        </button>
      </div>

      {/* Split Layout */}
      <div className="flex gap-4 h-[calc(100vh-210px)]">
        {/* Left Sidebar - Post List */}
        <div className={`bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden transition-all ${
          selectedPost ? 'w-[420px] flex-shrink-0' : 'flex-1'
        }`}>
          {/* Search & Sort */}
          <div className="p-4 border-b border-slate-200 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition"
                />
              </div>
              {!selectedPost && (
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition cursor-pointer"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              )}
            </div>
            {selectedPost && (
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <MessageSquare size={14} />
                <span>{sortedPosts.length} posts</span>
              </div>
            )}
          </div>

          {/* Posts List */}
          <div className="flex-1 overflow-y-auto p-3">
            {postsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-indigo-500" size={28} />
              </div>
            ) : sortedPosts.length === 0 ? (
              <div className="text-center py-20 px-4">
                <MessageSquare size={40} className="mx-auto mb-3 text-slate-300" />
                <p className="text-base font-medium text-slate-600">
                  {searchQuery ? 'No posts found' : 'No posts yet'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {searchQuery ? 'Try a different search' : 'Create your first post!'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {sortedPosts.map((post) => (
                  <button
                    key={post.id}
                    onClick={() => {
                      setSelectedPost(post);
                      setReplyTo(null); // Don't auto-reply, user must click reply button
                      setEditMessage(null);
                    }}
                    className={`w-full p-3 rounded-lg border transition-all text-left ${
                      selectedPost?.id === post.id 
                        ? 'bg-indigo-50 border-indigo-500 shadow-sm' 
                        : 'bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <h3 className={`font-semibold text-sm mb-1 line-clamp-2 ${
                      selectedPost?.id === post.id ? 'text-indigo-600' : 'text-slate-900'
                    }`}>
                      {post.title || 'Untitled Post'}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">{post.content}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-medium">{post.user?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{new Date(post.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                      {(posts?.data || []).filter(m => m.reply_to_id === post.id).length > 0 && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MessageSquare size={12} />
                            <span>{(posts?.data || []).filter(m => m.reply_to_id === post.id).length}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Post Detail */}
        {selectedPost && (
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            {/* Post Header */}
            <div className="border-b border-slate-200 px-5 py-4 flex-shrink-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-lg flex-shrink-0">
                    {selectedPost.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">{selectedPost.user?.name || 'Anonymous'}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(selectedPost.created_at).toLocaleDateString([], { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <h2 className="font-bold text-xl text-slate-900 mb-2">
                      {selectedPost.title || 'Untitled Post'}
                    </h2>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition flex-shrink-0"
                  title="Close"
                >
                  <ArrowLeft size={20} className="text-slate-600" />
                </button>
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedPost.content}</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100">
                <MessageSquare size={16} className="text-slate-400" />
                <span className="text-sm text-slate-600">
                  {postReplies.length} {postReplies.length === 1 ? 'reply' : 'replies'}
                </span>
              </div>
            </div>

            {/* Replies */}
            {postsLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={28} />
              </div>
            ) : (
              <ForumMessageList
                messages={{ data: postReplies }}
                selectedPost={selectedPost}
                onReply={(msg) => { setReplyTo(msg); setEditMessage(null); }}
                onEdit={(msg) => { setEditMessage(msg); setReplyTo(null); }}
                onDelete={handleDeletePost}
              />
            )}

            {/* Reply Input */}
            <ForumMessageInput
              onSend={handleSendMessage}
              replyTo={replyTo}
              onCancelReply={() => setReplyTo(null)}
              editMessage={editMessage}
              onCancelEdit={() => setEditMessage(null)}
            />
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onSubmit={(data) => createPostMutation.mutateAsync(data)}
        />
      )}
    </div>
  );
}
