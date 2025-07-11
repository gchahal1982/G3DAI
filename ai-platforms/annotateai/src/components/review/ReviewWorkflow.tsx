'use client';

import { useState } from 'react';
import { ReviewItem } from '@/app/projects/[id]/review/page';

interface ReviewWorkflowProps {
  projectId: string;
  reviewItems: ReviewItem[];
  onItemsUpdate: (items: ReviewItem[]) => void;
}

interface Reviewer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  specialties: string[];
  workload: number;
  maxWorkload: number;
  performance: {
    averageScore: number;
    averageTime: number;
    reviewed: number;
  };
}

interface WorkflowRule {
  id: string;
  name: string;
  description: string;
  conditions: string[];
  actions: string[];
  enabled: boolean;
}

const mockReviewers: Reviewer[] = [
  {
    id: 'reviewer_001',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@annotateai.com',
    avatar: 'https://picsum.photos/40/40?random=1',
    specialties: ['medical', 'radiology', 'oncology'],
    workload: 15,
    maxWorkload: 25,
    performance: {
      averageScore: 92.5,
      averageTime: 3.2,
      reviewed: 48
    }
  },
  {
    id: 'reviewer_002',
    name: 'Dr. Michael Rodriguez',
    email: 'michael.rodriguez@annotateai.com',
    avatar: 'https://picsum.photos/40/40?random=2',
    specialties: ['computer_vision', 'autonomous_vehicles', 'object_detection'],
    workload: 22,
    maxWorkload: 30,
    performance: {
      averageScore: 89.1,
      averageTime: 2.8,
      reviewed: 67
    }
  },
  {
    id: 'reviewer_003',
    name: 'Dr. Emily Johnson',
    email: 'emily.johnson@annotateai.com',
    avatar: 'https://picsum.photos/40/40?random=3',
    specialties: ['natural_language', 'text_annotation', 'sentiment_analysis'],
    workload: 8,
    maxWorkload: 20,
    performance: {
      averageScore: 94.3,
      averageTime: 4.1,
      reviewed: 32
    }
  }
];

const mockWorkflowRules: WorkflowRule[] = [
  {
    id: 'rule_001',
    name: 'High Priority Assignment',
    description: 'Automatically assign high priority items to available reviewers',
    conditions: ['priority === "high"', 'status === "pending"'],
    actions: ['assign_to_available_reviewer', 'send_notification'],
    enabled: true
  },
  {
    id: 'rule_002',
    name: 'Quality Score Review',
    description: 'Flag items with low quality scores for additional review',
    conditions: ['quality_score < 70'],
    actions: ['flag_for_review', 'assign_to_senior_reviewer'],
    enabled: true
  },
  {
    id: 'rule_003',
    name: 'Workload Balancing',
    description: 'Distribute items evenly among reviewers',
    conditions: ['status === "pending"'],
    actions: ['assign_to_least_loaded_reviewer'],
    enabled: false
  }
];

export function ReviewWorkflow({ projectId, reviewItems, onItemsUpdate }: ReviewWorkflowProps) {
  const [activeTab, setActiveTab] = useState<'assignments' | 'rules' | 'batch'>('assignments');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [batchAction, setBatchAction] = useState<'assign' | 'approve' | 'reject' | 'priority'>('assign');
  const [selectedReviewer, setSelectedReviewer] = useState<string>('');
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [workflowRules, setWorkflowRules] = useState<WorkflowRule[]>(mockWorkflowRules);

  const handleItemSelect = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === reviewItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(reviewItems.map(item => item.id));
    }
  };

  const handleBatchAction = () => {
    const updatedItems = reviewItems.map(item => {
      if (selectedItems.includes(item.id)) {
        switch (batchAction) {
          case 'assign':
            return { ...item, assignedTo: selectedReviewer, status: 'in_review' as const };
          case 'approve':
            return { ...item, status: 'approved' as const, reviewedAt: new Date().toISOString() };
          case 'reject':
            return { ...item, status: 'rejected' as const, reviewedAt: new Date().toISOString() };
          case 'priority':
            return { ...item, priority: selectedPriority };
          default:
            return item;
        }
      }
      return item;
    });

    onItemsUpdate(updatedItems);
    setSelectedItems([]);
  };

  const handleRuleToggle = (ruleId: string) => {
    setWorkflowRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
  };

  const autoAssignItems = () => {
    const unassignedItems = reviewItems.filter(item => !item.assignedTo && item.status === 'pending');
    const availableReviewers = mockReviewers.filter(reviewer => reviewer.workload < reviewer.maxWorkload);

    if (unassignedItems.length === 0 || availableReviewers.length === 0) {
      return;
    }

    const updatedItems = [...reviewItems];
    let reviewerIndex = 0;

    unassignedItems.forEach(item => {
      const reviewer = availableReviewers[reviewerIndex % availableReviewers.length];
      const itemIndex = updatedItems.findIndex(i => i.id === item.id);
      
      if (itemIndex !== -1) {
        updatedItems[itemIndex] = {
          ...updatedItems[itemIndex],
          assignedTo: reviewer.id,
          status: 'in_review'
        };
      }
      
      reviewerIndex++;
    });

    onItemsUpdate(updatedItems);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-indigo-50 via-purple-50 to-gray-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Review Workflow
          </h2>
          <p className="text-gray-600 mt-1">Manage reviewers, assignments, and workflow automation</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={autoAssignItems}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Auto-assign Items
          </button>
          <button
            onClick={() => setShowAssignmentModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Bulk Assignment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 mb-6">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'assignments'
              ? 'bg-indigo-100 text-indigo-700 shadow-sm'
              : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          Reviewer Assignments
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'rules'
              ? 'bg-indigo-100 text-indigo-700 shadow-sm'
              : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          Workflow Rules
        </button>
        <button
          onClick={() => setActiveTab('batch')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'batch'
              ? 'bg-indigo-100 text-indigo-700 shadow-sm'
              : 'text-gray-600 hover:text-indigo-600'
          }`}
        >
          Batch Operations
        </button>
      </div>

      {/* Content */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {/* Reviewer Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockReviewers.map((reviewer) => (
              <div key={reviewer.id} className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={reviewer.avatar}
                      alt={reviewer.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{reviewer.name}</h3>
                      <p className="text-sm text-gray-600">{reviewer.email}</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    reviewer.workload >= reviewer.maxWorkload
                      ? 'bg-red-100 text-red-700'
                      : reviewer.workload >= reviewer.maxWorkload * 0.8
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {reviewer.workload}/{reviewer.maxWorkload}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Workload</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${(reviewer.workload / reviewer.maxWorkload) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avg Score:</span>
                    <span className="font-medium">{reviewer.performance.averageScore.toFixed(1)}%</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Avg Time:</span>
                    <span className="font-medium">{reviewer.performance.averageTime.toFixed(1)}m</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Reviewed:</span>
                    <span className="font-medium">{reviewer.performance.reviewed}</span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {reviewer.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs"
                        >
                          {specialty.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Assignment Overview */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-600">Reviewer</th>
                    <th className="text-center py-2 text-gray-600">Pending</th>
                    <th className="text-center py-2 text-gray-600">In Review</th>
                    <th className="text-center py-2 text-gray-600">Completed</th>
                    <th className="text-center py-2 text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {mockReviewers.map((reviewer) => {
                    const assignedItems = reviewItems.filter(item => item.assignedTo === reviewer.id);
                    const pending = assignedItems.filter(item => item.status === 'pending').length;
                    const inReview = assignedItems.filter(item => item.status === 'in_review').length;
                    const completed = assignedItems.filter(item => 
                      ['approved', 'rejected', 'needs_revision'].includes(item.status)
                    ).length;
                    
                    return (
                      <tr key={reviewer.id} className="border-b border-gray-100">
                        <td className="py-2 font-medium text-gray-900">{reviewer.name}</td>
                        <td className="text-center py-2 text-gray-600">{pending}</td>
                        <td className="text-center py-2 text-gray-600">{inReview}</td>
                        <td className="text-center py-2 text-gray-600">{completed}</td>
                        <td className="text-center py-2 font-medium text-gray-900">{assignedItems.length}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-6">
          {/* Workflow Rules */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Rules</h3>
            <div className="space-y-4">
              {workflowRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{rule.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        rule.enabled 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {rule.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                    <div className="mt-2 space-y-1">
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Conditions:</span> {rule.conditions.join(', ')}
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Actions:</span> {rule.actions.join(', ')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRuleToggle(rule.id)}
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        rule.enabled
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </button>
                    <button className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm font-medium hover:bg-indigo-200 transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'batch' && (
        <div className="space-y-6">
          {/* Batch Operations */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Operations</h3>
            
            {/* Selection Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {selectedItems.length === reviewItems.length ? 'Deselect All' : 'Select All'}
                </button>
                <span className="text-sm text-gray-600">
                  {selectedItems.length} of {reviewItems.length} selected
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <select
                  value={batchAction}
                  onChange={(e) => setBatchAction(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="assign">Assign to Reviewer</option>
                  <option value="approve">Approve</option>
                  <option value="reject">Reject</option>
                  <option value="priority">Change Priority</option>
                </select>
                
                {batchAction === 'assign' && (
                  <select
                    value={selectedReviewer}
                    onChange={(e) => setSelectedReviewer(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select Reviewer</option>
                    {mockReviewers.map((reviewer) => (
                      <option key={reviewer.id} value={reviewer.id}>
                        {reviewer.name}
                      </option>
                    ))}
                  </select>
                )}
                
                {batchAction === 'priority' && (
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                )}
                
                <button
                  onClick={handleBatchAction}
                  disabled={selectedItems.length === 0}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Apply Action
                </button>
              </div>
            </div>

            {/* Items List */}
            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-2 px-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === reviewItems.length}
                        onChange={handleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left py-2 px-3 text-gray-600">ID</th>
                    <th className="text-left py-2 px-3 text-gray-600">Type</th>
                    <th className="text-left py-2 px-3 text-gray-600">Status</th>
                    <th className="text-left py-2 px-3 text-gray-600">Priority</th>
                    <th className="text-left py-2 px-3 text-gray-600">Assigned To</th>
                    <th className="text-left py-2 px-3 text-gray-600">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewItems.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => handleItemSelect(item.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="py-2 px-3 font-medium text-gray-900">{item.annotationId}</td>
                      <td className="py-2 px-3 text-gray-600 capitalize">{item.metadata.annotationType}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'approved' ? 'bg-green-100 text-green-700' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          item.status === 'in_review' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.priority === 'critical' ? 'bg-red-100 text-red-700' :
                          item.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        {item.assignedTo 
                          ? mockReviewers.find(r => r.id === item.assignedTo)?.name || 'Unknown'
                          : 'Unassigned'
                        }
                      </td>
                      <td className="py-2 px-3 text-gray-600">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 