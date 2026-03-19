import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import '../styles/pages/Forum.css';
import { forumPostApi } from '../services/api';
import CreatePostModal from '../components/forum/CreatePostModal';
import { Search, ChevronDown, Plus, Loader2, MessageSquare, Trash2, Edit2, X, Send } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EditPostModal from '../components/forum/EditPostModal';
import DeleteConfirmModal from '../components/forum/DeleteConfirmModal';

export default function Forum() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [viewAs, setViewAs] = useState('list');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

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
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }) => forumPostApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => forumPostApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
      setShowDeleteConfirm(false);
      setPostToDelete(null);
    },
  });

  // ─── Handlers ───
  const handleEditPost = (post) => {
    setPostToEdit(post);
    setShowEditPost(true);
  };

  const handleDeletePost = (post) => {
    setPostToDelete(post);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deletePostMutation.mutate(postToDelete.id);
    }
  };

  const handleUpdatePost = async (data) => {
    if (postToEdit) {
      await updatePostMutation.mutateAsync({ 
        id: postToEdit.id, 
        data 
      });
      setShowEditPost(false);
      setPostToEdit(null);
    }
  };

  // Format timestamp
  const formatTimestamp = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } else {
      return postDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    if (sortBy === 'recent') {
      // Sort by most recent activity (latest reply or creation)
      return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
    }
    if (sortBy === 'date') {
      // Sort by creation date
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return 0;
  });

  return (
    <div className="forum-split-container">
      {/* Left Panel - Post List */}
      <div className={`forum-left-panel ${selectedPost ? 'has-selection' : ''}`}>
        {/* Header */}
        <div className="forum-header">
          <div className="forum-header-content">
          <div className="forum-header-top">
            <h1 className="forum-title">Forum</h1>
            <button
              onClick={() => setShowCreatePost(true)}
              className="forum-new-post-btn"
            >
              <Plus size={18} />
              New Post
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="forum-search-container">
            <Search className="forum-search-icon" size={18} />
            <input
              type="text"
              placeholder="Search or create a post..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="forum-search-input"
            />
          </div>

          {/* Sort & View Dropdown */}
          <div className="forum-sort-container">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="forum-sort-btn"
            >
              <span>Sort & View</span>
              <ChevronDown size={16} />
            </button>

            {/* Dropdown Menu */}
            {showSortDropdown && (
              <>
                <div 
                  className="forum-dropdown-overlay" 
                  onClick={() => setShowSortDropdown(false)}
                />
                <div className="forum-dropdown-menu">
                  {/* Sort By Section */}
                  <div className="forum-dropdown-section">
                    <div className="forum-dropdown-section-title">Sort By</div>
                    <div className="forum-dropdown-options">
                      <label className="forum-dropdown-option">
                        <input
                          type="radio"
                          name="sortBy"
                          value="recent"
                          checked={sortBy === 'recent'}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="forum-radio-input"
                        />
                        <span className="forum-option-label">Recently Active</span>
                      </label>
                      <label className="forum-dropdown-option">
                        <input
                          type="radio"
                          name="sortBy"
                          value="date"
                          checked={sortBy === 'date'}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="forum-radio-input"
                        />
                        <span className="forum-option-label">Date Posted</span>
                      </label>
                    </div>
                  </div>

                  {/* View As Section */}
                  <div className="forum-dropdown-section forum-dropdown-section-last">
                    <div className="forum-dropdown-section-title">View As</div>
                    <div className="forum-dropdown-options">
                      <label className="forum-dropdown-option">
                        <input
                          type="radio"
                          name="viewAs"
                          value="list"
                          checked={viewAs === 'list'}
                          onChange={(e) => setViewAs(e.target.value)}
                          className="forum-radio-input"
                        />
                        <span className="forum-option-label">List</span>
                      </label>
                      <label className="forum-dropdown-option">
                        <input
                          type="radio"
                          name="viewAs"
                          value="gallery"
                          checked={viewAs === 'gallery'}
                          onChange={(e) => setViewAs(e.target.value)}
                          className="forum-radio-input"
                        />
                        <span className="forum-option-label">Gallery</span>
                      </label>
                    </div>
                  </div>

                  {/* Reset to default */}
                  <div className="forum-dropdown-reset">
                    <button
                      onClick={() => {
                        setSortBy('recent');
                        setViewAs('list');
                      }}
                      className="forum-reset-btn"
                    >
                      Reset to default
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          </div>
        </div>

        {/* Posts List */}
        <div className="forum-posts-container">
        {postsLoading ? (
          <div className="forum-loading">
            <Loader2 className="forum-loading-spinner" size={32} />
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="forum-empty">
            <MessageSquare size={48} className="forum-empty-icon" />
            <p className="forum-empty-title">
              {searchQuery ? 'No posts found' : 'No posts yet'}
            </p>
            <p className="forum-empty-subtitle">
              {searchQuery ? 'Try a different search term' : 'Be the first to start a discussion'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowCreatePost(true)}
                className="forum-empty-cta"
              >
                Create First Post
              </button>
            )}
          </div>
        ) : (
          <div className="forum-posts-list">
            {sortedPosts.map((post) => {
              const replyCount = (posts?.data || []).filter(m => m.reply_to_id === post.id).length;
              return (
                <div 
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className={`forum-post-card ${selectedPost?.id === post.id ? 'selected' : ''}`}
                >
                  {/* Title */}
                  <h3 className="forum-post-title">
                    {post.title || 'Untitled Post'}
                  </h3>
                  
                  {/* Username + Content in one line */}
                  <p className="forum-post-preview">
                    <span className="forum-post-author">{post.user?.name || 'Anonymous'}</span>
                    {post.content && (
                      <span>: {post.content}</span>
                    )}
                  </p>
                  
                  {/* Meta info - message count and timestamp */}
                  <div className="forum-post-meta">
                    <div className="forum-post-replies">
                      <MessageSquare size={14} />
                      <span>{replyCount}</span>
                    </div>
                    <span className="forum-post-meta-dot">•</span>
                    <span>{formatTimestamp(post.created_at)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
      </div>

      {/* Right Panel - Post Detail */}
      {selectedPost && (
        <div className="forum-right-panel">
          {/* Detail Header */}
          <div className="forum-detail-header">
            <div className="forum-detail-title-wrapper">
              <MessageSquare size={20} style={{ color: '#475569' }} />
              <h2 className="forum-detail-title">{selectedPost.title}</h2>
            </div>
            <button
              onClick={() => setSelectedPost(null)}
              className="forum-close-detail-btn"
            >
              <X size={20} />
            </button>
          </div>

          {/* Post Content */}
          <div className="forum-detail-content">
            {/* Original Post Section */}
            <div className="forum-detail-post">
              {/* Large Message Icon + Title */}
              <div className="forum-detail-post-header">
                <div className="forum-detail-icon">
                  <MessageSquare size={32} style={{ color: '#ffffff' }} />
                </div>
                <h1 className="forum-detail-post-title">{selectedPost.title}</h1>
                <p className="forum-detail-post-subtitle">
                  {selectedPost.user?.name || 'Anonymous'} started this post • {new Date(selectedPost.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>

              {/* Original Post Content */}
              <div className="forum-message">
                <div className="forum-message-avatar">
                  {(selectedPost.user?.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="forum-message-content">
                  <div className="forum-message-header">
                    <span className="forum-message-author">{selectedPost.user?.name || 'Anonymous'}</span>
                    <span className="forum-message-time">{new Date(selectedPost.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                  </div>
                  <p className="forum-message-text">{selectedPost.content}</p>
                </div>
              </div>

              {/* React to Post Button */}
              <div className="forum-react-btn">
                <MessageSquare size={16} style={{ color: '#64748b' }} />
                <span>React to Post</span>
              </div>
            </div>

            {/* Replies Section */}
            {(posts?.data || []).filter(m => m.reply_to_id === selectedPost.id).length > 0 && (
              <>
                {/* Date Separator */}
                <div className="forum-date-separator">
                  <div className="forum-separator-line"></div>
                  <span className="forum-separator-text">
                    {new Date((posts?.data || []).filter(m => m.reply_to_id === selectedPost.id)[0]?.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <div className="forum-separator-line"></div>
                </div>

                {/* Replies List */}
                <div className="forum-replies-list">
                  {(posts?.data || [])
                    .filter(m => m.reply_to_id === selectedPost.id)
                    .map(reply => (
                      <div key={reply.id} className="forum-reply-item">
                        <div className="forum-reply-avatar">
                          {(reply.user?.name || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="forum-reply-content">
                          <div className="forum-reply-header">
                            <span className="forum-reply-author">{reply.user?.name || 'Anonymous'}</span>
                            {reply.user_id === selectedPost.user_id && (
                              <span className="forum-op-badge">
                                OP
                              </span>
                            )}
                            <span className="forum-reply-time">{new Date(reply.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                          </div>
                          <p className="forum-reply-text">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>

          {/* Reply Input */}
          <div className="forum-reply-input-container">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (replyContent.trim()) {
                  createPostMutation.mutate(
                    { content: replyContent.trim(), reply_to_id: selectedPost.id },
                    {
                      onSuccess: () => {
                        setReplyContent('');
                      }
                    }
                  );
                }
              }}
              className="forum-reply-form"
            >
              <button
                type="button"
                className="forum-reply-add-btn"
              >
                <Plus size={20} />
              </button>
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Send a message in "${selectedPost.title}"`}
                disabled={createPostMutation.isPending}
                className="forum-reply-input"
              />
              {replyContent.trim() && (
                <button
                  type="submit"
                  disabled={createPostMutation.isPending}
                  className="forum-reply-send-btn"
                >
                  {createPostMutation.isPending ? (
                    <Loader2 size={18} className="forum-loading-spinner" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePostModal
          onClose={() => setShowCreatePost(false)}
          onSubmit={(data) => createPostMutation.mutateAsync(data)}
        />
      )}

      {/* Edit Post Modal */}
      {showEditPost && postToEdit && (
        <EditPostModal
          post={postToEdit}
          onClose={() => {
            setShowEditPost(false);
            setPostToEdit(null);
          }}
          onSubmit={handleUpdatePost}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && postToDelete && (
        <DeleteConfirmModal
          onClose={() => {
            setShowDeleteConfirm(false);
            setPostToDelete(null);
          }}
          onConfirm={confirmDelete}
          loading={deletePostMutation.isPending}
        />
      )}
    </div>
  );
}
