'use client';

import { useState } from 'react';

// Simple icon components
const Calendar = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>📅</div>;
const Clock = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>⏰</div>;
const CheckCircle = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>✅</div>;
const AlertTriangle = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>⚠️</div>;
const Eye = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>👁️</div>;
const Brain = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>🧠</div>;
const User = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>👤</div>;
const FileText = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>📄</div>;
const TrendingUp = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>📈</div>;
const Download = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>⬇️</div>;
const Share = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>🔗</div>;

// Simple component definitions
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border shadow-sm ${className}`}>{children}</div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = 'primary', className = '' }: { children: React.ReactNode; variant?: string; className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{children}</span>
);

const Button = ({ children, className = '', variant = 'primary', size = 'md', onClick, ...props }: any) => (
  <button 
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

interface RecentStudiesProps {
  className?: string;
}

// Mock recent studies data
const mockRecentStudies = [
  {
    id: 'STUDY-2024-001',
    patientId: 'P-12345',
    patientName: 'John Doe',
    studyType: 'CT Chest',
    modality: 'CT',
    studyDate: '2024-01-15T08:30:00Z',
    completedDate: '2024-01-15T09:15:00Z',
    status: 'completed',
    priority: 'critical',
    radiologist: 'Dr. Sarah Johnson',
    findings: 'Possible pulmonary embolism detected',
    aiAnalysis: {
      confidence: 0.94,
      status: 'completed',
      keyFindings: ['Pulmonary embolism', 'Enlarged heart']
    },
    images: 245,
    series: 8,
    fileSize: '1.2 GB',
    reportStatus: 'finalized',
    qualityScore: 95
  },
  {
    id: 'STUDY-2024-002',
    patientId: 'P-12346',
    patientName: 'Jane Smith',
    studyType: 'MRI Brain',
    modality: 'MRI',
    studyDate: '2024-01-15T07:45:00Z',
    completedDate: '2024-01-15T08:30:00Z',
    status: 'completed',
    priority: 'high',
    radiologist: 'Dr. Mike Chen',
    findings: 'Normal brain MRI',
    aiAnalysis: {
      confidence: 0.89,
      status: 'completed',
      keyFindings: ['Normal brain structure']
    },
    images: 180,
    series: 12,
    fileSize: '850 MB',
    reportStatus: 'finalized',
    qualityScore: 92
  },
  {
    id: 'STUDY-2024-003',
    patientId: 'P-12347',
    patientName: 'Robert Johnson',
    studyType: 'X-Ray Chest',
    modality: 'X-Ray',
    studyDate: '2024-01-15T06:15:00Z',
    completedDate: '2024-01-15T06:45:00Z',
    status: 'completed',
    priority: 'normal',
    radiologist: 'Dr. Lisa Park',
    findings: 'Clear chest X-ray',
    aiAnalysis: {
      confidence: 0.91,
      status: 'completed',
      keyFindings: ['Normal chest X-ray']
    },
    images: 2,
    series: 1,
    fileSize: '15 MB',
    reportStatus: 'finalized',
    qualityScore: 88
  },
  {
    id: 'STUDY-2024-004',
    patientId: 'P-12348',
    patientName: 'Maria Garcia',
    studyType: 'Ultrasound Abdomen',
    modality: 'US',
    studyDate: '2024-01-15T09:30:00Z',
    completedDate: '2024-01-15T10:00:00Z',
    status: 'in-review',
    priority: 'high',
    radiologist: 'Dr. Tom Wilson',
    findings: 'Pending review',
    aiAnalysis: {
      confidence: 0.87,
      status: 'completed',
      keyFindings: ['Gallbladder inflammation', 'Liver normal']
    },
    images: 45,
    series: 3,
    fileSize: '120 MB',
    reportStatus: 'draft',
    qualityScore: 90
  }
];

export function RecentStudies({ className }: RecentStudiesProps) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const filteredStudies = mockRecentStudies.filter(study => {
    return filterStatus === 'all' || study.status === filterStatus;
  });

  const sortedStudies = [...filteredStudies].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime();
    }
    if (sortBy === 'priority') {
      const priorityOrder = { critical: 3, high: 2, normal: 1 };
      return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
             (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
    }
    return 0;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'normal': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-review': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) return `${diffHours}h ${diffMins}m ago`;
    return `${diffMins}m ago`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="medsight-glass border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span>Recent Medical Studies</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {sortedStudies.length} Studies
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filter and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="in-review">In Review</option>
                <option value="pending">Pending</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-sm"
              >
                <option value="date">Sort by Date</option>
                <option value="priority">Sort by Priority</option>
                <option value="modality">Sort by Modality</option>
              </select>
            </div>
          </div>

          {/* Studies List */}
          <div className="space-y-4">
            {sortedStudies.map((study) => (
              <div key={study.id} className="medsight-glass rounded-lg p-4 hover:bg-white/70 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      study.status === 'completed' ? 'bg-green-100 text-green-600' :
                      study.status === 'in-review' ? 'bg-blue-100 text-blue-600' :
                      'bg-amber-100 text-amber-600'
                    }`}>
                      {study.status === 'completed' && <CheckCircle className="h-4 w-4" />}
                      {study.status === 'in-review' && <Eye className="h-4 w-4" />}
                      {study.status === 'pending' && <Clock className="h-4 w-4" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {study.patientName}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {study.id} • {study.studyType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getPriorityColor(study.priority)}>
                      {study.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(study.status)}>
                      {study.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {getTimeAgo(study.studyDate)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {study.radiologist}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {study.images} images, {study.series} series
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Quality: {study.qualityScore}%
                    </span>
                  </div>
                </div>

                {/* AI Analysis Results */}
                {study.aiAnalysis.status === 'completed' && (
                  <div className="mb-4 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        AI Analysis Results
                      </span>
                      <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                        {Math.round(study.aiAnalysis.confidence * 100)}% Confidence
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      {study.aiAnalysis.keyFindings.map((finding, index) => (
                        <div key={index} className="text-sm text-purple-600 dark:text-purple-400">
                          • {finding}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medical Findings */}
                <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Medical Findings
                    </span>
                    <Badge variant="outline" className={
                      study.reportStatus === 'finalized' ? 'bg-green-100 text-green-700 border-green-200' :
                      'bg-amber-100 text-amber-700 border-amber-200'
                    }>
                      {study.reportStatus.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    {study.findings}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                    <span>{study.modality}</span>
                    <span>•</span>
                    <span>{study.fileSize}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="glass-button">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="glass-button">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline" className="glass-button">
                      <Share className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {sortedStudies.length === 0 && (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">
                <Calendar className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                No studies found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 