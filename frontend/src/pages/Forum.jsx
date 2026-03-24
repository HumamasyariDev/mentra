import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../styles/pages/Forum.css';
import { forumPostApi } from '../services/api';
import CreatePostModal from '../components/forum/CreatePostModal';
import EditPostModal from '../components/forum/EditPostModal';
import DeleteConfirmModal from '../components/forum/DeleteConfirmModal';
import {
  Search, ChevronDown, Plus, Loader2, MessageSquare,
  Trash2, Edit2, X, Send, Filter, ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Forum() {
  const { t, i18n } = useTranslation(['forum', 'common']);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [filterBy, setFilterBy] = useState('all');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [panelReady, setPanelReady] = useState(false);
  const panelTimerRef = useRef(null);
  const [replyContent, setReplyContent] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Panel open/close animation
  const openPanel = useCallback((postId) => {
    clearTimeout(panelTimerRef.current);
    setSelectedPostId(postId);
    setPanelVisible(true);
    // Trigger enter animation on next frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setPanelReady(true));
    });
  }, []);

  const closePanel = useCallback(() => {
    setPanelReady(false);
    panelTimerRef.current = setTimeout(() => {
      setPanelVisible(false);
      setSelectedPostId(null);
    }, 250); // match CSS transition duration
  }, []);

  useEffect(() => {
    return () => clearTimeout(panelTimerRef.current);
  }, []);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(''), 5000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  // ─── Queries ───
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['forum-posts'],
    queryFn: () => forumPostApi.list().then((r) => r.data),
    refetchInterval: 5000,
  });

  // Derive selectedPost from live query data (never stale)
  const allMessages = posts?.data || [];
  const allPosts = useMemo(() => allMessages.filter((m) => !m.reply_to_id), [allMessages]);
  const selectedPost = useMemo(
    () => (selectedPostId ? allPosts.find((p) => p.id === selectedPostId) || null : null),
    [selectedPostId, allPosts],
  );

  const selectedReplies = useMemo(
    () =>
      selectedPostId
        ? allMessages
            .filter((m) => m.reply_to_id === selectedPostId)
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
        : [],
    [selectedPostId, allMessages],
  );

  // ─── Mutations ───
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['forum-posts'] });
  }, [queryClient]);

  const createPostMutation = useMutation({
    mutationFn: (data) => forumPostApi.create(data).then((r) => r.data),
    onSuccess: invalidate,
    onError: (err) => setErrorMessage(err?.response?.data?.message || t('forum:errors.createFailed')),
  });

  const updatePostMutation = useMutation({
    mutationFn: ({ id, data }) => forumPostApi.update(id, data).then((r) => r.data),
    onSuccess: invalidate,
    onError: (err) => setErrorMessage(err?.response?.data?.message || t('forum:errors.updateFailed')),
  });

  const deletePostMutation = useMutation({
    mutationFn: (id) => forumPostApi.delete(id),
    onSuccess: () => {
      invalidate();
      setShowDeleteConfirm(false);
      setPostToDelete(null);
              // If we deleted the selected post, close panel
              if (postToDelete && postToDelete.id === selectedPostId) {
                closePanel();
              }
    },
    onError: (err) => setErrorMessage(err?.response?.data?.message || t('forum:errors.deleteFailed')),
  });

  const replyMutation = useMutation({
    mutationFn: (data) => forumPostApi.create(data).then((r) => r.data),
    onSuccess: () => {
      invalidate();
      setReplyContent('');
    },
    onError: (err) => setErrorMessage(err?.response?.data?.message || t('forum:errors.replyFailed')),
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
      await updatePostMutation.mutateAsync({ id: postToEdit.id, data });
      setShowEditPost(false);
      setPostToEdit(null);
    }
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !selectedPost) return;
    replyMutation.mutate({
      content: replyContent.trim(),
      reply_to_id: selectedPost.id,
    });
  };

  const canModify = (message) => {
    if (!user || !message) return false;
    return message.user_id === user.id;
  };

  const canDelete = (message) => {
    if (!user || !message) return false;
    return message.user_id === user.id || !!user.is_admin;
  };

  // Format timestamp
  const formatTimestamp = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
      return diffInMinutes <= 1 ? t('common:time.justNow') : t('common:time.minutesAgo', { count: diffInMinutes });
    } else if (diffInHours < 24) {
      return t('common:time.hoursAgo', { count: diffInHours });
    } else if (diffInHours < 168) {
      const diffInDays = Math.floor(diffInHours / 24);
      return t('common:time.daysAgo', { count: diffInDays });
    }
    const locale = i18n.language === 'id' ? 'id-ID' : 'en-US';
    return postDate.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  };

  // Filter and sort
  const filteredPosts = useMemo(() => {
    let result = allPosts;

    // Apply filter
    if (filterBy === 'mine' && user) {
      result = result.filter((post) => post.user_id === user.id);
    } else if (filterBy === 'most-replied') {
      result = result.filter((post) => {
        const count = typeof post.replies_count === 'number'
          ? post.replies_count
          : allMessages.filter((m) => m.reply_to_id === post.id).length;
        return count > 0;
      });
    }

    // Apply search
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          post.title?.toLowerCase().includes(search) ||
          post.content?.toLowerCase().includes(search) ||
          post.user?.name?.toLowerCase().includes(search),
      );
    }

    // Apply sort
    return [...result].sort((a, b) => {
      if (filterBy === 'most-replied') {
        const countA = typeof a.replies_count === 'number'
          ? a.replies_count
          : allMessages.filter((m) => m.reply_to_id === a.id).length;
        const countB = typeof b.replies_count === 'number'
          ? b.replies_count
          : allMessages.filter((m) => m.reply_to_id === b.id).length;
        if (countB !== countA) return countB - countA;
      }
      if (sortBy === 'recent') {
        return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });
  }, [allPosts, allMessages, searchQuery, sortBy, filterBy, user]);

  // Reply count helper — use backend replies_count if available, else fall back to client counting
  const getReplyCount = (post) => {
    if (typeof post.replies_count === 'number') return post.replies_count;
    return allMessages.filter((m) => m.reply_to_id === post.id).length;
  };

  return (
    <div className="forum-split-container">
      {/* Left Panel - Post List */}
      <div className={`forum-left-panel ${panelVisible && selectedPost ? 'has-selection' : ''}`}>
        {/* Header */}
        <div className="forum-header">
          <div className="forum-header-content">
            <div className="forum-header-top">
              <h1 className="forum-title">{t('forum:pageTitle')}</h1>
              <button
                onClick={() => setShowCreatePost(true)}
                className="forum-new-post-btn"
              >
                <Plus size={18} />
                {t('forum:newPost')}
              </button>
            </div>

            {/* Search Bar */}
            <div className="forum-search-container">
              <Search className="forum-search-icon" size={18} />
              <input
                type="text"
                placeholder={t('forum:searchPosts')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="forum-search-input"
              />
            </div>

            {/* Sort & Filter Dropdown */}
            <div className="forum-sort-container">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="forum-sort-btn"
              >
                <Filter size={14} />
                <span>
                  {filterBy === 'all' ? t('common:all') : filterBy === 'mine' ? t('forum:filter.myPosts') : t('forum:filter.mostReplied')}
                  {' · '}
                  {sortBy === 'recent' ? t('forum:sort.recentlyActive') : t('forum:sort.datePosted')}
                </span>
                <ChevronDown size={16} />
              </button>

              {showSortDropdown && (
                <>
                  <div
                    className="forum-dropdown-overlay"
                    onClick={() => setShowSortDropdown(false)}
                  />
                  <div className="forum-dropdown-menu">
                    {/* Filter Section */}
                    <div className="forum-dropdown-section">
                      <div className="forum-dropdown-section-title">{t('common:filter')}</div>
                      <div className="forum-dropdown-options">
                        <label className="forum-dropdown-option">
                          <input
                            type="radio"
                            name="filterBy"
                            value="all"
                            checked={filterBy === 'all'}
                            onChange={(e) => setFilterBy(e.target.value)}
                            className="forum-radio-input"
                          />
                          <span className="forum-option-label">{t('forum:filter.allPosts')}</span>
                        </label>
                        <label className="forum-dropdown-option">
                          <input
                            type="radio"
                            name="filterBy"
                            value="mine"
                            checked={filterBy === 'mine'}
                            onChange={(e) => setFilterBy(e.target.value)}
                            className="forum-radio-input"
                          />
                          <span className="forum-option-label">{t('forum:filter.myPosts')}</span>
                        </label>
                        <label className="forum-dropdown-option">
                          <input
                            type="radio"
                            name="filterBy"
                            value="most-replied"
                            checked={filterBy === 'most-replied'}
                            onChange={(e) => setFilterBy(e.target.value)}
                            className="forum-radio-input"
                          />
                          <span className="forum-option-label">{t('forum:filter.mostReplied')}</span>
                        </label>
                      </div>
                    </div>

                    {/* Sort Section */}
                    <div className="forum-dropdown-section forum-dropdown-section-last">
                      <div className="forum-dropdown-section-title">{t('common:sort')}</div>
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
                          <span className="forum-option-label">{t('forum:sort.recentlyActive')}</span>
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
                          <span className="forum-option-label">{t('forum:sort.datePosted')}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error Toast */}
        {errorMessage && (
          <div className="forum-error-toast">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage('')} className="forum-error-close">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Posts List */}
        <div className="forum-posts-container">
          {postsLoading ? (
            <div className="forum-loading">
              <Loader2 className="forum-loading-spinner" size={32} />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="forum-empty">
              <MessageSquare size={48} className="forum-empty-icon" />
              <p className="forum-empty-title">
                {searchQuery ? t('forum:empty.noPostsFound') : t('forum:empty.noPostsYet')}
              </p>
              <p className="forum-empty-subtitle">
                {searchQuery ? t('forum:empty.tryDifferentSearch') : t('forum:empty.beFirst')}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="forum-empty-cta"
                >
                  {t('forum:empty.createFirstPost')}
                </button>
              )}
            </div>
          ) : (
            <div className="forum-posts-list">
              {filteredPosts.map((post) => {
                const replyCount = getReplyCount(post);
                return (
                  <div
                    key={post.id}
                    onClick={() => openPanel(post.id)}
                    className={`forum-post-card ${selectedPostId === post.id ? 'selected' : ''}`}
                  >
                    <h3 className="forum-post-title">
                      {post.title || t('forum:post.untitled')}
                    </h3>
                    <p className="forum-post-preview">
                      <span className="forum-post-author">{post.user?.name || t('forum:post.anonymous')}</span>
                      {post.content && <span>: {post.content}</span>}
                    </p>
                    <div className="forum-post-meta">
                      <div className="forum-post-replies">
                        <MessageSquare size={14} />
                        <span>{replyCount}</span>
                      </div>
                      <span className="forum-post-meta-dot">&middot;</span>
                      <span>{formatTimestamp(post.created_at)}</span>
                      {post.is_edited && (
                        <span className="forum-edited-badge">{t('forum:post.edited')}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Post Detail */}
      {panelVisible && selectedPost && (
        <div className={`forum-right-panel ${panelReady ? 'panel-ready' : ''}`}>
          {/* Detail Header */}
          <div className="forum-detail-header">
            <div className="forum-detail-title-wrapper">
              <button
                onClick={() => closePanel()}
                className="forum-mobile-back-btn"
              >
                <ArrowLeft size={20} />
              </button>
              <MessageSquare size={20} className="forum-detail-header-icon" />
              <h2 className="forum-detail-title">{selectedPost.title}</h2>
            </div>
            <div className="forum-detail-header-actions">
              {canModify(selectedPost) && (
                <button
                  onClick={() => handleEditPost(selectedPost)}
                  className="forum-detail-action-btn"
                  title={t('forum:post.editPost')}
                >
                  <Edit2 size={16} />
                </button>
              )}
              {canDelete(selectedPost) && (
                <button
                  onClick={() => handleDeletePost(selectedPost)}
                  className="forum-detail-action-btn danger"
                  title={t('forum:post.deletePost')}
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={() => closePanel()}
                className="forum-close-detail-btn"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Post Content */}
          <div className="forum-detail-content">
            {/* Original Post Section */}
            <div className="forum-detail-post">
              <div className="forum-detail-post-header">
                <div className="forum-detail-icon">
                  <MessageSquare size={32} />
                </div>
                <h1 className="forum-detail-post-title">{selectedPost.title}</h1>
                <p className="forum-detail-post-subtitle">
                  {t('forum:post.startedPost', { name: selectedPost.user?.name || t('forum:post.anonymous') })} &middot;{' '}
                  {new Date(selectedPost.created_at).toLocaleDateString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                  {selectedPost.is_edited && (
                    <span className="forum-edited-inline"> &middot; {t('forum:post.edited')}</span>
                  )}
                </p>
              </div>

              {/* Original Post Content */}
              <div className="forum-message">
                <div className="forum-message-avatar">
                  {(selectedPost.user?.name || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="forum-message-body">
                  <div className="forum-message-header">
                    <span className="forum-message-author">
                      {selectedPost.user?.name || t('forum:post.anonymous')}
                    </span>
                    <span className="forum-message-time">
                      {new Date(selectedPost.created_at).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </span>
                  </div>
                  <div className="forum-message-text forum-markdown-content">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {selectedPost.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>

            {/* Replies Section */}
            {selectedReplies.length > 0 && (
              <>
                <div className="forum-date-separator">
                  <div className="forum-separator-line" />
                  <span className="forum-separator-text">
                    {t('forum:replies.reply', { count: selectedReplies.length })}
                  </span>
                  <div className="forum-separator-line" />
                </div>

                <div className="forum-replies-list">
                  {selectedReplies.map((reply) => (
                    <div key={reply.id} className="forum-reply-item">
                      <div className="forum-reply-avatar">
                        {(reply.user?.name || 'A').charAt(0).toUpperCase()}
                      </div>
                      <div className="forum-reply-body">
                        <div className="forum-reply-header">
                          <span className="forum-reply-author">
                            {reply.user?.name || t('forum:post.anonymous')}
                          </span>
                          {reply.user_id === selectedPost.user_id && (
                            <span className="forum-op-badge">{t('forum:post.op')}</span>
                          )}
                          {reply.is_edited && (
                            <span className="forum-edited-badge">{t('forum:post.edited')}</span>
                          )}
                          <span className="forum-reply-time">
                            {new Date(reply.created_at).toLocaleString(i18n.language === 'id' ? 'id-ID' : 'en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </span>
                          {/* Reply actions */}
                          {(canModify(reply) || canDelete(reply)) && (
                            <div className="forum-reply-actions">
                              {canModify(reply) && (
                                <button
                                  onClick={() => handleEditPost(reply)}
                                  className="forum-reply-action-btn"
                                  title={t('forum:post.editReply')}
                                >
                                  <Edit2 size={13} />
                                </button>
                              )}
                              {canDelete(reply) && (
                                <button
                                  onClick={() => handleDeletePost(reply)}
                                  className="forum-reply-action-btn danger"
                                  title={t('forum:post.deleteReply')}
                                >
                                  <Trash2 size={13} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="forum-reply-text forum-markdown-content">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {reply.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Reply Input */}
          <div className="forum-reply-input-container">
            <form onSubmit={handleReplySubmit} className="forum-reply-form">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={t('forum:replyToPost', { title: selectedPost.title })}
                disabled={replyMutation.isPending}
                className="forum-reply-input"
              />
              {replyContent.trim() && (
                <button
                  type="submit"
                  disabled={replyMutation.isPending}
                  className="forum-reply-send-btn"
                >
                  {replyMutation.isPending ? (
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
