'use client';

import React from 'react';
import Link from 'next/link';
import { HomeIcon, ArrowLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
          {/* 404 Display */}
          <div className="space-y-4">
            <div className="text-6xl font-bold text-transparent bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text">
              404
            </div>
            <h1 className="text-2xl font-bold text-white">
              Page Not Found
            </h1>
            <p className="text-white/70">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          {/* Search Suggestion */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-center mb-2">
              <MagnifyingGlassIcon className="w-5 h-5 text-white/60 mr-2" />
              <span className="text-sm text-white/70">Looking for something specific?</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center text-xs">
              <Link href="/projects" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Projects
              </Link>
              <span className="text-white/40">•</span>
              <Link href="/datasets" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Datasets
              </Link>
              <span className="text-white/40">•</span>
              <Link href="/models" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Models
              </Link>
              <span className="text-white/40">•</span>
              <Link href="/help" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                Help
              </Link>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center justify-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white/70 rounded-lg transition-all duration-200"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Go Back
            </button>
            <Link
              href="/"
              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg shadow-indigo-500/25"
            >
              <HomeIcon className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-white/50">
            Need help? <Link href="/help" className="text-indigo-400 hover:text-indigo-300 transition-colors">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
} 