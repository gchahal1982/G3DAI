'use client';

import { useState } from 'react';
// Simple icon components
const Search = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>🔍</div>;
const Clock = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>⏰</div>;
const AlertTriangle = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>⚠️</div>;
const CheckCircle = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>✅</div>;
const Eye = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>👁️</div>;
const Users = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>👥</div>;
const Brain = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>🧠</div>;
const Heart = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>❤️</div>;
const User = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>👤</div>;
const MapPin = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>📍</div>;
const FileText = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>📄</div>;
const Play = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>▶️</div>;
const MoreHorizontal = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>⋯</div>;
const Activity = ({ className = '' }: { className?: string }) => <div className={`inline-block ${className}`}>📊</div>;

// Simple component definitions for missing UI components
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

const Button = ({ children, className = '', variant = 'primary', size = 'md', onClick, ...props }: any) => (
  <button 
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${className}`}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

const TabsContent = ({ children, value, className = '' }: { children: React.ReactNode; value: string; className?: string }) => (
  <div className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}>{children}</div>
);

const TabsList = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`}>{children}</div>
);

const TabsTrigger = ({ children, value, className = '' }: { children: React.ReactNode; value: string; className?: string }) => (
  <button className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm ${className}`}>{children}</button>
);

const Badge = ({ children, variant = 'primary', className = '' }: { children: React.ReactNode; variant?: string; className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{children}</span>
);

const Input = ({ placeholder = '', value = '', onChange, className = '', ...props }: any) => (
  <input 
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    {...props}
  />
);

interface ActiveCasesProps {
  className?: string;
}

// Mock active cases data
const mockActiveCases = [
  {
    id: 'CASE-2024-001',
    patientId: 'P-12345',
    patientName: 'John Doe',
    age: 45,
    gender: 'M',
    modality: 'CT',
    studyType: 'Chest CT',
    priority: 'critical',
    status: 'in-progress',
    assignedTo: 'Dr. Sarah Johnson',
    timeReceived: '2024-01-15T08:30:00Z',
    estimatedCompletion: '2024-01-15T09:00:00Z',
    aiAnalysis: {
      status: 'completed',
      confidence: 0.92,
      findings: ['Possible pulmonary embolism', 'Enlarged lymph nodes']
    },
    clinicalHistory: 'Chest pain, shortness of breath',
    location: 'Emergency Department',
    urgency: 'STAT',
    collaboration: {
      reviewers: ['Dr. Mike Chen', 'Dr. Lisa Park'],
      comments: 3
    }
  },
  {
    id: 'CASE-2024-002',
    patientId: 'P-12346',
    patientName: 'Jane Smith',
    age: 32,
    gender: 'F',
    modality: 'MRI',
    studyType: 'Brain MRI',
    priority: 'high',
    status: 'pending',
    assignedTo: 'Dr. Sarah Johnson',
    timeReceived: '2024-01-15T09:15:00Z',
    estimatedCompletion: '2024-01-15T10:15:00Z',
    aiAnalysis: {
      status: 'in-progress',
      confidence: null,
      findings: []
    },
    clinicalHistory: 'Headaches, visual disturbances',
    location: 'Neurology',
    urgency: 'Urgent',
    collaboration: {
      reviewers: ['Dr. Tom Wilson'],
      comments: 1
    }
  },
  {
    id: 'CASE-2024-003',
    patientId: 'P-12347',
    patientName: 'Robert Johnson',
    age: 67,
    gender: 'M',
    modality: 'X-Ray',
    studyType: 'Chest X-Ray',
    priority: 'normal',
    status: 'completed',
    assignedTo: 'Dr. Sarah Johnson',
    timeReceived: '2024-01-15T07:45:00Z',
    estimatedCompletion: '2024-01-15T08:30:00Z',
    aiAnalysis: {
      status: 'completed',
      confidence: 0.88,
      findings: ['Normal chest X-ray']
    },
    clinicalHistory: 'Routine screening',
    location: 'Outpatient',
    urgency: 'Routine',
    collaboration: {
      reviewers: [],
      comments: 0
    }
  },
  {
    id: 'CASE-2024-004',
    patientId: 'P-12348',
    patientName: 'Maria Garcia',
    age: 28,
    gender: 'F',
    modality: 'Ultrasound',
    studyType: 'Abdominal US',
    priority: 'high',
    status: 'ai-analysis',
    assignedTo: 'Dr. Sarah Johnson',
    timeReceived: '2024-01-15T09:30:00Z',
    estimatedCompletion: '2024-01-15T10:00:00Z',
    aiAnalysis: {
      status: 'in-progress',
      confidence: null,
      findings: []
    },
    clinicalHistory: 'Abdominal pain, nausea',
    location: 'Emergency Department',
    urgency: 'Urgent',
    collaboration: {
      reviewers: ['Dr. Anna Lee'],
      comments: 2
    }
  }
];

export function ActiveCases({ className }: ActiveCasesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const filteredCases = mockActiveCases.filter(case_ => {
    const matchesSearch = case_.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_.studyType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || case_.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || case_.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
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
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'ai-analysis': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getTimeElapsed = (timeReceived: string) => {
    const now = new Date();
    const received = new Date(timeReceived);
    const diffMs = now.getTime() - received.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}h ${diffMins % 60}m ago`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card className="medsight-glass border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <span>Active Medical Cases</span>
            </CardTitle>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {filteredCases.length} Active Cases
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search cases by patient name, ID, or study type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass-input"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="ai-analysis">AI Analysis</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-sm"
              >
                <option value="all">All Priority</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
              </select>
            </div>
          </div>

          {/* Cases List */}
          <div className="space-y-4">
            {filteredCases.map((case_) => (
              <div key={case_.id} className="medsight-glass rounded-lg p-4 hover:bg-white/70 dark:hover:bg-white/5 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      case_.priority === 'critical' ? 'bg-red-100 text-red-600' :
                      case_.priority === 'high' ? 'bg-amber-100 text-amber-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {case_.priority === 'critical' && <AlertTriangle className="h-4 w-4" />}
                      {case_.priority === 'high' && <Clock className="h-4 w-4" />}
                      {case_.priority === 'normal' && <CheckCircle className="h-4 w-4" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {case_.patientName}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {case_.id} • {case_.studyType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className={getPriorityColor(case_.priority)}>
                      {case_.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(case_.status)}>
                      {case_.status.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {case_.age}y {case_.gender}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {case_.location}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {getTimeElapsed(case_.timeReceived)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {case_.modality}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* AI Analysis Status */}
                    <div className="flex items-center space-x-2">
                      <Brain className={`h-4 w-4 ${
                        case_.aiAnalysis.status === 'completed' ? 'text-green-500' :
                        case_.aiAnalysis.status === 'in-progress' ? 'text-blue-500' :
                        'text-slate-400'
                      }`} />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        AI: {case_.aiAnalysis.status}
                        {case_.aiAnalysis.confidence && (
                          <span className="ml-1 text-green-600">
                            ({Math.round(case_.aiAnalysis.confidence * 100)}%)
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Collaboration Status */}
                    {case_.collaboration.reviewers.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {case_.collaboration.reviewers.length} reviewer(s)
                        </span>
                      </div>
                    )}

                    {/* Clinical History */}
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs">
                        {case_.clinicalHistory}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" className="glass-button">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="glass-button">
                      <Play className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                    <Button size="sm" variant="ghost" className="glass-button">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* AI Findings */}
                {case_.aiAnalysis.findings.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <div className="flex items-center space-x-2 mb-2">
                      <Brain className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                        AI Findings
                      </span>
                    </div>
                    <div className="space-y-1">
                      {case_.aiAnalysis.findings.map((finding, index) => (
                        <div key={index} className="text-sm text-purple-600 dark:text-purple-400">
                          • {finding}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredCases.length === 0 && (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                No cases found matching your criteria
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 