'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Simple SVG icons
const Search = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const Book = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const Play = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MessageCircle = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const Mail = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ExternalLink = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  popularity: number;
  url: string;
}

interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  articleCount: number;
  color: string;
}

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(false);

  const categories: HelpCategory[] = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      description: 'Learn the basics of AnnotateAI',
      icon: <Book className="w-6 h-6" />,
      articleCount: 12,
      color: 'bg-indigo-500/20 text-indigo-300',
    },
    {
      id: 'annotation-tools',
      name: 'Annotation Tools',
      description: 'Master our annotation features',
      icon: <Play className="w-6 h-6" />,
      articleCount: 18,
      color: 'bg-purple-500/20 text-purple-300',
    },
    {
      id: 'ai-models',
      name: 'AI Models',
      description: 'Train and deploy AI models',
      icon: <Book className="w-6 h-6" />,
      articleCount: 15,
      color: 'bg-green-500/20 text-green-300',
    },
    {
      id: 'collaboration',
      name: 'Team Collaboration',
      description: 'Work together effectively',
      icon: <MessageCircle className="w-6 h-6" />,
      articleCount: 8,
      color: 'bg-yellow-500/20 text-yellow-300',
    },
    {
      id: 'billing',
      name: 'Billing & Plans',
      description: 'Manage your subscription',
      icon: <Mail className="w-6 h-6" />,
      articleCount: 6,
      color: 'bg-red-500/20 text-red-300',
    },
    {
      id: 'api',
      name: 'API & Integrations',
      description: 'Integrate with your workflow',
      icon: <ExternalLink className="w-6 h-6" />,
      articleCount: 10,
      color: 'bg-cyan-500/20 text-cyan-300',
    },
  ];

  const popularArticles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started with Your First Project',
      description: 'Learn how to create and set up your first annotation project',
      category: 'Getting Started',
      readTime: '5 min read',
      popularity: 95,
      url: '/help/getting-started/first-project',
    },
    {
      id: '2',
      title: 'Annotation Tools Overview',
      description: 'Complete guide to all annotation tools and their uses',
      category: 'Annotation Tools',
      readTime: '8 min read',
      popularity: 92,
      url: '/help/annotation-tools/overview',
    },
    {
      id: '3',
      title: 'Training Your First AI Model',
      description: 'Step-by-step guide to training custom AI models',
      category: 'AI Models',
      readTime: '12 min read',
      popularity: 88,
      url: '/help/ai-models/training-guide',
    },
    {
      id: '4',
      title: 'Keyboard Shortcuts Reference',
      description: 'Boost your productivity with keyboard shortcuts',
      category: 'Annotation Tools',
      readTime: '3 min read',
      popularity: 85,
      url: '/help/annotation-tools/shortcuts',
    },
    {
      id: '5',
      title: 'Inviting Team Members',
      description: 'How to add and manage team members in your projects',
      category: 'Team Collaboration',
      readTime: '4 min read',
      popularity: 82,
      url: '/help/collaboration/team-management',
    },
  ];

  const searchArticles = async (query: string) => {
    if (!query.trim()) {
      setArticles([]);
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filtered = popularArticles.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.description.toLowerCase().includes(query.toLowerCase()) ||
        article.category.toLowerCase().includes(query.toLowerCase())
      );
      
      setArticles(filtered);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchArticles(searchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredCategories = selectedCategory
    ? categories.filter(cat => cat.id === selectedCategory)
    : categories;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <span className="text-xl font-bold text-white">AnnotateAI</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-white/70 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/login"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/25"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            How can we help you?
          </h1>
          <p className="text-xl text-indigo-100 mb-8">
            Find answers, learn best practices, and get the most out of AnnotateAI
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
            <input
              type="text"
              placeholder="Search for help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 text-lg"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Results */}
        {searchQuery && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6">
              Search Results for "{searchQuery}"
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              </div>
            ) : articles.length > 0 ? (
              <div className="grid gap-4">
                {articles.map((article) => (
                  <Link
                    key={article.id}
                    href={article.url}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          {article.title}
                        </h3>
                        <p className="text-white/70 mt-2">{article.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-white/50">
                          <span>{article.category}</span>
                          <span>•</span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-indigo-300 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-white/50">No articles found for your search.</p>
              </div>
            )}
          </div>
        )}

        {/* Categories */}
        {!searchQuery && (
          <>
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Browse by Category
              </h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-all duration-200 cursor-pointer group"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-4`}>
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-white/70 mb-3">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white/50">
                        {category.articleCount} articles
                      </span>
                      <ChevronRight className="w-4 h-4 text-white/50 group-hover:text-indigo-300 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Articles */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-white mb-8 text-center">
                Popular Articles
              </h2>
              
              <div className="grid gap-4">
                {popularArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={article.url}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-xl hover:bg-white/10 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white group-hover:text-indigo-300 transition-colors">
                            {article.title}
                          </h3>
                          <span className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full">
                            Popular
                          </span>
                        </div>
                        <p className="text-white/70 mb-3">{article.description}</p>
                        <div className="flex items-center gap-4 text-sm text-white/50">
                          <span>{article.category}</span>
                          <span>•</span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/50 group-hover:text-indigo-300 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
              <p className="text-indigo-100 mb-6">
                Can't find what you're looking for? Our support team is here to help.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <a
                  href="mailto:support@annotateai.com"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg hover:bg-white/20 transition-all"
                >
                  <Mail className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Email Support</div>
                  <div className="text-xs text-indigo-200">support@annotateai.com</div>
                </a>
                
                <button className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg hover:bg-white/20 transition-all">
                  <MessageCircle className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Live Chat</div>
                  <div className="text-xs text-indigo-200">Available 24/7</div>
                </button>
                
                <a
                  href="/contact"
                  className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-lg hover:bg-white/20 transition-all"
                >
                  <ExternalLink className="w-6 h-6 mx-auto mb-2" />
                  <div className="text-sm font-medium">Contact Form</div>
                  <div className="text-xs text-indigo-200">Detailed inquiries</div>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
} 