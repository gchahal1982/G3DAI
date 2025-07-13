'use client';

import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  BackwardIcon,
  ForwardIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
  ClockIcon,
  FilmIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  PlusIcon,
  MinusIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  MagnifyingGlassIcon,
  BookmarkIcon,
  TagIcon,
  ShareIcon,
  PrinterIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface CineControlsProps {
  totalFrames?: number;
  currentFrame?: number;
  frameRate?: number;
  isPlaying?: boolean;
  loop?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onFrameChange?: (frame: number) => void;
  onFrameRateChange?: (rate: number) => void;
  onLoopToggle?: (loop: boolean) => void;
  studyInfo?: {
    studyId: string;
    seriesNumber: number;
    modality: string;
    acquisitionTime: string;
    patientId: string;
  };
  showAdvancedControls?: boolean;
  readOnly?: boolean;
  emergencyMode?: boolean;
  className?: string;
}

interface PlaybackSettings {
  frameRate: number;
  direction: 'forward' | 'backward' | 'bounce';
  interpolation: 'none' | 'linear' | 'cubic';
  quality: 'draft' | 'standard' | 'high';
  skipFrames: number;
  autoLoop: boolean;
  smoothPlayback: boolean;
  preloadFrames: number;
}

interface SequenceInfo {
  totalFrames: number;
  frameSize: { width: number; height: number };
  pixelSpacing: { x: number; y: number };
  acquisitionDate: string;
  seriesDescription: string;
  frameTime: number; // milliseconds per frame
  totalDuration: number; // total sequence duration in seconds
}

interface BookmarkFrame {
  id: string;
  frame: number;
  timestamp: string;
  name: string;
  description: string;
  tags: string[];
  author: string;
  clinicalRelevance: 'normal' | 'abnormal' | 'critical' | 'artifact';
}

export default function CineControls({
  totalFrames = 100,
  currentFrame = 0,
  frameRate = 30,
  isPlaying = false,
  loop = false,
  onPlay,
  onPause,
  onStop,
  onFrameChange,
  onFrameRateChange,
  onLoopToggle,
  studyInfo,
  showAdvancedControls = false,
  readOnly = false,
  emergencyMode = false,
  className = ''
}: CineControlsProps) {
  const progressRef = useRef<HTMLDivElement>(null);
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const [playbackSettings, setPlaybackSettings] = useState<PlaybackSettings>({
    frameRate: frameRate,
    direction: 'forward',
    interpolation: 'linear',
    quality: 'standard',
    skipFrames: 0,
    autoLoop: loop,
    smoothPlayback: true,
    preloadFrames: 10
  });
  
  const [sequenceInfo] = useState<SequenceInfo>({
    totalFrames,
    frameSize: { width: 512, height: 512 },
    pixelSpacing: { x: 1.0, y: 1.0 },
    acquisitionDate: new Date().toISOString(),
    seriesDescription: 'Cardiac Cine Sequence',
    frameTime: 1000 / frameRate,
    totalDuration: totalFrames / frameRate
  });
  
  const [bookmarkedFrames, setBookmarkedFrames] = useState<BookmarkFrame[]>([
    {
      id: 'bookmark_1',
      frame: 15,
      timestamp: new Date().toISOString(),
      name: 'Systole',
      description: 'Peak systolic frame showing maximum ventricular contraction',
      tags: ['cardiac', 'systole', 'peak'],
      author: 'Dr. Sarah Chen',
      clinicalRelevance: 'normal'
    },
    {
      id: 'bookmark_2',
      frame: 45,
      timestamp: new Date().toISOString(),
      name: 'Diastole',
      description: 'Diastolic frame showing ventricular filling',
      tags: ['cardiac', 'diastole', 'filling'],
      author: 'Dr. Sarah Chen',
      clinicalRelevance: 'normal'
    }
  ]);
  
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showSequenceInfo, setShowSequenceInfo] = useState(false);
  const [showPlaybackSettings, setShowPlaybackSettings] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  
  // Frame rate presets for different medical imaging modalities
  const frameRatePresets = [
    { label: '5 fps', value: 5, description: 'Slow review' },
    { label: '10 fps', value: 10, description: 'Standard review' },
    { label: '15 fps', value: 15, description: 'Smooth review' },
    { label: '24 fps', value: 24, description: 'Cinematic' },
    { label: '30 fps', value: 30, description: 'Real-time cardiac' },
    { label: '60 fps', value: 60, description: 'High-speed cardiac' }
  ];

  // Calculate derived values
  const progressPercentage = totalFrames > 0 ? (currentFrame / (totalFrames - 1)) * 100 : 0;
  const currentTime = currentFrame * sequenceInfo.frameTime / 1000; // seconds
  const totalTime = sequenceInfo.totalDuration;
  const framesPerSecond = playbackSettings.frameRate * playbackSpeed;

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
  };

  // Handle playback controls
  const handlePlay = useCallback(() => {
    if (!readOnly) {
      onPlay?.();
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
      
             playbackIntervalRef.current = setInterval(() => {
         const nextFrame = playbackSettings.direction === 'forward' 
           ? currentFrame + 1 + playbackSettings.skipFrames
           : currentFrame - 1 - playbackSettings.skipFrames;
         
         if (nextFrame >= totalFrames) {
           if (playbackSettings.autoLoop) {
             onFrameChange?.(0);
           } else {
             onPause?.();
           }
         } else if (nextFrame < 0) {
           if (playbackSettings.autoLoop) {
             onFrameChange?.(totalFrames - 1);
           } else {
             onPause?.();
           }
         } else {
           onFrameChange?.(nextFrame);
         }
       }, sequenceInfo.frameTime / playbackSpeed);
    }
  }, [readOnly, onPlay, onFrameChange, onPause, playbackSettings, sequenceInfo.frameTime, playbackSpeed, totalFrames]);

  const handlePause = useCallback(() => {
    if (!readOnly) {
      onPause?.();
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }
    }
  }, [readOnly, onPause]);

  const handleStop = useCallback(() => {
    if (!readOnly) {
      onStop?.();
      handlePause();
      onFrameChange?.(0);
    }
  }, [readOnly, onStop, handlePause, onFrameChange]);

  const handleFrameSeek = useCallback((frame: number) => {
    if (!readOnly) {
      const clampedFrame = Math.max(0, Math.min(totalFrames - 1, frame));
      onFrameChange?.(clampedFrame);
    }
  }, [readOnly, onFrameChange, totalFrames]);

  const handleProgressClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!readOnly && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const percentage = clickX / rect.width;
      const targetFrame = Math.round(percentage * (totalFrames - 1));
      handleFrameSeek(targetFrame);
    }
  }, [readOnly, handleFrameSeek, totalFrames]);

  const handleFrameRateChange = useCallback((newRate: number) => {
    setPlaybackSettings(prev => ({ ...prev, frameRate: newRate }));
    onFrameRateChange?.(newRate);
  }, [onFrameRateChange]);

  const addBookmark = useCallback(() => {
    if (!readOnly) {
      const newBookmark: BookmarkFrame = {
        id: `bookmark_${Date.now()}`,
        frame: currentFrame,
        timestamp: new Date().toISOString(),
        name: `Frame ${currentFrame + 1}`,
        description: `Bookmarked frame at ${formatTime(currentTime)}`,
        tags: ['user-created'],
        author: 'Current User',
        clinicalRelevance: 'normal'
      };
      setBookmarkedFrames(prev => [...prev, newBookmark].sort((a, b) => a.frame - b.frame));
    }
  }, [readOnly, currentFrame, currentTime]);

  const removeBookmark = useCallback((bookmarkId: string) => {
    if (!readOnly) {
      setBookmarkedFrames(prev => prev.filter(b => b.id !== bookmarkId));
    }
  }, [readOnly]);

  const goToBookmark = useCallback((bookmark: BookmarkFrame) => {
    handleFrameSeek(bookmark.frame);
    setSelectedBookmark(bookmark.id);
  }, [handleFrameSeek]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className={`medsight-control-glass rounded-lg p-4 ${className}`}>
      {/* Header with sequence info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FilmIcon className="w-5 h-5 text-medsight-primary" />
          <h3 className="text-sm font-semibold text-gray-900">Cine Controls</h3>
          {studyInfo && (
            <span className="text-xs text-gray-600">
              {studyInfo.modality} Series {studyInfo.seriesNumber}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSequenceInfo(!showSequenceInfo)}
            className={`btn-medsight text-xs p-2 ${showSequenceInfo ? 'bg-medsight-primary/20' : ''}`}
            title="Sequence Information"
          >
            <InformationCircleIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setShowPlaybackSettings(!showPlaybackSettings)}
            className={`btn-medsight text-xs p-2 ${showPlaybackSettings ? 'bg-medsight-primary/20' : ''}`}
            title="Playback Settings"
          >
            <Cog6ToothIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Frame progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>Frame {currentFrame + 1} / {totalFrames}</span>
          <span>{formatTime(currentTime)} / {formatTime(totalTime)}</span>
        </div>
        
        <div
          ref={progressRef}
          className="relative h-3 bg-gray-200 rounded-full cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
        >
          {/* Progress bar */}
          <div
            className="absolute left-0 top-0 h-full bg-medsight-primary rounded-full transition-all duration-150"
            style={{ width: `${progressPercentage}%` }}
          />
          
          {/* Bookmarks on progress bar */}
          {bookmarkedFrames.map(bookmark => (
            <div
              key={bookmark.id}
              className={`absolute top-0 w-1 h-full cursor-pointer transform -translate-x-0.5 ${
                bookmark.clinicalRelevance === 'critical' ? 'bg-red-500' :
                bookmark.clinicalRelevance === 'abnormal' ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ left: `${(bookmark.frame / (totalFrames - 1)) * 100}%` }}
              onClick={(e) => {
                e.stopPropagation();
                goToBookmark(bookmark);
              }}
              title={`${bookmark.name} - Frame ${bookmark.frame + 1}`}
            />
          ))}
          
          {/* Buffering indicator */}
          {isBuffering && (
            <div className="absolute inset-0 bg-gray-300/50 rounded-full animate-pulse" />
          )}
        </div>
      </div>

      {/* Main playback controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        {/* Speed control */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaybackSpeed(Math.max(0.1, playbackSpeed - 0.1))}
            disabled={readOnly}
            className="btn-medsight text-xs p-1"
            title="Decrease Speed"
          >
            <MinusIcon className="w-3 h-3" />
          </button>
          <span className="text-xs text-gray-600 min-w-12 text-center">
            {playbackSpeed.toFixed(1)}x
          </span>
          <button
            onClick={() => setPlaybackSpeed(Math.min(5.0, playbackSpeed + 0.1))}
            disabled={readOnly}
            className="btn-medsight text-xs p-1"
            title="Increase Speed"
          >
            <PlusIcon className="w-3 h-3" />
          </button>
        </div>

        {/* Frame navigation */}
        <button
          onClick={() => handleFrameSeek(0)}
          disabled={readOnly || currentFrame === 0}
          className="btn-medsight p-2"
          title="First Frame"
        >
          <BackwardIcon className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => handleFrameSeek(currentFrame - 1)}
          disabled={readOnly || currentFrame === 0}
          className="btn-medsight p-2"
          title="Previous Frame"
        >
          <ArrowsPointingInIcon className="w-4 h-4" />
        </button>

        {/* Play/Pause button */}
        <button
          onClick={isPlaying ? handlePause : handlePlay}
          disabled={readOnly}
          className="btn-medsight p-3 bg-medsight-primary/20"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </button>

        {/* Stop button */}
        <button
          onClick={handleStop}
          disabled={readOnly}
          className="btn-medsight p-2"
          title="Stop"
        >
          <StopIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleFrameSeek(currentFrame + 1)}
          disabled={readOnly || currentFrame >= totalFrames - 1}
          className="btn-medsight p-2"
          title="Next Frame"
        >
          <ArrowsPointingOutIcon className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => handleFrameSeek(totalFrames - 1)}
          disabled={readOnly || currentFrame >= totalFrames - 1}
          className="btn-medsight p-2"
          title="Last Frame"
        >
          <ForwardIcon className="w-4 h-4" />
        </button>

        {/* Loop toggle */}
        <button
          onClick={() => {
            const newLoop = !playbackSettings.autoLoop;
            setPlaybackSettings(prev => ({ ...prev, autoLoop: newLoop }));
            onLoopToggle?.(newLoop);
          }}
          disabled={readOnly}
          className={`btn-medsight p-2 ${playbackSettings.autoLoop ? 'bg-medsight-primary/20' : ''}`}
          title="Loop Playback"
        >
          <ArrowPathIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Frame rate controls */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className="text-xs text-gray-600">Frame Rate:</span>
        {frameRatePresets.map(preset => (
          <button
            key={preset.value}
            onClick={() => handleFrameRateChange(preset.value)}
            disabled={readOnly}
            className={`btn-medsight text-xs px-2 py-1 ${
              playbackSettings.frameRate === preset.value ? 'bg-medsight-primary/20' : ''
            }`}
            title={preset.description}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Bookmark controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBookmarks(!showBookmarks)}
            className={`btn-medsight text-xs ${showBookmarks ? 'bg-medsight-primary/20' : ''}`}
          >
            <BookmarkIcon className="w-4 h-4 mr-1" />
            Bookmarks ({bookmarkedFrames.length})
          </button>
          
          <button
            onClick={addBookmark}
            disabled={readOnly}
            className="btn-medsight text-xs"
            title="Add Bookmark"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn-medsight text-xs"
            title="Export Sequence"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
            Export
          </button>
          
          <button
            className="btn-medsight text-xs"
            title="Share Sequence"
          >
            <ShareIcon className="w-4 h-4 mr-1" />
            Share
          </button>
        </div>
      </div>

      {/* Bookmarks panel */}
      {showBookmarks && (
        <div className="medsight-glass p-3 rounded-lg mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Bookmarked Frames</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {bookmarkedFrames.map(bookmark => (
              <div
                key={bookmark.id}
                className={`flex items-center justify-between p-2 rounded border ${
                  selectedBookmark === bookmark.id 
                    ? 'border-medsight-primary bg-medsight-primary/10' 
                    : 'border-gray-200 hover:bg-gray-50'
                } cursor-pointer`}
                onClick={() => goToBookmark(bookmark)}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    bookmark.clinicalRelevance === 'critical' ? 'bg-red-500' :
                    bookmark.clinicalRelevance === 'abnormal' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`} />
                  <div>
                    <div className="text-xs font-medium">{bookmark.name}</div>
                    <div className="text-xs text-gray-600">Frame {bookmark.frame + 1}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToBookmark(bookmark);
                    }}
                    className="btn-medsight text-xs p-1"
                    title="Go to Frame"
                  >
                    <PlayCircleIcon className="w-3 h-3" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBookmark(bookmark.id);
                    }}
                    disabled={readOnly}
                    className="btn-medsight text-xs p-1 text-red-600"
                    title="Remove Bookmark"
                  >
                    <MinusIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
            
            {bookmarkedFrames.length === 0 && (
              <div className="text-xs text-gray-500 text-center py-4">
                No bookmarks yet. Click "Add" to bookmark the current frame.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sequence info panel */}
      {showSequenceInfo && (
        <div className="medsight-glass p-3 rounded-lg mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Sequence Information</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Total Frames:</span>
              <span className="ml-2 font-medium">{sequenceInfo.totalFrames}</span>
            </div>
            <div>
              <span className="text-gray-600">Frame Size:</span>
              <span className="ml-2 font-medium">{sequenceInfo.frameSize.width}×{sequenceInfo.frameSize.height}</span>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-2 font-medium">{formatTime(sequenceInfo.totalDuration)}</span>
            </div>
            <div>
              <span className="text-gray-600">Frame Time:</span>
              <span className="ml-2 font-medium">{sequenceInfo.frameTime.toFixed(1)}ms</span>
            </div>
            <div>
              <span className="text-gray-600">Pixel Spacing:</span>
              <span className="ml-2 font-medium">{sequenceInfo.pixelSpacing.x}×{sequenceInfo.pixelSpacing.y}mm</span>
            </div>
            <div>
              <span className="text-gray-600">Series:</span>
              <span className="ml-2 font-medium">{sequenceInfo.seriesDescription}</span>
            </div>
          </div>
        </div>
      )}

      {/* Playback settings panel */}
      {showPlaybackSettings && (
        <div className="medsight-glass p-3 rounded-lg mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Playback Settings</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Direction</label>
              <select
                value={playbackSettings.direction}
                onChange={(e) => setPlaybackSettings(prev => ({ 
                  ...prev, 
                  direction: e.target.value as PlaybackSettings['direction']
                }))}
                disabled={readOnly}
                className="input-medsight text-xs w-full"
              >
                <option value="forward">Forward</option>
                <option value="backward">Backward</option>
                <option value="bounce">Bounce</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Quality</label>
              <select
                value={playbackSettings.quality}
                onChange={(e) => setPlaybackSettings(prev => ({ 
                  ...prev, 
                  quality: e.target.value as PlaybackSettings['quality']
                }))}
                disabled={readOnly}
                className="input-medsight text-xs w-full"
              >
                <option value="draft">Draft (Faster)</option>
                <option value="standard">Standard</option>
                <option value="high">High Quality</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Skip Frames: {playbackSettings.skipFrames}
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={playbackSettings.skipFrames}
                onChange={(e) => setPlaybackSettings(prev => ({ 
                  ...prev, 
                  skipFrames: parseInt(e.target.value)
                }))}
                disabled={readOnly}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={playbackSettings.smoothPlayback}
                  onChange={(e) => setPlaybackSettings(prev => ({ 
                    ...prev, 
                    smoothPlayback: e.target.checked
                  }))}
                  disabled={readOnly}
                  className="rounded border-gray-300 text-medsight-primary"
                />
                <span className="text-xs text-gray-700">Smooth Playback</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Emergency mode indicator */}
      {emergencyMode && (
        <div className="bg-red-100 border border-red-500 text-red-700 px-3 py-1 rounded text-xs font-medium mb-2">
          <ExclamationTriangleIcon className="w-4 h-4 inline mr-1" />
          Emergency Mode Active
        </div>
      )}

      {/* Read-only indicator */}
      {readOnly && (
        <div className="bg-gray-100 border border-gray-400 text-gray-700 px-3 py-1 rounded text-xs">
          <EyeIcon className="w-4 h-4 inline mr-1" />
          Read Only Mode
        </div>
      )}
    </div>
  );
} 