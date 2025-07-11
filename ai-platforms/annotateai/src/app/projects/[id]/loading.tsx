export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 flex flex-col">
      {/* Header Skeleton */}
      <div className="border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 w-48 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-20 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Tools Sidebar Skeleton */}
        <div className="w-16 bg-gray-800 border-r border-gray-700 p-2">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 w-12 bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Main Content Area Skeleton */}
        <div className="flex-1 flex flex-col">
          {/* Viewport Controls */}
          <div className="border-b border-gray-700 p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 bg-gray-700 rounded animate-pulse"></div>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Canvas Area */}
          <div className="flex-1 bg-gray-800 relative">
            <div className="absolute inset-4 bg-gray-700 rounded-lg animate-pulse flex items-center justify-center">
              <div className="text-center">
                <div className="h-12 w-12 bg-gray-600 rounded-full mx-auto mb-4 animate-pulse"></div>
                <div className="h-4 w-32 bg-gray-600 rounded mx-auto mb-2 animate-pulse"></div>
                <div className="h-3 w-48 bg-gray-600 rounded mx-auto animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Panel Skeleton */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
          <div className="space-y-6">
            {/* Panel Header */}
            <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
            
            {/* Properties */}
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-8 w-full bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Quality Panel */}
            <div className="border-t border-gray-700 pt-4">
              <div className="h-5 w-28 bg-gray-700 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar Skeleton */}
      <div className="border-t border-gray-700 p-2 bg-gray-800">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="h-4 w-32 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-24 bg-gray-700 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-4 w-20 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 w-16 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 