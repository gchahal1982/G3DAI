'use client';

import { ArrowUpTrayIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';

export default function ImportPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Import Dataset</h1>
          <p className="text-white/70">Upload and manage your annotation datasets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Image Upload */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-200">
            <div className="flex items-center mb-4">
              <PhotoIcon className="h-8 w-8 text-blue-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Images</h2>
            </div>
            <p className="text-white/70 mb-4">
              Upload images for object detection, classification, or segmentation tasks
            </p>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-blue-400/50 transition-all duration-200">
              <ArrowUpTrayIcon className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Drop images here or click to browse</p>
            </div>
          </div>

          {/* Video Upload */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-green-500/30 transition-all duration-200">
            <div className="flex items-center mb-4">
              <DocumentIcon className="h-8 w-8 text-green-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Videos</h2>
            </div>
            <p className="text-white/70 mb-4">
              Upload videos for temporal annotation and tracking tasks
            </p>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-green-400/50 transition-all duration-200">
              <ArrowUpTrayIcon className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Drop videos here or click to browse</p>
            </div>
          </div>

          {/* Batch Upload */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-200">
            <div className="flex items-center mb-4">
              <ArrowUpTrayIcon className="h-8 w-8 text-purple-400 mr-3" />
              <h2 className="text-xl font-semibold text-white">Batch Upload</h2>
            </div>
            <p className="text-white/70 mb-4">
              Upload multiple files or folders at once for large datasets
            </p>
            <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-purple-400/50 transition-all duration-200">
              <ArrowUpTrayIcon className="h-12 w-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60">Drop folders here or click to browse</p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Upload History</h3>
          <div className="text-center py-12">
            <p className="text-white/60">No uploads yet. Start by uploading your first dataset above.</p>
          </div>
        </div>
      </div>
    </div>
  );
} 