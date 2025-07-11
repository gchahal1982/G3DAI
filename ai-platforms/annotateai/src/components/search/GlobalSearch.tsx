'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  type: 'project' | 'dataset' | 'file' | 'annotation' | 'user' | 'help';
  title: string;
  description: string;
  url: string;
  metadata?: Record<string, any>;
  score?: number;
  highlighted?: {
    title?: string;
    description?: string;
  };
}

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'popular' | 'category';
  icon?: string;
}

interface GlobalSearchProps {
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
  maxResults?: number;
}

const SEARCH_CATEGORIES = [
  { id: 'all', label: 'All', icon: '🔍' },
  { id: 'projects', label: 'Projects', icon: '📁' },
  { id: 'datasets', label: 'Datasets', icon: '💾' },
  { id: 'files', label: 'Files', icon: '📄' },
  { id: 'annotations', label: 'Annotations', icon: '🏷️' },
  { id: 'users', label: 'Users', icon: '👥' },
  { id: 'help', label: 'Help', icon: '❓' },
];

const RECENT_SEARCHES = [
  { id: '1', text: 'medical imaging dataset', type: 'recent' as const, icon: '🕒' },
  { id: '2', text: 'object detection model', type: 'recent' as const, icon: '🕒' },
  { id: '3', text: 'annotation quality metrics', type: 'recent' as const, icon: '🕒' },
];

const POPULAR_SEARCHES = [
  { id: '1', text: 'How to export annotations', type: 'popular' as const, icon: '🔥' },
  { id: '2', text: 'Setting up team collaboration', type: 'popular' as const, icon: '🔥' },
  { id: '3', text: 'AI model integration guide', type: 'popular' as const, icon: '🔥' },
];

export default function GlobalSearch({ 
  isOpen, 
  onClose, 
  placeholder = "Search projects, files, help...",
  maxResults = 10 
}: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd+K or Ctrl+K to open search
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        if (!isOpen) {
          // Trigger search opening (handled by parent component)
        }
        return;
      }

      if (!isOpen) return;

      // Escape to close
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      // Arrow navigation
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const maxIndex = (showSuggestions ? suggestions.length : results.length) - 1;
        setSelectedIndex(prev => Math.min(prev + 1, maxIndex));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, suggestions, results, showSuggestions, onClose]);

  // Search functionality
  const performSearch = useCallback(async (searchQuery: string, category: string = 'all') => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowSuggestions(true);
      return;
    }

    setIsLoading(true);
    setShowSuggestions(false);

    try {
      const params = new URLSearchParams({
        q: searchQuery,
        category,
        limit: maxResults.toString(),
      });

      const response = await fetch(`/api/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.results || []);
      } else {
        console.error('Search failed:', data.error);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [maxResults]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch(query, selectedCategory);
      }, 300);
    } else {
      setResults([]);
      setShowSuggestions(true);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, selectedCategory, performSearch]);

  // Load suggestions
  useEffect(() => {
    if (showSuggestions) {
      const allSuggestions = [
        ...RECENT_SEARCHES,
        ...POPULAR_SEARCHES,
      ];
      setSuggestions(allSuggestions);
    }
  }, [showSuggestions]);

  const handleSelection = useCallback(() => {
    if (showSuggestions && selectedIndex >= 0 && selectedIndex < suggestions.length) {
      const suggestion = suggestions[selectedIndex];
      setQuery(suggestion.text);
      performSearch(suggestion.text, selectedCategory);
    } else if (!showSuggestions && selectedIndex >= 0 && selectedIndex < results.length) {
      const result = results[selectedIndex];
      router.push(result.url);
      onClose();
    }
  }, [showSuggestions, selectedIndex, suggestions, results, selectedCategory, performSearch, router, onClose]);

  const handleResultClick = useCallback((result: SearchResult) => {
    router.push(result.url);
    onClose();
    
    // Track search analytics
    // TODO: Implement search analytics
  }, [router, onClose]);

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'project': return '📁';
      case 'dataset': return '💾';
      case 'file': return '📄';
      case 'annotation': return '🏷️';
      case 'user': return '👤';
      case 'help': return '❓';
      default: return '📄';
    }
  };

  const highlightText = (text: string, highlight?: string) => {
    if (!highlight) return text;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={index} className="bg-indigo-500/30 text-indigo-200 rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Search Modal */}
      <div className="relative w-full max-w-2xl bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/50">
        {/* Search Header */}
        <div className="p-6 border-b border-gray-700/30">
          <div className="flex items-center space-x-4">
            <div className="text-white/70">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-white placeholder-white/50 text-lg focus:outline-none"
            />
            {isLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-400" />
            )}
            <div className="text-white/50 text-sm">
              <kbd className="px-2 py-1 bg-white/10 rounded text-xs">ESC</kbd>
            </div>
          </div>
        </div>

        {/* Search Categories */}
        <div className="px-6 py-3 border-b border-white/10">
          <div className="flex items-center space-x-2 overflow-x-auto">
            {SEARCH_CATEGORIES.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {showSuggestions ? (
            <div className="p-6">
              {suggestions.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-white/80 text-sm font-medium">Recent & Popular</h3>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion.id}
                      onClick={() => {
                        setQuery(suggestion.text);
                        performSearch(suggestion.text, selectedCategory);
                      }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 text-left ${
                        selectedIndex === index
                          ? 'bg-indigo-600/30 border-indigo-500/50'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <span className="text-lg">{suggestion.icon}</span>
                      <span className="text-white">{suggestion.text}</span>
                      <span className="text-white/50 text-xs ml-auto">
                        {suggestion.type === 'recent' ? 'Recent' : 'Popular'}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-6">
              {results.length > 0 ? (
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className={`w-full flex items-start space-x-3 p-4 rounded-xl transition-all duration-200 text-left ${
                        selectedIndex === index
                          ? 'bg-indigo-600/30 border-indigo-500/50'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <span className="text-xl">{getResultIcon(result.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium mb-1">
                          {result.highlighted?.title ? (
                            <span dangerouslySetInnerHTML={{ __html: result.highlighted.title }} />
                          ) : (
                            highlightText(result.title, query)
                          )}
                        </h4>
                        <p className="text-white/70 text-sm">
                          {result.highlighted?.description ? (
                            <span dangerouslySetInnerHTML={{ __html: result.highlighted.description }} />
                          ) : (
                            highlightText(result.description, query)
                          )}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-indigo-400 text-xs font-medium uppercase">
                            {result.type}
                          </span>
                          {result.score && (
                            <span className="text-white/50 text-xs">
                              {Math.round(result.score * 100)}% match
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-white/40 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-white font-semibold mb-2">No results found</h3>
                  <p className="text-white/70">
                    Try different keywords or browse categories above
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Footer */}
        <div className="px-6 py-3 border-t border-gray-700/30 bg-gray-800/30">
          <div className="flex items-center justify-between text-xs text-white/50">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white/10 rounded">↑↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-2 py-1 bg-white/10 rounded">↵</kbd>
                <span>Select</span>
              </div>
            </div>
            <div>
              {results.length > 0 && (
                <span>{results.length} results</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 