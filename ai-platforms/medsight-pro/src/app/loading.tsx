export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-72 bg-gray-100 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-10 w-40 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-primary/20 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass-card p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-24 bg-gray-100 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Quick Stats Bar Skeleton */}
        <div className="glass-card rounded-xl p-4 mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
                <div className="h-4 w-20 bg-gray-100 rounded animate-pulse mx-auto"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Studies Skeleton */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary/20 rounded-lg animate-pulse"></div>
                    <div>
                      <div className="h-5 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-4 w-48 bg-gray-100 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="h-4 w-8 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                  <div className="h-4 w-12 bg-gray-100 rounded animate-pulse"></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-20 bg-gray-100 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-white/50">
              <div className="h-12 w-12 bg-gray-200 rounded-lg animate-pulse mx-auto mb-4"></div>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mx-auto mb-2"></div>
              <div className="h-4 w-48 bg-gray-100 rounded animate-pulse mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 