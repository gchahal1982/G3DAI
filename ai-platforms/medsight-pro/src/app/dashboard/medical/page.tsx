import { Metadata } from 'next';
import { Suspense } from 'react';
import { MedicalOverview } from '@/components/medical/MedicalOverview';
import { ActiveCases } from '@/components/medical/ActiveCases';
import { RecentStudies } from '@/components/medical/RecentStudies';
import { MedicalNotifications } from '@/components/medical/MedicalNotifications';
import { QuickActions } from '@/components/medical/QuickActions';
import { MedicalMetrics } from '@/components/medical/MedicalMetrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Heart, Brain, Zap, Users, Calendar, AlertTriangle, TrendingUp } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Medical Dashboard - MedSight Pro',
  description: 'Primary clinical workspace for medical professionals',
};

// Mock data for medical dashboard
const mockMedicalData = {
  todayStats: {
    totalCases: 24,
    pendingReviews: 8,
    completedStudies: 16,
    emergencyCases: 2,
    aiAnalysisComplete: 20,
    collaborativeReviews: 6
  },
  recentActivity: [
    { type: 'case', title: 'CT Chest - John Doe', time: '5 min ago', priority: 'high' },
    { type: 'ai', title: 'AI Analysis Complete - MRI Brain', time: '12 min ago', priority: 'normal' },
    { type: 'collab', title: 'Peer Review Request - X-Ray', time: '18 min ago', priority: 'normal' },
    { type: 'emergency', title: 'STAT - Trauma CT', time: '25 min ago', priority: 'critical' }
  ],
  upcomingSchedule: [
    { time: '10:00 AM', type: 'Consultation', patient: 'Patient A', modality: 'MRI' },
    { time: '11:30 AM', type: 'Review', patient: 'Patient B', modality: 'CT' },
    { time: '2:00 PM', type: 'Conference', patient: 'Multi-disciplinary', modality: 'Various' },
    { time: '3:30 PM', type: 'Emergency', patient: 'STAT Read', modality: 'X-Ray' }
  ]
};

export default function MedicalDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Medical Dashboard Header */}
      <div className="medsight-glass border-b border-white/10 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <Activity className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Medical Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-300">
                Primary Clinical Workspace
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Heart className="h-4 w-4 mr-1" />
              System Healthy
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Brain className="h-4 w-4 mr-1" />
              AI Active
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Users className="h-4 w-4 mr-1" />
              Collaborative
            </Badge>
          </div>
        </div>
      </div>

      {/* Medical Dashboard Content */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Overview & Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Medical Overview */}
            <Suspense fallback={<div className="medsight-glass h-64 animate-pulse rounded-xl" />}>
              <MedicalOverview />
            </Suspense>

            {/* Today's Medical Statistics */}
            <Card className="medsight-glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span>Today's Clinical Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {mockMedicalData.todayStats.totalCases}
                    </div>
                    <div className="text-sm text-blue-600/70 dark:text-blue-400/70">
                      Total Cases
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {mockMedicalData.todayStats.pendingReviews}
                    </div>
                    <div className="text-sm text-amber-600/70 dark:text-amber-400/70">
                      Pending Reviews
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {mockMedicalData.todayStats.completedStudies}
                    </div>
                    <div className="text-sm text-green-600/70 dark:text-green-400/70">
                      Completed Studies
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {mockMedicalData.todayStats.emergencyCases}
                    </div>
                    <div className="text-sm text-red-600/70 dark:text-red-400/70">
                      Emergency Cases
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {mockMedicalData.todayStats.aiAnalysisComplete}
                    </div>
                    <div className="text-sm text-purple-600/70 dark:text-purple-400/70">
                      AI Analysis Complete
                    </div>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
                    <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      {mockMedicalData.todayStats.collaborativeReviews}
                    </div>
                    <div className="text-sm text-indigo-600/70 dark:text-indigo-400/70">
                      Collaborative Reviews
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical Workflow Tabs */}
            <Tabs defaultValue="active-cases" className="w-full">
              <TabsList className="grid w-full grid-cols-3 medsight-glass">
                <TabsTrigger value="active-cases">Active Cases</TabsTrigger>
                <TabsTrigger value="recent-studies">Recent Studies</TabsTrigger>
                <TabsTrigger value="metrics">Medical Metrics</TabsTrigger>
              </TabsList>
              <TabsContent value="active-cases" className="space-y-4">
                <Suspense fallback={<div className="medsight-glass h-64 animate-pulse rounded-xl" />}>
                  <ActiveCases />
                </Suspense>
              </TabsContent>
              <TabsContent value="recent-studies" className="space-y-4">
                <Suspense fallback={<div className="medsight-glass h-64 animate-pulse rounded-xl" />}>
                  <RecentStudies />
                </Suspense>
              </TabsContent>
              <TabsContent value="metrics" className="space-y-4">
                <Suspense fallback={<div className="medsight-glass h-64 animate-pulse rounded-xl" />}>
                  <MedicalMetrics />
                </Suspense>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Notifications & Quick Actions */}
          <div className="space-y-6">
            {/* Medical Quick Actions */}
            <Suspense fallback={<div className="medsight-glass h-64 animate-pulse rounded-xl" />}>
              <QuickActions />
            </Suspense>

            {/* Medical Notifications */}
            <Suspense fallback={<div className="medsight-glass h-64 animate-pulse rounded-xl" />}>
              <MedicalNotifications />
            </Suspense>

            {/* Recent Activity */}
            <Card className="medsight-glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMedicalData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                      <div className={`p-2 rounded-full ${
                        activity.priority === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/20' :
                        activity.priority === 'high' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20' :
                        'bg-blue-100 text-blue-600 dark:bg-blue-900/20'
                      }`}>
                        {activity.type === 'emergency' && <AlertTriangle className="h-4 w-4" />}
                        {activity.type === 'case' && <Activity className="h-4 w-4" />}
                        {activity.type === 'ai' && <Brain className="h-4 w-4" />}
                        {activity.type === 'collab' && <Users className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card className="medsight-glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <span>Today's Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockMedicalData.upcomingSchedule.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {item.time}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {item.type}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.patient} - {item.modality}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 