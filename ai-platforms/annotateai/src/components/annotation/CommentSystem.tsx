'use client';

import { useState, useEffect, useRef } from 'react';
import { CollaborationUser } from '@/lib/collaboration/websocket-client';

export interface AnnotationComment {
  id: string;
  annotationId: string;
  parentId?: string; // For threaded replies
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  mentions: string[]; // User IDs mentioned in the comment
  attachments?: {
    id: string;
    name: string;
    url: string;
    type: 'image' | 'file';
  }[];
  reactions: {
    emoji: string;
    users: string[];
  }[];
  status: 'open' | 'resolved' | 'archived';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  editedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

interface CommentSystemProps {
  annotationId: string;
  comments: AnnotationComment[];
  currentUser: CollaborationUser;
  onAddComment: (comment: Omit<AnnotationComment, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onEditComment: (commentId: string, content: string) => void;
  onDeleteComment: (commentId: string) => void;
  onResolveComment: (commentId: string) => void;
  onReactToComment: (commentId: string, emoji: string) => void;
  onMentionUser: (userId: string) => void;
  availableUsers: CollaborationUser[];
  isVisible: boolean;
  position?: { x: number; y: number };
  onClose?: () => void;
}

export function CommentSystem({
  annotationId,
  comments,
  currentUser,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onResolveComment,
  onReactToComment,
  onMentionUser,
  availableUsers,
  isVisible,
  position,
  onClose
}: CommentSystemProps) {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showResolved, setShowResolved] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'priority'>('newest');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mentionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const relevantComments = comments.filter(comment => comment.annotationId === annotationId);
  const openComments = relevantComments.filter(comment => comment.status === 'open');
  const resolvedComments = relevantComments.filter(comment => comment.status === 'resolved');
  const rootComments = relevantComments.filter(comment => !comment.parentId);

  const sortedComments = [...(showResolved ? relevantComments : openComments)].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      default:
        return 0;
    }
  });

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [newComment]);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    const mentions = extractMentions(newComment);
    
    const comment: Omit<AnnotationComment, 'id' | 'createdAt' | 'updatedAt'> = {
      annotationId,
      parentId: replyingTo || undefined,
      content: newComment,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        avatar: currentUser.avatar,
        role: currentUser.role
      },
      mentions,
      reactions: [],
      status: 'open',
      priority: selectedPriority,
      tags: selectedTags
    };

    onAddComment(comment);
    setNewComment('');
    setReplyingTo(null);
    setSelectedTags([]);
    
    // Notify mentioned users
    mentions.forEach(userId => onMentionUser(userId));
  };

  const extractMentions = (text: string): string[] => {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1];
      const user = availableUsers.find(u => u.name.toLowerCase().includes(username.toLowerCase()));
      if (user) {
        mentions.push(user.id);
      }
    }
    
    return mentions;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmitComment();
    }
    
    if (e.key === '@') {
      setShowMentions(true);
      setMentionQuery('');
    }
    
    if (e.key === 'Escape') {
      setShowMentions(false);
      setReplyingTo(null);
      setEditingComment(null);
    }
  };

  const handleMentionSelect = (user: CollaborationUser) => {
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBefore = newComment.substring(0, cursorPosition);
    const textAfter = newComment.substring(cursorPosition);
    const lastAtIndex = textBefore.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const newText = textBefore.substring(0, lastAtIndex) + `@${user.name} ` + textAfter;
      setNewComment(newText);
    }
    
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const getCommentReplies = (commentId: string): AnnotationComment[] => {
    return relevantComments.filter(comment => comment.parentId === commentId);
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredMentionUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(mentionQuery.toLowerCase()) &&
    user.id !== currentUser.id
  );

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 max-w-md w-full z-50"
      style={{
        left: position?.x || 'auto',
        top: position?.y || 'auto',
        maxHeight: '70vh'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3 className="font-semibold text-gray-900">Comments</h3>
          <p className="text-xs text-gray-500">
            {openComments.length} open, {resolvedComments.length} resolved
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                sortBy === 'newest' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'
              }`}
            >
              Newest
            </button>
            <button
              onClick={() => setSortBy('oldest')}
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                sortBy === 'oldest' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'
              }`}
            >
              Oldest
            </button>
            <button
              onClick={() => setSortBy('priority')}
              className={`px-2 py-1 text-xs rounded-md transition-all ${
                sortBy === 'priority' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600'
              }`}
            >
              Priority
            </button>
          </div>
          
          <button
            onClick={() => setShowResolved(!showResolved)}
            className={`px-2 py-1 text-xs rounded-md transition-all ${
              showResolved ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {showResolved ? 'Hide Resolved' : 'Show Resolved'}
          </button>
          
          {onClose && (
            <button
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Comments List */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {sortedComments.length > 0 ? (
          <div className="space-y-4">
            {sortedComments.map(comment => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={getCommentReplies(comment.id)}
                currentUser={currentUser}
                onReply={() => setReplyingTo(comment.id)}
                onEdit={() => setEditingComment(comment.id)}
                onDelete={() => onDeleteComment(comment.id)}
                onResolve={() => onResolveComment(comment.id)}
                onReact={(emoji) => onReactToComment(comment.id, emoji)}
                formatTimeAgo={formatTimeAgo}
                getPriorityColor={getPriorityColor}
                canEdit={comment.author.id === currentUser.id}
                canDelete={comment.author.id === currentUser.id || currentUser.role === 'admin'}
                canResolve={comment.author.id === currentUser.id || currentUser.role === 'reviewer' || currentUser.role === 'admin'}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm">No comments yet</p>
            <p className="text-xs text-gray-400">Be the first to comment on this annotation</p>
          </div>
        )}
      </div>

      {/* Comment Input */}
      <div className="p-4 border-t border-gray-200">
        {replyingTo && (
          <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                Replying to {relevantComments.find(c => c.id === replyingTo)?.author.name}
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="text-blue-600 hover:text-blue-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a comment... (@ to mention, Cmd+Enter to send)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm"
            rows={2}
          />

          {/* Mentions Dropdown */}
          {showMentions && filteredMentionUsers.length > 0 && (
            <div
              ref={mentionsRef}
              className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-32 overflow-y-auto z-10"
            >
              {filteredMentionUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleMentionSelect(user)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.role}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as any)}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
            
            <button
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              title="Add attachment"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">Cmd+Enter</span>
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {replyingTo ? 'Reply' : 'Comment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: AnnotationComment;
  replies: AnnotationComment[];
  currentUser: CollaborationUser;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onResolve: () => void;
  onReact: (emoji: string) => void;
  formatTimeAgo: (timestamp: string) => string;
  getPriorityColor: (priority: string) => string;
  canEdit: boolean;
  canDelete: boolean;
  canResolve: boolean;
}

function CommentItem({
  comment,
  replies,
  currentUser,
  onReply,
  onEdit,
  onDelete,
  onResolve,
  onReact,
  formatTimeAgo,
  getPriorityColor,
  canEdit,
  canDelete,
  canResolve
}: CommentItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);

  const commonReactions = ['👍', '👎', '❤️', '😂', '😮', '😢', '🎉'];

  return (
    <div className={`border rounded-lg p-3 ${comment.status === 'resolved' ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        {comment.author.avatar ? (
          <img
            src={comment.author.avatar}
            alt={comment.author.name}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium">
            {comment.author.name.charAt(0)}
          </div>
        )}

        <div className="flex-1">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                {comment.author.role}
              </span>
              <span className={`px-1.5 py-0.5 text-xs rounded-full border ${getPriorityColor(comment.priority)}`}>
                {comment.priority}
              </span>
              {comment.status === 'resolved' && (
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full border border-green-200">
                  Resolved
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1">
              <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
              <button
                onClick={() => setShowActions(!showActions)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="mt-2">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            
            {comment.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {comment.tags.map(tag => (
                  <span key={tag} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Reactions */}
          {comment.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {comment.reactions.map(reaction => (
                <button
                  key={reaction.emoji}
                  onClick={() => onReact(reaction.emoji)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-colors ${
                    reaction.users.includes(currentUser.id)
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.users.length}</span>
                </button>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3 mt-3 text-xs">
            <button
              onClick={onReply}
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              Reply
            </button>
            
            <button
              onClick={() => setShowReactions(!showReactions)}
              className="text-gray-600 hover:text-indigo-600 transition-colors"
            >
              React
            </button>
            
            {canEdit && (
              <button
                onClick={onEdit}
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Edit
              </button>
            )}
            
            {canResolve && comment.status === 'open' && (
              <button
                onClick={onResolve}
                className="text-gray-600 hover:text-green-600 transition-colors"
              >
                Resolve
              </button>
            )}
            
            {canDelete && (
              <button
                onClick={onDelete}
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                Delete
              </button>
            )}
          </div>

          {/* Reaction Picker */}
          {showReactions && (
            <div className="flex space-x-1 mt-2 p-2 bg-gray-50 rounded-lg">
              {commonReactions.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    onReact(emoji);
                    setShowReactions(false);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Replies */}
          {replies.length > 0 && (
            <div className="mt-4 space-y-3 border-l-2 border-gray-200 pl-4">
              {replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  replies={[]}
                  currentUser={currentUser}
                  onReply={() => {}}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onResolve={onResolve}
                  onReact={onReact}
                  formatTimeAgo={formatTimeAgo}
                  getPriorityColor={getPriorityColor}
                  canEdit={reply.author.id === currentUser.id}
                  canDelete={reply.author.id === currentUser.id}
                  canResolve={reply.author.id === currentUser.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 