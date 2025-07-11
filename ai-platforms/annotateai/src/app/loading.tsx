export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-64 bg-gray-800 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-indigo-600/20 rounded animate-pulse"></div>
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-700 rounded animate-pulse"></div>
              </div>
              <div className="h-8 w-16 bg-gray-700 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-24 bg-gray-800 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Recent Projects Skeleton */}
        <div className="glass rounded-xl p-6">
          <div className="h-6 w-48 bg-gray-700 rounded animate-pulse mb-6"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="h-5 w-48 bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-64 bg-gray-800 rounded animate-pulse"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-700 rounded-full animate-pulse"></div>
                </div>
                
                <div className="flex items-center justify-between text-sm mb-3">
                  <div className="h-4 w-32 bg-gray-800 rounded animate-pulse"></div>
                  <div className="h-4 w-24 bg-gray-800 rounded animate-pulse"></div>
                </div>
                
                <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
                  <div className="bg-gray-700 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-6 w-6 bg-gray-700 rounded-full animate-pulse"></div>
                    ))}
                  </div>
                  <div className="h-4 w-20 bg-gray-800 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center">
              <div className="h-12 w-12 bg-gray-700 rounded-lg animate-pulse mx-auto mb-4"></div>
              <div className="h-5 w-32 bg-gray-700 rounded animate-pulse mx-auto mb-2"></div>
              <div className="h-4 w-48 bg-gray-800 rounded animate-pulse mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 