'use client';

import { useState, useEffect } from 'react';
import { AnnotationChange, ConflictResolution, CollaborationUser } from '@/lib/collaboration/websocket-client';

export interface AnnotationConflict {
  id: string;
  type: 'simultaneous_edit' | 'overlapping_geometry' | 'category_mismatch' | 'deletion_conflict' | 'merge_conflict';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  conflictingChanges: AnnotationChange[];
  affectedUsers: CollaborationUser[];
  createdAt: string;
  resolvedAt?: string;
  resolution?: ConflictResolution;
  autoResolvable: boolean;
  suggestedResolution?: 'merge' | 'overwrite' | 'keep_both' | 'manual';
}

interface ConflictResolverProps {
  conflicts: AnnotationConflict[];
  onResolveConflict: (conflictId: string, resolution: ConflictResolution) => void;
  onDismissConflict: (conflictId: string) => void;
  currentUserId: string;
  canResolveConflicts?: boolean;
}

export function ConflictResolver({ 
  conflicts, 
  onResolveConflict, 
  onDismissConflict, 
  currentUserId, 
  canResolveConflicts = true 
}: ConflictResolverProps) {
  const [selectedConflict, setSelectedConflict] = useState<AnnotationConflict | null>(null);
  const [resolutionMode, setResolutionMode] = useState<'auto' | 'manual'>('auto');
  const [showResolved, setShowResolved] = useState(false);

  const unresolvedConflicts = conflicts.filter(c => !c.resolvedAt);
  const resolvedConflicts = conflicts.filter(c => c.resolvedAt);

  const getSeverityColor = (severity: AnnotationConflict['severity']) => {
    switch (severity) {
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'critical': return 'bg-red-200 text-red-900 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConflictIcon = (type: AnnotationConflict['type']) => {
    switch (type) {
      case 'simultaneous_edit':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V9a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V4a1 1 0 011-1h3a1 1 0 011 1v1z" />
          </svg>
        );
      case 'overlapping_geometry':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
      case 'category_mismatch':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'deletion_conflict':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'merge_conflict':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  const handleAutoResolve = async (conflict: AnnotationConflict) => {
    if (!conflict.autoResolvable || !conflict.suggestedResolution) return;

    const resolution: ConflictResolution = {
      conflictId: conflict.id,
      type: conflict.suggestedResolution,
      resolvedBy: currentUserId,
      resolvedAt: new Date().toISOString(),
      resolution: generateAutoResolution(conflict)
    };

    onResolveConflict(conflict.id, resolution);
  };

  const generateAutoResolution = (conflict: AnnotationConflict) => {
    switch (conflict.suggestedResolution) {
      case 'merge':
        return mergeConflictingChanges(conflict.conflictingChanges);
      case 'overwrite':
        // Use the most recent change
        return conflict.conflictingChanges.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0];
      case 'keep_both':
        return {
          action: 'keep_both',
          changes: conflict.conflictingChanges
        };
      default:
        return null;
    }
  };

  const mergeConflictingChanges = (changes: AnnotationChange[]) => {
    // Simple merge logic - in practice this would be more sophisticated
    const baseChange = changes[0];
    const mergedAnnotation = { ...baseChange.annotation };

    changes.slice(1).forEach(change => {
      // Merge attributes
      if (change.annotation.attributes) {
        mergedAnnotation.attributes = {
          ...mergedAnnotation.attributes,
          ...change.annotation.attributes
        };
      }

      // Use latest geometry if it's a move/resize
      if (change.action === 'move' || change.action === 'resize') {
        mergedAnnotation.geometry = change.annotation.geometry;
      }
    });

    return {
      action: 'merge',
      annotation: mergedAnnotation,
      contributors: changes.map(c => c.userId)
    };
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  if (conflicts.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      {/* Conflicts Panel */}
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="font-semibold">Annotation Conflicts</h3>
            </div>
            <span className="px-2 py-1 bg-white/20 rounded-full text-sm">
              {unresolvedConflicts.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 mt-2">
            <button
              onClick={() => setResolutionMode(resolutionMode === 'auto' ? 'manual' : 'auto')}
              className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors"
            >
              {resolutionMode === 'auto' ? 'Auto Resolve' : 'Manual Review'}
            </button>
            
            <button
              onClick={() => setShowResolved(!showResolved)}
              className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors"
            >
              {showResolved ? 'Hide Resolved' : 'Show Resolved'}
            </button>
          </div>
        </div>

        {/* Conflict List */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {/* Unresolved Conflicts */}
          <div className="space-y-3">
            {unresolvedConflicts.map(conflict => (
              <div key={conflict.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(conflict.severity)}`}>
                    {getConflictIcon(conflict.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900 text-sm">{conflict.description}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getSeverityColor(conflict.severity)}`}>
                        {conflict.severity}
                      </span>
                    </div>
                    
                    <div className="text-xs text-gray-600 mt-1">
                      {conflict.affectedUsers.length} user{conflict.affectedUsers.length !== 1 ? 's' : ''} affected • {formatTimeAgo(conflict.createdAt)}
                    </div>
                    
                    <div className="flex items-center space-x-2 mt-2">
                      {conflict.autoResolvable && resolutionMode === 'auto' && (
                        <button
                          onClick={() => handleAutoResolve(conflict)}
                          className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors"
                        >
                          Auto Resolve
                        </button>
                      )}
                      
                      <button
                        onClick={() => setSelectedConflict(conflict)}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Review
                      </button>
                      
                      {canResolveConflicts && (
                        <button
                          onClick={() => onDismissConflict(conflict.id)}
                          className="px-3 py-1 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700 transition-colors"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resolved Conflicts */}
          {showResolved && resolvedConflicts.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-3 text-sm">Resolved Conflicts</h4>
              <div className="space-y-2">
                {resolvedConflicts.map(conflict => (
                  <div key={conflict.id} className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{conflict.description}</span>
                      <span className="text-xs text-gray-500">
                        Resolved {formatTimeAgo(conflict.resolvedAt!)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {unresolvedConflicts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm">No conflicts detected</p>
              <p className="text-xs text-gray-400 mt-1">All collaborators are in sync</p>
            </div>
          )}
        </div>
      </div>

      {/* Conflict Detail Modal */}
      {selectedConflict && (
        <ConflictDetailModal
          conflict={selectedConflict}
          onResolve={(resolution) => {
            onResolveConflict(selectedConflict.id, resolution);
            setSelectedConflict(null);
          }}
          onCancel={() => setSelectedConflict(null)}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}

interface ConflictDetailModalProps {
  conflict: AnnotationConflict;
  onResolve: (resolution: ConflictResolution) => void;
  onCancel: () => void;
  currentUserId: string;
}

function ConflictDetailModal({ conflict, onResolve, onCancel, currentUserId }: ConflictDetailModalProps) {
  const [selectedResolution, setSelectedResolution] = useState<ConflictResolution['type']>('merge');
  const [customResolution, setCustomResolution] = useState<any>(null);

  const handleResolve = () => {
    const resolution: ConflictResolution = {
      conflictId: conflict.id,
      type: selectedResolution,
      resolvedBy: currentUserId,
      resolvedAt: new Date().toISOString(),
      resolution: customResolution || generateResolution()
    };

    onResolve(resolution);
  };

  const generateResolution = () => {
    switch (selectedResolution) {
      case 'merge':
        return mergeConflictingChanges(conflict.conflictingChanges);
      case 'overwrite':
        return conflict.conflictingChanges[0];
      case 'keep_both':
        return { action: 'keep_both', changes: conflict.conflictingChanges };
      case 'manual':
        return customResolution;
      default:
        return null;
    }
  };

  const mergeConflictingChanges = (changes: AnnotationChange[]) => {
    // Simple merge implementation
    return {
      action: 'merge',
      annotation: changes[0].annotation,
      contributors: changes.map(c => c.userId)
    };
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Resolve Conflict</h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Conflict Details</h4>
            <p className="text-gray-600 text-sm">{conflict.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
              <span>Type: {conflict.type.replace('_', ' ')}</span>
              <span>Severity: {conflict.severity}</span>
              <span>Users: {conflict.affectedUsers.length}</span>
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Conflicting Changes</h4>
            <div className="space-y-3">
              {conflict.conflictingChanges.map((change, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">Change {index + 1}</span>
                    <span className="text-xs text-gray-500">by {change.userId}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Action: {change.action} • Time: {new Date(change.timestamp).toLocaleTimeString()}
                  </div>
                  {change.annotation && (
                    <div className="mt-2 text-xs bg-white p-2 rounded border">
                      <pre className="whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(change.annotation, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Resolution Options</h4>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  value="merge"
                  checked={selectedResolution === 'merge'}
                  onChange={(e) => setSelectedResolution(e.target.value as any)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <div className="font-medium text-sm">Merge Changes</div>
                  <div className="text-xs text-gray-600">Combine all changes intelligently</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  value="overwrite"
                  checked={selectedResolution === 'overwrite'}
                  onChange={(e) => setSelectedResolution(e.target.value as any)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <div className="font-medium text-sm">Use Latest Change</div>
                  <div className="text-xs text-gray-600">Keep the most recent modification</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  value="keep_both"
                  checked={selectedResolution === 'keep_both'}
                  onChange={(e) => setSelectedResolution(e.target.value as any)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <div className="font-medium text-sm">Keep Both</div>
                  <div className="text-xs text-gray-600">Create separate annotations for each change</div>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="resolution"
                  value="manual"
                  checked={selectedResolution === 'manual'}
                  onChange={(e) => setSelectedResolution(e.target.value as any)}
                  className="w-4 h-4 text-indigo-600"
                />
                <div>
                  <div className="font-medium text-sm">Manual Resolution</div>
                  <div className="text-xs text-gray-600">Define custom resolution</div>
                </div>
              </label>
            </div>
          </div>

          {selectedResolution === 'manual' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Resolution
              </label>
              <textarea
                value={customResolution ? JSON.stringify(customResolution, null, 2) : ''}
                onChange={(e) => {
                  try {
                    setCustomResolution(JSON.parse(e.target.value));
                  } catch {
                    // Invalid JSON, keep as string for now
                  }
                }}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                placeholder="Enter custom resolution JSON..."
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleResolve}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Resolve Conflict
          </button>
        </div>
      </div>
    </div>
  );
} 