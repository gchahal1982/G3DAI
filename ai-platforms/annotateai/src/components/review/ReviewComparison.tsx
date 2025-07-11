'use client';

import { useState, useRef, useEffect } from 'react';
import { ReviewItem, ReviewComment } from '@/app/projects/[id]/review/page';

interface ReviewComparisonProps {
  item: ReviewItem;
  onStatusChange: (itemId: string, status: ReviewItem['status']) => void;
  onQualityScoreUpdate: (itemId: string, score: number) => void;
  onCommentAdd: (itemId: string, comment: Omit<ReviewComment, 'id' | 'createdAt'>) => void;
}

export function ReviewComparison({ item, onStatusChange, onQualityScoreUpdate, onCommentAdd }: ReviewComparisonProps) {
  const [activeView, setActiveView] = useState<'original' | 'revised' | 'comparison'>('comparison');
  const [qualityScore, setQualityScore] = useState(item.qualityScore || 0);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<ReviewComment['type']>('general');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState(false);
  const [editedAnnotation, setEditedAnnotation] = useState(item.originalAnnotation);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (canvasRef.current && imageRef.current) {
      drawAnnotations();
    }
  }, [item, activeView, editedAnnotation]);

  const drawAnnotations = () => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw annotations based on active view
    if (activeView === 'original' || activeView === 'comparison') {
      drawAnnotation(ctx, item.originalAnnotation, 'rgba(255, 0, 0, 0.7)', 'Original');
    }
    
    if (activeView === 'revised' || activeView === 'comparison') {
      const annotation = editingAnnotation ? editedAnnotation : (item.revisedAnnotation || item.originalAnnotation);
      drawAnnotation(ctx, annotation, 'rgba(0, 255, 0, 0.7)', 'Revised');
    }
  };

  const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: any, color: string, label: string) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2;
    ctx.font = '12px Arial';

    switch (annotation.type) {
      case 'bbox':
        const [x, y, width, height] = annotation.bbox;
        ctx.strokeRect(x, y, width, height);
        ctx.fillText(`${label}: ${annotation.category}`, x, y - 5);
        break;
        
      case 'polygon':
        if (annotation.segmentation && annotation.segmentation.length > 0) {
          const points = annotation.segmentation[0];
          ctx.beginPath();
          ctx.moveTo(points[0], points[1]);
          for (let i = 2; i < points.length; i += 2) {
            ctx.lineTo(points[i], points[i + 1]);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.fillText(`${label}: ${annotation.category}`, points[0], points[1] - 5);
        }
        break;
        
      case 'keypoints':
        if (annotation.keypoints) {
          ctx.fillStyle = color;
          for (let i = 0; i < annotation.keypoints.length; i += 3) {
            const x = annotation.keypoints[i];
            const y = annotation.keypoints[i + 1];
            const visibility = annotation.keypoints[i + 2];
            
            if (visibility > 0) {
              ctx.beginPath();
              ctx.arc(x, y, 4, 0, 2 * Math.PI);
              ctx.fill();
            }
          }
          ctx.fillText(`${label}: ${annotation.category}`, annotation.keypoints[0], annotation.keypoints[1] - 5);
        }
        break;
    }
  };

  const handleStatusChange = (newStatus: ReviewItem['status']) => {
    onStatusChange(item.id, newStatus);
  };

  const handleQualityScoreChange = (score: number) => {
    setQualityScore(score);
    onQualityScoreUpdate(item.id, score);
  };

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      onCommentAdd(item.id, {
        userId: 'current_user', // TODO: Get from auth context
        userName: 'Current User',
        userAvatar: 'https://picsum.photos/40/40?random=current',
        content: newComment,
        type: commentType,
        resolved: false
      });
      setNewComment('');
      setShowCommentForm(false);
    }
  };

  const handleAnnotationEdit = () => {
    setEditingAnnotation(true);
  };

  const handleAnnotationSave = () => {
    // TODO: Save edited annotation
    setEditingAnnotation(false);
  };

  const handleAnnotationCancel = () => {
    setEditedAnnotation(item.originalAnnotation);
    setEditingAnnotation(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Review: {item.metadata.annotationType.toUpperCase()} Annotation
            </h3>
            <p className="text-sm text-gray-600">
              ID: {item.annotationId} • Created: {new Date(item.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView('original')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  activeView === 'original' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Original
              </button>
              <button
                onClick={() => setActiveView('revised')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  activeView === 'revised' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Revised
              </button>
              <button
                onClick={() => setActiveView('comparison')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  activeView === 'comparison' 
                    ? 'bg-white shadow-sm text-indigo-600' 
                    : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                Both
              </button>
            </div>

            {/* Status Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleStatusChange('approved')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve
              </button>
              <button
                onClick={() => handleStatusChange('rejected')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => handleStatusChange('needs_revision')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Needs Revision
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Image and Annotation Viewer */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950 overflow-hidden">
            {/* Canvas for annotations */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <img
                  ref={imageRef}
                  src={item.imageUrl}
                  alt="Annotation review"
                  className="max-w-full max-h-full object-contain"
                  onLoad={drawAnnotations}
                />
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            </div>

            {/* Annotation Controls */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xl rounded-lg p-3 shadow-lg">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAnnotationEdit}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Edit Annotation
                </button>
                
                {editingAnnotation && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleAnnotationSave}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleAnnotationCancel}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-xl rounded-lg p-3 shadow-lg">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm text-gray-700">Original</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm text-gray-700">Revised</span>
                </div>
              </div>
            </div>
          </div>

          {/* Annotation Details */}
          <div className="bg-white/80 backdrop-blur-xl border-t border-white/20 p-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Original Annotation */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Original Annotation</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-medium">{item.originalAnnotation.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Confidence:</span>
                    <span className="font-medium">{(item.originalAnnotation.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{item.originalAnnotation.type}</span>
                  </div>
                  {item.originalAnnotation.bbox && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">BBox:</span>
                      <span className="font-medium">{item.originalAnnotation.bbox.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Revised Annotation */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Revised Annotation</h4>
                {item.revisedAnnotation ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{item.revisedAnnotation.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confidence:</span>
                      <span className="font-medium">{(item.revisedAnnotation.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{item.revisedAnnotation.type}</span>
                    </div>
                    {item.revisedAnnotation.bbox && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">BBox:</span>
                        <span className="font-medium">{item.revisedAnnotation.bbox.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No revisions made</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Quality Score and Comments */}
        <div className="w-80 bg-white/60 backdrop-blur-xl border-l border-white/20 flex flex-col">
          {/* Quality Score */}
          <div className="p-4 border-b border-white/20">
            <h4 className="font-semibold text-gray-900 mb-3">Quality Score</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Score:</span>
                <span className={`font-bold text-lg ${
                  qualityScore >= 90 ? 'text-green-600' :
                  qualityScore >= 70 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {qualityScore}%
                </span>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-600">Update Score:</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={qualityScore}
                  onChange={(e) => handleQualityScoreChange(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">Comments ({item.comments.length})</h4>
                <button
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Add Comment
                </button>
              </div>
            </div>

            {/* Comment Form */}
            {showCommentForm && (
              <div className="p-4 border-b border-white/20 bg-indigo-50/50">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comment Type
                    </label>
                    <select
                      value={commentType}
                      onChange={(e) => setCommentType(e.target.value as ReviewComment['type'])}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="general">General</option>
                      <option value="issue">Issue</option>
                      <option value="suggestion">Suggestion</option>
                      <option value="approval">Approval</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Comment
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Enter your comment..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowCommentForm(false)}
                      className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCommentSubmit}
                      className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Add Comment
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto">
              {item.comments.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {item.comments.map((comment) => (
                    <div key={comment.id} className="p-4">
                      <div className="flex items-start space-x-3">
                        <img
                          src={comment.userAvatar}
                          alt={comment.userName}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium text-gray-900">
                              {comment.userName}
                            </h5>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              comment.type === 'approval' ? 'bg-green-100 text-green-700' :
                              comment.type === 'issue' ? 'bg-red-100 text-red-700' :
                              comment.type === 'suggestion' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {comment.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {comment.content}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            {comment.resolved && (
                              <span className="text-xs text-green-600 font-medium">
                                ✓ Resolved
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  <p className="text-sm">No comments yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 