'use client';

import React, { useState, useEffect, useRef } from 'react';

interface HelpArticle {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  url: string;
  popularity: number;
}

interface SuggestedAction {
  id: string;
  title: string;
  description: string;
  action: () => void;
  icon: string;
}

interface HelpWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  context?: string; // Current page context for relevant suggestions
  showInitially?: boolean;
}

const helpArticles: HelpArticle[] = [
  {
    id: '1',
    title: 'Getting Started with AnnotateAI',
    excerpt: 'Learn the basics of creating your first annotation project',
    category: 'Getting Started',
    tags: ['basics', 'project', 'setup'],
    url: '/help/getting-started',
    popularity: 95
  },
  {
    id: '2',
    title: 'How to Use Bounding Box Tools',
    excerpt: 'Step-by-step guide for object detection annotation',
    category: 'Annotation Tools',
    tags: ['bounding box', 'object detection', 'tools'],
    url: '/help/bounding-box-tools',
    popularity: 88
  },
  {
    id: '3',
    title: 'Managing Team Collaboration',
    excerpt: 'Invite team members and manage project permissions',
    category: 'Collaboration',
    tags: ['team', 'collaboration', 'permissions'],
    url: '/help/team-collaboration',
    popularity: 82
  },
  {
    id: '4',
    title: 'Exporting Annotations in COCO Format',
    excerpt: 'Learn how to export your annotations for training',
    category: 'Export',
    tags: ['export', 'coco', 'format'],
    url: '/help/export-coco',
    popularity: 79
  },
  {
    id: '5',
    title: 'Quality Control Best Practices',
    excerpt: 'Ensure high-quality annotations with review workflows',
    category: 'Quality Control',
    tags: ['quality', 'review', 'best practices'],
    url: '/help/quality-control',
    popularity: 76
  },
  {
    id: '6',
    title: 'Keyboard Shortcuts Reference',
    excerpt: 'Speed up your annotation workflow with keyboard shortcuts',
    category: 'Productivity',
    tags: ['shortcuts', 'productivity', 'workflow'],
    url: '/help/keyboard-shortcuts',
    popularity: 85
  }
];

const contextSuggestions: Record<string, SuggestedAction[]> = {
  'projects': [
    {
      id: 'create-project',
      title: 'Create Your First Project',
      description: 'Set up a new annotation project',
      action: () => window.location.href = '/projects/new',
      icon: '➕'
    },
    {
      id: 'project-templates',
      title: 'Explore Project Templates',
      description: 'Use pre-built templates for common use cases',
      action: () => window.location.href = '/help/project-templates',
      icon: '📋'
    }
  ],
  'annotation': [
    {
      id: 'annotation-tools',
      title: 'Learn Annotation Tools',
      description: 'Master the annotation interface',
      action: () => window.location.href = '/help/annotation-tools',
      icon: '🛠️'
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts',
      description: 'Speed up your workflow',
      action: () => window.location.href = '/help/keyboard-shortcuts',
      icon: '⌨️'
    }
  ],
  'settings': [
    {
      id: 'account-setup',
      title: 'Account Settings',
      description: 'Configure your profile and preferences',
      action: () => window.location.href = '/help/account-settings',
      icon: '⚙️'
    },
    {
      id: 'billing-help',
      title: 'Billing & Subscriptions',
      description: 'Manage your subscription and billing',
      action: () => window.location.href = '/help/billing',
      icon: '💳'
    }
  ]
};

export default function HelpWidget({ 
  position = 'bottom-right', 
  context = 'general',
  showInitially = false 
}: HelpWidgetProps) {
  const [isOpen, setIsOpen] = useState(showInitially);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'search' | 'contact'>('suggestions');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'search' && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      setIsSearching(true);
      // Simulate search delay
      const timer = setTimeout(() => {
        const filtered = helpArticles.filter(article =>
          article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setSearchResults(filtered);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  const handleStartChat = () => {
    setShowChat(true);
    setActiveTab('contact');
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // TODO: Implement actual chat functionality
      console.log('Sending message:', chatMessage);
      setChatMessage('');
      // Simulate response
      setTimeout(() => {
        setUnreadCount(prev => prev + 1);
      }, 2000);
    }
  };

  const popularArticles = helpArticles
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, 4);

  const contextActions = contextSuggestions[context] || [];

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {/* Help Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group relative"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </div>
          )}
          
          <div className="absolute right-full mr-3 px-3 py-1 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Need help?
          </div>
        </button>
      )}

      {/* Help Panel */}
      {isOpen && (
        <div className="w-96 h-[600px] annotate-glass rounded-xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Help & Support</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white/80 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1">
              {[
                { id: 'suggestions', label: 'Help', icon: '💡' },
                { id: 'search', label: 'Search', icon: '🔍' },
                { id: 'contact', label: 'Chat', icon: '💬' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                  {tab.id === 'contact' && unreadCount > 0 && (
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {/* Suggestions Tab */}
            {activeTab === 'suggestions' && (
              <div className="h-full overflow-y-auto p-4 space-y-6">
                {/* Context-specific suggestions */}
                {contextActions.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      {contextActions.map((action) => (
                        <button
                          key={action.id}
                          onClick={action.action}
                          className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-lg text-left transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{action.icon}</span>
                            <div>
                              <div className="text-white font-medium text-sm group-hover:text-indigo-400">
                                {action.title}
                              </div>
                              <div className="text-white/60 text-xs">{action.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular articles */}
                <div>
                  <h4 className="text-white font-medium mb-3">Popular Articles</h4>
                  <div className="space-y-2">
                    {popularArticles.map((article) => (
                      <a
                        key={article.id}
                        href={article.url}
                        className="block p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                      >
                        <div className="text-white font-medium text-sm group-hover:text-indigo-400 mb-1">
                          {article.title}
                        </div>
                        <div className="text-white/60 text-xs mb-2">{article.excerpt}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-white/40">{article.category}</span>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-xs text-white/40">{article.popularity}%</span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Quick contact */}
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={handleStartChat}
                    className="w-full p-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2 text-white font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Chat with Support
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Search Tab */}
            {activeTab === 'search' && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-white/10">
                  <div className="relative">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search help articles..."
                      className="w-full bg-white/10 text-white border border-white/20 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <svg className="absolute left-3 top-2.5 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                  {isSearching && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-400"></div>
                    </div>
                  )}

                  {!isSearching && searchQuery.length > 2 && searchResults.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-white/40 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                        </svg>
                      </div>
                      <p className="text-white/60">No articles found for "{searchQuery}"</p>
                      <button
                        onClick={() => setActiveTab('contact')}
                        className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm"
                      >
                        Contact Support
                      </button>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="space-y-3">
                      {searchResults.map((article) => (
                        <a
                          key={article.id}
                          href={article.url}
                          className="block p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors group"
                        >
                          <div className="text-white font-medium text-sm group-hover:text-indigo-400 mb-1">
                            {article.title}
                          </div>
                          <div className="text-white/60 text-xs mb-2">{article.excerpt}</div>
                          <div className="text-xs text-white/40">{article.category}</div>
                        </a>
                      ))}
                    </div>
                  )}

                  {searchQuery.length <= 2 && (
                    <div className="text-center py-8">
                      <div className="text-white/40 mb-2">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <p className="text-white/60">Start typing to search help articles</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contact Tab */}
            {activeTab === 'contact' && (
              <div className="h-full flex flex-col">
                {!showChat ? (
                  <div className="flex-1 p-4 flex flex-col justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <h4 className="text-white font-semibold mb-2">Contact Support</h4>
                      <p className="text-white/70 text-sm mb-6">
                        Our support team is here to help you get the most out of AnnotateAI.
                      </p>
                      
                      <div className="space-y-3">
                        <button
                          onClick={() => setShowChat(true)}
                          className="w-full p-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg transition-colors"
                        >
                          Start Live Chat
                        </button>
                        
                        <a
                          href="mailto:support@annotateai.com"
                          className="block w-full p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-center"
                        >
                          Send Email
                        </a>
                        
                        <a
                          href="/help"
                          className="block w-full p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-center"
                        >
                          Visit Help Center
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">Support Team</div>
                          <div className="flex items-center gap-1 text-xs text-green-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            Online
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                          AI
                        </div>
                        <div className="flex-1">
                          <div className="bg-white/10 rounded-lg p-3 text-white text-sm">
                            Hi! I'm here to help you with AnnotateAI. What can I assist you with today?
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-white/10">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="Type your message..."
                          className="flex-1 bg-white/10 text-white border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!chatMessage.trim()}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 