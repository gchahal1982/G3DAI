'use client';

import { ReviewItem } from '@/app/projects/[id]/review/page';

interface ReviewStatsProps {
  items: ReviewItem[];
}

export function ReviewStats({ items }: ReviewStatsProps) {
  const totalItems = items.length;
  const pendingItems = items.filter(item => item.status === 'pending').length;
  const inReviewItems = items.filter(item => item.status === 'in_review').length;
  const approvedItems = items.filter(item => item.status === 'approved').length;
  const rejectedItems = items.filter(item => item.status === 'rejected').length;
  const needsRevisionItems = items.filter(item => item.status === 'needs_revision').length;

  const completedItems = approvedItems + rejectedItems + needsRevisionItems;
  const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const averageQualityScore = items
    .filter(item => item.qualityScore !== undefined)
    .reduce((sum, item, _, arr) => sum + (item.qualityScore || 0) / arr.length, 0);

  return (
    <div className="flex items-center justify-between text-sm text-gray-600">
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
          <span>Pending: {pendingItems}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          <span>In Review: {inReviewItems}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <span>Approved: {approvedItems}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          <span>Rejected: {rejectedItems}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
          <span>Needs Revision: {needsRevisionItems}</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <span>
          Completion: {completionRate.toFixed(1)}% ({completedItems}/{totalItems})
        </span>
        {averageQualityScore > 0 && (
          <span>
            Avg Quality: {averageQualityScore.toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  );
} 