'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  UserCheck,
  UserX,
  Phone,
  MessageSquare,
  Activity,
  MapPin,
  Star,
  PieChart,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface PatientMetrics {
  newPatients: number;
  returningPatients: number;
  appointmentCompletionRate: number;
  patientSatisfaction: number;
  averageWaitTime: number;
  noShowRate: number;
  emergencyAdmissions: number;
  dischargeRate: number;
}

interface PatientAnalyticsProps {
  metrics: PatientMetrics;
  timeRange: string;
}

interface PatientDemographics {
  ageGroups: {
    group: string;
    count: number;
    percentage: number;
  }[];
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  geographicDistribution: {
    region: string;
    count: number;
    percentage: number;
  }[];
}

interface PatientFlow {
  hourlyFlow: {
    hour: number;
    appointments: number;
    walkIns: number;
    emergencies: number;
  }[];
  weeklyTrends: {
    day: string;
    appointments: number;
    completions: number;
    noShows: number;
  }[];
}

interface PatientFeedback {
  overallRating: number;
  categories: {
    waitTime: number;
    staffCourtesy: number;
    facilityCleanness: number;
    communicationClarity: number;
    treatmentEffectiveness: number;
  };
  recentComments: {
    id: string;
    rating: number;
    comment: string;
    date: Date;
    category: string;
  }[];
}

const PatientAnalytics: React.FC<PatientAnalyticsProps> = ({ metrics, timeRange }) => {
  const [selectedView, setSelectedView] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Mock data for comprehensive analytics
  const demographics: PatientDemographics = {
    ageGroups: [
      { group: '0-18', count: 1247, percentage: 15.2 },
      { group: '19-35', count: 2156, percentage: 26.3 },
      { group: '36-50', count: 1934, percentage: 23.6 },
      { group: '51-65', count: 1789, percentage: 21.8 },
      { group: '65+', count: 1087, percentage: 13.3 }
    ],
    genderDistribution: {
      male: 4523,
      female: 4689,
      other: 134
    },
    geographicDistribution: [
      { region: 'Urban Core', count: 3456, percentage: 42.1 },
      { region: 'Suburban', count: 2134, percentage: 26.0 },
      { region: 'Rural', count: 1567, percentage: 19.1 },
      { region: 'Metropolitan', count: 1056, percentage: 12.9 }
    ]
  };

  const patientFlow: PatientFlow = {
    hourlyFlow: [
      { hour: 8, appointments: 45, walkIns: 8, emergencies: 2 },
      { hour: 9, appointments: 67, walkIns: 12, emergencies: 3 },
      { hour: 10, appointments: 78, walkIns: 15, emergencies: 1 },
      { hour: 11, appointments: 89, walkIns: 18, emergencies: 4 },
      { hour: 12, appointments: 56, walkIns: 22, emergencies: 2 },
      { hour: 13, appointments: 45, walkIns: 19, emergencies: 1 },
      { hour: 14, appointments: 67, walkIns: 16, emergencies: 3 },
      { hour: 15, appointments: 78, walkIns: 13, emergencies: 2 },
      { hour: 16, appointments: 89, walkIns: 11, emergencies: 4 },
      { hour: 17, appointments: 67, walkIns: 9, emergencies: 1 }
    ],
    weeklyTrends: [
      { day: 'Monday', appointments: 234, completions: 198, noShows: 36 },
      { day: 'Tuesday', appointments: 267, completions: 238, noShows: 29 },
      { day: 'Wednesday', appointments: 245, completions: 221, noShows: 24 },
      { day: 'Thursday', appointments: 289, completions: 261, noShows: 28 },
      { day: 'Friday', appointments: 198, completions: 176, noShows: 22 },
      { day: 'Saturday', appointments: 156, completions: 142, noShows: 14 },
      { day: 'Sunday', appointments: 89, completions: 78, noShows: 11 }
    ]
  };

  const feedback: PatientFeedback = {
    overallRating: metrics.patientSatisfaction,
    categories: {
      waitTime: 4.2,
      staffCourtesy: 4.8,
      facilityCleanness: 4.6,
      communicationClarity: 4.3,
      treatmentEffectiveness: 4.7
    },
    recentComments: [
      {
        id: '1',
        rating: 5,
        comment: 'Excellent service and very professional staff. The AI-assisted diagnosis was impressive.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2),
        category: 'treatment'
      },
      {
        id: '2',
        rating: 4,
        comment: 'Good overall experience, though the wait time was longer than expected.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 6),
        category: 'service'
      },
      {
        id: '3',
        rating: 5,
        comment: 'The medical imaging results were delivered quickly and the explanations were clear.',
        date: new Date(Date.now() - 1000 * 60 * 60 * 12),
        category: 'imaging'
      }
    ]
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => `${num.toFixed(1)}%`;

  const getCompletionRate = (completed: number, total: number) => {
    return ((completed / total) * 100).toFixed(1);
  };

  const getTrendColor = (value: number, benchmark: number) => {
    if (value >= benchmark) return 'text-green-600';
    if (value >= benchmark * 0.8) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Patient Analytics</h2>
          <p className="text-sm text-gray-600">Comprehensive patient data and satisfaction metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <select
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="overview">Overview</option>
            <option value="demographics">Demographics</option>
            <option value="flow">Patient Flow</option>
            <option value="satisfaction">Satisfaction</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Patients</p>
              <p className="text-2xl font-bold text-blue-600">{formatNumber(metrics.newPatients)}</p>
              <p className="text-sm text-gray-500">vs {formatNumber(metrics.returningPatients)} returning</p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Satisfaction Score</p>
              <p className="text-2xl font-bold text-green-600">{metrics.patientSatisfaction.toFixed(1)}/5</p>
              <div className="flex items-center mt-1">
                {renderStars(metrics.patientSatisfaction)}
              </div>
            </div>
            <Heart className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Wait Time</p>
              <p className="text-2xl font-bold text-yellow-600">{metrics.averageWaitTime}min</p>
              <p className="text-sm text-gray-500">Target: ≤15min</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">No-Show Rate</p>
              <p className={`text-2xl font-bold ${getTrendColor(100 - metrics.noShowRate, 90)}`}>
                {formatPercentage(metrics.noShowRate)}
              </p>
              <p className="text-sm text-gray-500">
                {formatPercentage(metrics.appointmentCompletionRate)} completed
              </p>
            </div>
            <UserX className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Main Content Based on Selected View */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {selectedView === 'overview' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Patient Overview</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointment Statistics */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Appointment Statistics</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Total Appointments</span>
                    </div>
                    <span className="text-lg font-bold text-blue-600">
                      {formatNumber(metrics.newPatients + metrics.returningPatients)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Completion Rate</span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      {formatPercentage(metrics.appointmentCompletionRate)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Activity className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-sm font-medium">Emergency Admissions</span>
                    </div>
                    <span className="text-lg font-bold text-red-600">
                      {formatNumber(metrics.emergencyAdmissions)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Patient Satisfaction Breakdown */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Satisfaction Breakdown</h4>
                <div className="space-y-3">
                  {Object.entries(feedback.categories).map(([category, rating]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {category.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center">
                        {renderStars(rating)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'demographics' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Patient Demographics</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Age Distribution</h4>
                <div className="space-y-2">
                  {demographics.ageGroups.map((group) => (
                    <div key={group.group} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{group.group}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${group.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {formatPercentage(group.percentage)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic Distribution */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Geographic Distribution</h4>
                <div className="space-y-2">
                  {demographics.geographicDistribution.map((region) => (
                    <div key={region.region} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{region.region}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${region.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {formatPercentage(region.percentage)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'flow' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Patient Flow Analysis</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hourly Flow */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Hourly Patient Flow</h4>
                <div className="space-y-2">
                  {patientFlow.hourlyFlow.map((hour) => (
                    <div key={hour.hour} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm font-medium text-gray-700">
                        {hour.hour}:00
                      </span>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-blue-600">A: {hour.appointments}</span>
                        <span className="text-green-600">W: {hour.walkIns}</span>
                        <span className="text-red-600">E: {hour.emergencies}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly Trends */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Weekly Trends</h4>
                <div className="space-y-2">
                  {patientFlow.weeklyTrends.map((day) => (
                    <div key={day.day} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">{day.day}</span>
                        <span className="text-sm text-gray-600">
                          {formatPercentage(parseFloat(getCompletionRate(day.completions, day.appointments)))} completion
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-blue-600 font-medium">{day.appointments}</div>
                          <div className="text-gray-500">Scheduled</div>
                        </div>
                        <div className="text-center">
                          <div className="text-green-600 font-medium">{day.completions}</div>
                          <div className="text-gray-500">Completed</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-600 font-medium">{day.noShows}</div>
                          <div className="text-gray-500">No Shows</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedView === 'satisfaction' && (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Patient Satisfaction</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Satisfaction */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Overall Rating</h4>
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {feedback.overallRating.toFixed(1)}
                  </div>
                  <div className="mb-2">
                    {renderStars(feedback.overallRating)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Based on {formatNumber(metrics.newPatients + metrics.returningPatients)} responses
                  </div>
                </div>
              </div>

              {/* Recent Comments */}
              <div>
                <h4 className="text-md font-medium text-gray-800 mb-4">Recent Feedback</h4>
                <div className="space-y-3">
                  {feedback.recentComments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {renderStars(comment.rating)}
                        </div>
                        <span className="text-xs text-gray-500 capitalize">
                          {comment.category}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{comment.comment}</p>
                      <div className="text-xs text-gray-500">
                        {comment.date.toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAnalytics; 