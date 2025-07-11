'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ReviewWorkflow } from '@/components/review/ReviewWorkflow';
import { QualityMetrics } from '@/components/review/QualityMetrics';
import { ReviewComparison } from '@/components/review/ReviewComparison';
import { ReviewStats } from '@/components/review/ReviewStats';

export interface ReviewItem {
  id: string;
  annotationId: string;
  imageId: string;
  imagePath: string;
  imageUrl: string;
  originalAnnotation: any;
  revisedAnnotation?: any;
  status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'needs_revision';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  qualityScore?: number;
  comments: ReviewComment[];
  metadata: {
    projectId: string;
    annotationType: string;
    confidence: number;
    aiGenerated: boolean;
    reviewCount: number;
    flags: string[];
  };
}

export interface ReviewComment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  type: 'general' | 'issue' | 'suggestion' | 'approval';
  createdAt: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

export default function ReviewPage() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<'review' | 'metrics' | 'workflow'>('review');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
    annotationType: 'all'
  });

  // Mock data for demonstration
  const mockReviewItems: ReviewItem[] = [
    {
      id: 'review_001',
      annotationId: 'ann_001',
      imageId: 'img_001',
      imagePath: '/datasets/medical/scan_001.jpg',
      imageUrl: 'https://picsum.photos/800/600?random=1',
      originalAnnotation: {
        id: 'ann_001',
        type: 'bbox',
        bbox: [100, 150, 200, 180],
        category: 'tumor',
        confidence: 0.85,
        attributes: {
          malignancy: 'high',
          size: 'large'
        }
      },
      revisedAnnotation: {
        id: 'ann_001',
        type: 'bbox',
        bbox: [105, 155, 195, 175],
        category: 'tumor',
        confidence: 0.92,
        attributes: {
          malignancy: 'high',
          size: 'large',
          reviewed: true
        }
      },
      status: 'in_review',
      priority: 'high',
      assignedTo: 'reviewer_001',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T14:20:00Z',
      qualityScore: 85,
      comments: [
        {
          id: 'comment_001',
          userId: 'reviewer_001',
          userName: 'Dr. Sarah Chen',
          userAvatar: 'https://picsum.photos/40/40?random=1',
          content: 'The tumor boundaries need slight adjustment. The right edge appears to extend beyond the actual lesion.',
          type: 'issue',
          createdAt: '2024-01-15T14:15:00Z',
          resolved: false
        }
      ],
      metadata: {
        projectId,
        annotationType: 'bbox',
        confidence: 0.85,
        aiGenerated: true,
        reviewCount: 1,
        flags: ['ai_generated', 'high_confidence']
      }
    },
    {
      id: 'review_002',
      annotationId: 'ann_002',
      imageId: 'img_002',
      imagePath: '/datasets/medical/scan_002.jpg',
      imageUrl: 'https://picsum.photos/800/600?random=2',
      originalAnnotation: {
        id: 'ann_002',
        type: 'polygon',
        segmentation: [[120, 180, 180, 160, 210, 200, 190, 240, 140, 230]],
        category: 'organ',
        confidence: 0.92,
        attributes: {
          organ_type: 'liver',
          condition: 'healthy'
        }
      },
      status: 'approved',
      priority: 'medium',
      assignedTo: 'reviewer_002',
      reviewedBy: 'reviewer_002',
      createdAt: '2024-01-14T16:45:00Z',
      updatedAt: '2024-01-15T09:30:00Z',
      reviewedAt: '2024-01-15T09:30:00Z',
      qualityScore: 95,
      comments: [
        {
          id: 'comment_002',
          userId: 'reviewer_002',
          userName: 'Dr. Michael Rodriguez',
          userAvatar: 'https://picsum.photos/40/40?random=2',
          content: 'Excellent segmentation quality. The boundaries are precise and consistent with anatomical structures.',
          type: 'approval',
          createdAt: '2024-01-15T09:25:00Z',
          resolved: true,
          resolvedBy: 'reviewer_002',
          resolvedAt: '2024-01-15T09:30:00Z'
        }
      ],
      metadata: {
        projectId,
        annotationType: 'polygon',
        confidence: 0.92,
        aiGenerated: true,
        reviewCount: 1,
        flags: ['ai_generated', 'high_confidence', 'approved']
      }
    },
    {
      id: 'review_003',
      annotationId: 'ann_003',
      imageId: 'img_003',
      imagePath: '/datasets/medical/scan_003.jpg',
      imageUrl: 'https://picsum.photos/800/600?random=3',
      originalAnnotation: {
        id: 'ann_003',
        type: 'keypoints',
        keypoints: [150, 200, 1, 160, 180, 1, 140, 220, 1, 170, 210, 1],
        category: 'landmark',
        confidence: 0.78,
        attributes: {
          landmark_type: 'anatomical',
          visibility: 'partial'
        }
      },
      status: 'rejected',
      priority: 'high',
      assignedTo: 'reviewer_001',
      reviewedBy: 'reviewer_001',
      createdAt: '2024-01-13T11:15:00Z',
      updatedAt: '2024-01-14T15:45:00Z',
      reviewedAt: '2024-01-14T15:45:00Z',
      qualityScore: 45,
      comments: [
        {
          id: 'comment_003',
          userId: 'reviewer_001',
          userName: 'Dr. Sarah Chen',
          userAvatar: 'https://picsum.photos/40/40?random=1',
          content: 'Multiple keypoints are incorrectly placed. The anatomical landmarks do not align with the actual structures visible in the image.',
          type: 'issue',
          createdAt: '2024-01-14T15:40:00Z',
          resolved: false
        }
      ],
      metadata: {
        projectId,
        annotationType: 'keypoints',
        confidence: 0.78,
        aiGenerated: true,
        reviewCount: 1,
        flags: ['ai_generated', 'low_confidence', 'rejected']
      }
    }
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setReviewItems(mockReviewItems);
      setSelectedItem(mockReviewItems[0]);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleItemSelect = (item: ReviewItem) => {
    setSelectedItem(item);
  };

  const handleStatusChange = (itemId: string, newStatus: ReviewItem['status']) => {
    setReviewItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, status: newStatus, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const handleQualityScoreUpdate = (itemId: string, score: number) => {
    setReviewItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, qualityScore: score, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  const handleCommentAdd = (itemId: string, comment: Omit<ReviewComment, 'id' | 'createdAt'>) => {
    const newComment: ReviewComment = {
      ...comment,
      id: `comment_${Date.now()}`,
      createdAt: new Date().toISOString(),
      resolved: false
    };

    setReviewItems(items =>
      items.map(item =>
        item.id === itemId
          ? { ...item, comments: [...item.comments, newComment] }
          : item
      )
    );
  };

  const filteredItems = reviewItems.filter(item => {
    if (filters.status !== 'all' && item.status !== filters.status) return false;
    if (filters.priority !== 'all' && item.priority !== filters.priority) return false;
    if (filters.assignedTo !== 'all' && item.assignedTo !== filters.assignedTo) return false;
    if (filters.annotationType !== 'all' && item.metadata.annotationType !== filters.annotationType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading review items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-gray-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Annotation Review
            </h1>
            <p className="text-gray-600 mt-1">Review and validate annotations for quality assurance</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Filter by:</span>
              <select 
                value={filters.status} 
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_review">In Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="needs_revision">Needs Revision</option>
              </select>
              
              <select 
                value={filters.priority} 
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-6 mt-4">
          <button
            onClick={() => setCurrentTab('review')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentTab === 'review'
                ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Review Interface
          </button>
          <button
            onClick={() => setCurrentTab('metrics')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentTab === 'metrics'
                ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Quality Metrics
          </button>
          <button
            onClick={() => setCurrentTab('workflow')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              currentTab === 'workflow'
                ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                : 'text-gray-600 hover:text-indigo-600'
            }`}
          >
            Workflow Management
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {currentTab === 'review' && (
          <div className="h-full flex">
            {/* Review Items List */}
            <div className="w-80 bg-white/60 backdrop-blur-xl border-r border-white/20 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Review Items ({filteredItems.length})
                </h3>
                
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleItemSelect(item)}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedItem?.id === item.id
                          ? 'bg-indigo-100 border-2 border-indigo-300'
                          : 'bg-white/80 border border-gray-200 hover:bg-indigo-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {item.metadata.annotationType.toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'approved' ? 'bg-green-100 text-green-700' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          item.status === 'in_review' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          ID: {item.annotationId}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      
                      {item.qualityScore && (
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">Quality Score:</span>
                          <span className={`font-semibold ${
                            item.qualityScore >= 90 ? 'text-green-600' :
                            item.qualityScore >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {item.qualityScore}%
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          {item.comments.length} comment{item.comments.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Review Details */}
            <div className="flex-1 overflow-y-auto">
              {selectedItem ? (
                <ReviewComparison 
                  item={selectedItem}
                  onStatusChange={handleStatusChange}
                  onQualityScoreUpdate={handleQualityScoreUpdate}
                  onCommentAdd={handleCommentAdd}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Review Item</h3>
                    <p className="text-gray-600">Choose an annotation from the list to begin reviewing</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'metrics' && (
          <QualityMetrics 
            projectId={projectId}
            reviewItems={reviewItems}
          />
        )}

        {currentTab === 'workflow' && (
          <ReviewWorkflow 
            projectId={projectId}
            reviewItems={reviewItems}
            onItemsUpdate={setReviewItems}
          />
        )}
      </div>

      {/* Stats Bar */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-white/20 px-6 py-3">
        <ReviewStats items={filteredItems} />
      </div>
    </div>
  );
} 