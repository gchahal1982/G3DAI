'use client';

import { useState, useEffect, useRef } from 'react';
import { CollaborationUser } from '@/lib/collaboration/websocket-client';

interface UserPresenceProps {
  users: CollaborationUser[];
  currentUserId: string;
  onUserClick?: (user: CollaborationUser) => void;
  showCursors?: boolean;
  showAvatars?: boolean;
  maxVisibleUsers?: number;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

interface CursorProps {
  user: CollaborationUser;
  containerRef: React.RefObject<HTMLElement>;
}

export function UserPresence({ 
  users, 
  currentUserId, 
  onUserClick, 
  showCursors = true, 
  showAvatars = true,
  maxVisibleUsers = 8,
  position = 'top-right'
}: UserPresenceProps) {
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const activeUsers = users.filter(user => 
    user.id !== currentUserId && 
    user.status !== 'offline'
  );

  const visibleUsers = activeUsers.slice(0, maxVisibleUsers);
  const hiddenUsersCount = Math.max(0, activeUsers.length - maxVisibleUsers);

  const getStatusColor = (status: CollaborationUser['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'away': return 'bg-orange-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: CollaborationUser['status']) => {
    switch (status) {
      case 'active': return 'Active';
      case 'idle': return 'Idle';
      case 'away': return 'Away';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left': return 'top-4 left-4';
      case 'top-right': return 'top-4 right-4';
      case 'bottom-left': return 'bottom-4 left-4';
      case 'bottom-right': return 'bottom-4 right-4';
      default: return 'top-4 right-4';
    }
  };

  const formatLastActivity = (timestamp: string) => {
    const now = new Date();
    const activity = new Date(timestamp);
    const diffMs = now.getTime() - activity.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <>
      {/* User Presence Panel */}
      <div className={`fixed ${getPositionClasses()} z-40`} ref={containerRef}>
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-3">
          <div className="flex items-center space-x-2">
            {/* Visible User Avatars */}
            {visibleUsers.map((user, index) => (
              <div
                key={user.id}
                className="relative group cursor-pointer"
                onClick={() => onUserClick?.(user)}
                onMouseEnter={() => setHoveredUser(user.id)}
                onMouseLeave={() => setHoveredUser(null)}
                style={{ zIndex: visibleUsers.length - index }}
              >
                {/* Avatar */}
                <div className="relative">
                  {showAvatars && user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                      style={{ borderColor: user.color }}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  {/* Status Indicator */}
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`}></div>
                  
                  {/* Selection Indicator */}
                  {user.selection && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border border-white animate-pulse"></div>
                  )}
                </div>

                {/* Tooltip */}
                {hoveredUser === user.id && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-50">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-gray-300">{user.role}</div>
                    <div className="text-gray-400">{getStatusText(user.status)} • {formatLastActivity(user.lastActivity)}</div>
                    {user.selection && (
                      <div className="text-blue-300 text-xs mt-1">
                        Editing {user.selection.type}
                      </div>
                    )}
                    {/* Tooltip Arrow */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              </div>
            ))}

            {/* Hidden Users Count */}
            {hiddenUsersCount > 0 && (
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-gray-600 text-xs font-medium">
                +{hiddenUsersCount}
              </div>
            )}

            {/* No Users */}
            {activeUsers.length === 0 && (
              <div className="text-gray-500 text-sm px-2">
                You're working alone
              </div>
            )}
          </div>

          {/* Active Count */}
          {activeUsers.length > 0 && (
            <div className="text-center text-xs text-gray-500 mt-2">
              {activeUsers.length} collaborator{activeUsers.length !== 1 ? 's' : ''} online
            </div>
          )}
        </div>
      </div>

      {/* Collaborative Cursors */}
      {showCursors && containerRef.current && visibleUsers.map(user => 
        user.cursor?.visible && (
          <CollaborativeCursor
            key={`cursor-${user.id}`}
            user={user}
            containerRef={containerRef}
          />
        )
      )}
    </>
  );
}

function CollaborativeCursor({ user, containerRef }: CursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (user.cursor && containerRef.current) {
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      // Convert relative coordinates to absolute
      const x = user.cursor.x;
      const y = user.cursor.y;
      
      setPosition({ x, y });
      setVisible(true);

      // Hide cursor after inactivity
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
      }, 10000); // Hide after 10 seconds of inactivity
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [user.cursor, containerRef]);

  if (!visible || !user.cursor?.visible) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-50 transition-all duration-100 ease-out"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-2px, -2px)'
      }}
    >
      {/* Cursor Icon */}
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 20 20" 
        className="drop-shadow-md"
      >
        <path
          d="M2 2L18 8L8 10L2 18L2 2Z"
          fill={user.color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      
      {/* Cursor Label */}
      <div 
        className="absolute top-5 left-2 bg-white/95 backdrop-blur-sm text-xs px-2 py-1 rounded-md shadow-lg border whitespace-nowrap"
        style={{ borderColor: user.color }}
      >
        <div className="font-medium text-gray-900">{user.name}</div>
        {user.selection && (
          <div className="text-gray-600 text-xs">
            Editing {user.selection.type}
          </div>
        )}
      </div>
    </div>
  );
}

interface UserListProps {
  users: CollaborationUser[];
  currentUserId: string;
  onUserSelect?: (user: CollaborationUser) => void;
  showOfflineUsers?: boolean;
}

export function UserList({ users, currentUserId, onUserSelect, showOfflineUsers = false }: UserListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'activity'>('status');

  const filteredUsers = users
    .filter(user => {
      if (user.id === currentUserId) return false;
      if (!showOfflineUsers && user.status === 'offline') return false;
      if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          const statusOrder = { active: 0, idle: 1, away: 2, offline: 3 };
          return statusOrder[a.status] - statusOrder[b.status];
        case 'activity':
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        default:
          return 0;
      }
    });

  const getStatusIcon = (status: CollaborationUser['status']) => {
    switch (status) {
      case 'active':
        return <div className="w-2 h-2 bg-green-500 rounded-full"></div>;
      case 'idle':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>;
      case 'away':
        return <div className="w-2 h-2 bg-orange-500 rounded-full"></div>;
      case 'offline':
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 max-w-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Collaborators</h3>
        <span className="text-sm text-gray-500">
          {filteredUsers.filter(u => u.status !== 'offline').length} online
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      {/* Sort Options */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setSortBy('status')}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            sortBy === 'status' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Status
        </button>
        <button
          onClick={() => setSortBy('name')}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            sortBy === 'name' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Name
        </button>
        <button
          onClick={() => setSortBy('activity')}
          className={`px-2 py-1 text-xs rounded-md transition-colors ${
            sortBy === 'activity' ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Activity
        </button>
      </div>

      {/* User List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredUsers.map(user => (
          <div
            key={user.id}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onUserSelect?.(user)}
          >
            {/* Avatar */}
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Status Indicator */}
              <div className="absolute -bottom-0.5 -right-0.5">
                {getStatusIcon(user.status)}
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <p className="font-medium text-gray-900 truncate text-sm">{user.name}</p>
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {user.role}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span>{getStatusText(user.status)}</span>
                <span>•</span>
                <span>{formatLastActivity(user.lastActivity)}</span>
              </div>
              {user.selection && (
                <div className="text-xs text-blue-600 mt-1">
                  Editing {user.selection.type}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1">
              {user.status === 'active' && (
                <button
                  className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                  title="Send message"
                >
                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-sm">No collaborators found</p>
        </div>
      )}
    </div>
  );
}

function getStatusText(status: CollaborationUser['status']) {
  switch (status) {
    case 'active': return 'Active';
    case 'idle': return 'Idle';
    case 'away': return 'Away';
    case 'offline': return 'Offline';
    default: return 'Unknown';
  }
}

function formatLastActivity(timestamp: string) {
  const now = new Date();
  const activity = new Date(timestamp);
  const diffMs = now.getTime() - activity.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
} 