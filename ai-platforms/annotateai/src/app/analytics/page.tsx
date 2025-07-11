'use client';

import { ChartBarIcon, ClockIcon, EyeIcon, UsersIcon } from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-gray-400">Project insights and performance metrics</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <EyeIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-sm text-green-400">+12.5%</div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">156,780</div>
            <div className="text-sm text-gray-400">Total Annotations</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-green-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <ClockIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-sm text-green-400">+8.2%</div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">2.4h</div>
            <div className="text-sm text-gray-400">Avg. Annotation Time</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div className="text-sm text-green-400">+94.7%</div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">94.7%</div>
            <div className="text-sm text-gray-400">Quality Score</div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <UsersIcon className="h-6 w-6 text-orange-400" />
              </div>
              <div className="text-sm text-green-400">+3</div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">12</div>
            <div className="text-sm text-gray-400">Active Annotators</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Annotation Progress Chart */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Annotation Progress</h3>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-white/20 rounded-xl">
              <div className="text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                <p className="text-gray-500">Chart visualization placeholder</p>
              </div>
            </div>
          </div>

          {/* Team Performance */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Team Performance</h3>
            <div className="space-y-4">
              {[
                { name: 'Alice Johnson', annotations: 2450, accuracy: 96.2 },
                { name: 'Bob Chen', annotations: 1890, accuracy: 94.8 },
                { name: 'Carol Smith', annotations: 1654, accuracy: 95.5 },
                { name: 'Dr. Williams', annotations: 1234, accuracy: 98.1 },
              ].map((annotator, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 shadow-lg shadow-indigo-500/25">
                      {annotator.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-white font-medium">{annotator.name}</div>
                      <div className="text-gray-400 text-sm">{annotator.annotations} annotations</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-medium">{annotator.accuracy}%</div>
                    <div className="text-gray-400 text-sm">accuracy</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Project Breakdown */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Project Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm">
                  <th className="pb-3">Project</th>
                  <th className="pb-3">Progress</th>
                  <th className="pb-3">Annotations</th>
                  <th className="pb-3">Quality</th>
                  <th className="pb-3">Time Spent</th>
                </tr>
              </thead>
              <tbody className="text-white">
                <tr className="border-t border-white/10">
                  <td className="py-3">Autonomous Vehicle Dataset</td>
                  <td className="py-3">73%</td>
                  <td className="py-3">11,256</td>
                  <td className="py-3">95.2%</td>
                  <td className="py-3">24.5h</td>
                </tr>
                <tr className="border-t border-white/10">
                  <td className="py-3">Medical Imaging Analysis</td>
                  <td className="py-3">45%</td>
                  <td className="py-3">3,938</td>
                  <td className="py-3">98.1%</td>
                  <td className="py-3">18.2h</td>
                </tr>
                <tr className="border-t border-white/10">
                  <td className="py-3">Retail Product Recognition</td>
                  <td className="py-3">100%</td>
                  <td className="py-3">5,200</td>
                  <td className="py-3">92.8%</td>
                  <td className="py-3">12.3h</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 