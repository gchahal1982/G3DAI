/**
 * ModelManager.tsx - Model management UI for Aura
 * 
 * Comprehensive interface for managing all 7 local model families:
 * - Download/install buttons for each model variant
 * - Progress bars for downloads (2.2GB-35GB files)
 * - Storage usage visualization (up to 110GB+ total)
 * - Hardware compatibility warnings for VRAM requirements
 * - Model switching between 7 local models
 * - Cost comparison for cloud vs local models
 */

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography,
  Button,
  LinearProgress,
  Chip,
  Alert,
  Tabs,
  Tab,
  Box
} from '@mui/material';
import { 
  Download, 
  HardDrive, 
  Cpu, 
  MemoryStick,
  CheckCircle,
  Clock,
  Trash2,
  Settings,
  AlertTriangle,
  Cloud,
  Star,
  Calendar,
  X,
  Zap
} from 'lucide-react';
import { ModelDownloader, ModelVariant, DownloadProgress, LOCAL_MODELS } from '@/lib/models/ModelDownloader';
// Utility functions defined below

// Utility function
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatTime = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

// Custom TabPanel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: string;
  value: string;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface ModelManagerProps {
  downloader: ModelDownloader;
  onModelSelect?: (modelId: string) => void;
  selectedModelId?: string;
}

interface SystemInfo {
  totalRAM: number; // GB
  availableVRAM: number; // GB
  gpuModel: string;
  availableDiskSpace: number; // bytes
}

export const ModelManager: React.FC<ModelManagerProps> = ({ 
  downloader, 
  onModelSelect,
  selectedModelId 
}) => {
  const [downloadedModels, setDownloadedModels] = useState<ModelVariant[]>([]);
  const [downloadProgress, setDownloadProgress] = useState<Map<string, DownloadProgress>>(new Map());
  const [storageUsed, setStorageUsed] = useState<number>(0);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [activeTab, setActiveTab] = useState<string>('local');

  // Load system information
  useEffect(() => {
    loadSystemInfo();
  }, []);

  // Listen to download events
  useEffect(() => {
    const handleProgress = (modelId: string, progress: DownloadProgress) => {
      setDownloadProgress(prev => new Map(prev.set(modelId, progress)));
    };

    const handleCompleted = (modelId: string) => {
      refreshDownloadedModels();
    };

    const handleError = (modelId: string, error: any) => {
      console.error(`Download error for ${modelId}:`, error);
    };

    downloader.on('download:progress', handleProgress);
    downloader.on('download:completed', handleCompleted);
    downloader.on('download:error', handleError);
    downloader.on('model:deleted', refreshDownloadedModels);

    // Initial load
    refreshDownloadedModels();

    return () => {
      downloader.off('download:progress', handleProgress);
      downloader.off('download:completed', handleCompleted);
      downloader.off('download:error', handleError);
      downloader.off('model:deleted', refreshDownloadedModels);
    };
  }, [downloader]);

  const loadSystemInfo = async () => {
    // In a real implementation, this would detect actual system specs
    // For now, using mock data
    setSystemInfo({
      totalRAM: 32, // GB
      availableVRAM: 24, // GB
      gpuModel: 'RTX 4090',
      availableDiskSpace: 500 * 1024 * 1024 * 1024 // 500GB
    });
  };

  const refreshDownloadedModels = async () => {
    const downloaded = await downloader.getDownloadedModels();
    const storage = await downloader.getStorageUsed();
    setDownloadedModels(downloaded);
    setStorageUsed(storage);
  };

  const handleDownload = async (modelId: string) => {
    try {
      await downloader.queueDownload(modelId);
    } catch (error) {
      console.error('Failed to queue download:', error);
    }
  };

  const handleDelete = async (modelId: string) => {
    if (confirm(`Are you sure you want to delete this model? This will free up storage space.`)) {
      try {
        await downloader.deleteModel(modelId);
      } catch (error) {
        console.error('Failed to delete model:', error);
      }
    }
  };

  const handleCancel = async (modelId: string) => {
    try {
      await downloader.cancelDownload(modelId);
    } catch (error) {
      console.error('Failed to cancel download:', error);
    }
  };

  const getModelStatus = (model: ModelVariant): 'downloaded' | 'downloading' | 'available' | 'error' => {
    if (downloadedModels.some(m => m.id === model.id)) return 'downloaded';
    
    const progress = downloadProgress.get(model.id);
    if (progress) {
      if (progress.status === 'downloading' || progress.status === 'verifying') return 'downloading';
      if (progress.status === 'error') return 'error';
    }
    
    return 'available';
  };

  const canRunModel = (model: ModelVariant): boolean => {
    if (!systemInfo) return false;
    return systemInfo.availableVRAM >= model.vramRequired && 
           systemInfo.totalRAM >= model.systemRamRequired;
  };

  const getCompatibilityWarning = (model: ModelVariant): string | null => {
    if (!systemInfo) return null;
    
    if (systemInfo.availableVRAM < model.vramRequired) {
      return `Requires ${model.vramRequired}GB VRAM (you have ${systemInfo.availableVRAM}GB)`;
    }
    if (systemInfo.totalRAM < model.systemRamRequired) {
      return `Requires ${model.systemRamRequired}GB RAM (you have ${systemInfo.totalRAM}GB)`;
    }
    return null;
  };

  const getPriorityBadgeColor = (priority: string): string => {
    switch (priority) {
      case 'auto-install': return 'bg-green-500';
      case 'optional': return 'bg-blue-500';
      case 'workstation-only': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const ModelCard: React.FC<{ model: ModelVariant }> = ({ model }) => {
    const status = getModelStatus(model);
    const progress = downloadProgress.get(model.id);
    const compatible = canRunModel(model);
    const warning = getCompatibilityWarning(model);
    const isSelected = selectedModelId === model.id;

    return (
      <Card className={`mb-4 ${isSelected ? 'ring-2 ring-blue-500' : ''} ${!compatible ? 'opacity-75' : ''}`}>
        <CardContent>
          <div className="flex justify-between items-start">
            <div>
              <Typography variant="h6" component="div" className="flex items-center gap-2">
                {model.name}
                <Chip label={model.priority.replace('-', ' ').toUpperCase()} className={`text-xs ${getPriorityBadgeColor(model.priority)}`} />
                {status === 'downloaded' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </Typography>
              <Typography variant="body2" color="text.secondary" className="mt-1">{model.useCase}</Typography>
            </div>
            <div className="text-right">
              <Typography variant="body2" color="text.secondary">{model.parameters}</Typography>
              <Typography variant="body2" color="text.secondary">{formatBytes(model.downloadSize)}</Typography>
            </div>
          </div>
        </CardContent>

        <CardContent>
          {/* Hardware Requirements */}
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1">
                              <MemoryStick className="w-4 h-4" />
              <span>{model.vramRequired}GB VRAM</span>
            </div>
            <div className="flex items-center gap-1">
              <Cpu className="w-4 h-4" />
              <span>{model.systemRamRequired}GB RAM</span>
            </div>
          </div>

          {/* Compatibility Warning */}
          {warning && (
            <Alert className="mb-3">
              <AlertTriangle className="h-4 w-4" />
              <Typography variant="body2">{warning}</Typography>
            </Alert>
          )}

          {/* Download Progress */}
          {progress && status === 'downloading' && (
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>{progress.status === 'verifying' ? 'Verifying...' : 'Downloading...'}</span>
                <span>{Math.round(progress.percentage)}%</span>
              </div>
              <LinearProgress variant="determinate" value={progress.percentage} className="mb-2" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>
                  {formatBytes(progress.bytesDownloaded)} / {formatBytes(progress.totalBytes)}
                </span>
                <span>
                  {progress.speed > 0 && `${formatBytes(progress.speed)}/s • ${formatTime(progress.eta)} left`}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {status === 'available' && (
              <Button 
                onClick={() => handleDownload(model.id)}
                disabled={!compatible}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}

            {status === 'downloading' && (
              <Button 
                onClick={() => handleCancel(model.id)}
                variant="outlined"
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            )}

            {status === 'downloaded' && (
              <>
                <Button 
                  onClick={() => onModelSelect?.(model.id)}
                  variant={isSelected ? "contained" : "outlined"}
                  className="flex-1"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isSelected ? 'Selected' : 'Select'}
                </Button>
                <Button 
                  onClick={() => handleDelete(model.id)}
                  variant="outlined"
                  size="small"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}

            {status === 'error' && (
              <Button 
                onClick={() => handleDownload(model.id)}
                variant="outlined"
                className="flex-1"
              >
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const StorageOverview: React.FC = () => {
    const totalModelsSize = LOCAL_MODELS.reduce((sum, model) => sum + model.downloadSize, 0);
    const storagePercentage = systemInfo ? (storageUsed / systemInfo.availableDiskSpace) * 100 : 0;

    return (
      <Card className="mb-6">
        <CardContent>
          <div className="space-y-4">
            {/* Current Usage */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <Typography variant="body2">Models Downloaded</Typography>
                <Typography variant="body2">{formatBytes(storageUsed)} / {formatBytes(totalModelsSize)}</Typography>
              </div>
              <LinearProgress variant="determinate" value={(storageUsed / totalModelsSize) * 100} />
            </div>

            {/* Disk Space */}
            {systemInfo && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <Typography variant="body2">Disk Space Used</Typography>
                  <Typography variant="body2">{formatBytes(storageUsed)} / {formatBytes(systemInfo.availableDiskSpace)}</Typography>
                </div>
                <LinearProgress variant="determinate" value={storagePercentage} />
              </div>
            )}

            {/* Model Count */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Typography variant="h5" component="div" color="success.main">{downloadedModels.length}</Typography>
                <Typography variant="body2" color="text.secondary">Downloaded</Typography>
              </div>
              <div>
                <Typography variant="h5" component="div" color="info.main">
                  {Array.from(downloadProgress.values()).filter(p => p.status === 'downloading').length}
                </Typography>
                <Typography variant="body2" color="text.secondary">Downloading</Typography>
              </div>
              <div>
                <Typography variant="h5" component="div" color="text.secondary">{LOCAL_MODELS.length}</Typography>
                <Typography variant="body2" color="text.secondary">Available</Typography>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CloudModelComparison: React.FC = () => (
    <Card>
      <CardContent>
        <div className="space-y-4">
          {/* Kimi K2 */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <Typography variant="subtitle1" component="h4">Kimi K2 (Agentic)</Typography>
                <Typography variant="body2" color="text.secondary">1T parameters, tool use & autonomous workflows</Typography>
              </div>
              <Chip label="Cloud API" variant="outlined" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Typography variant="body2" color="text.secondary">Performance:</Typography> 65.8% SWE-bench
              </div>
              <div>
                <Typography variant="body2" color="text.secondary">Cost:</Typography> $0.60/$2.50 per M tokens
              </div>
            </div>
          </div>

          {/* DeepSeek R1 */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <Typography variant="subtitle1" component="h4">DeepSeek R1 (Reasoning)</Typography>
                <Typography variant="body2" color="text.secondary">671B parameters, complex reasoning</Typography>
              </div>
              <Chip label="Cloud API" variant="outlined" />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Typography variant="body2" color="text.secondary">Context:</Typography> Up to 128K tokens
              </div>
              <div>
                <Typography variant="body2" color="text.secondary">Cost:</Typography> $0.27/$1.10 per M tokens
              </div>
            </div>
          </div>

          <Alert severity="info">
            <Typography variant="body2">
              Cloud models are included in your Aura subscription. No additional API keys required.
            </Typography>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <div className="mb-6">
        <Typography variant="h4" component="h1" className="mb-2">Model Management</Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your local AI models and configure cloud API access
        </Typography>
      </div>

      <StorageOverview />

      <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Local Models (7)" />
          <Tab label="Cloud APIs (2)" />
          <Tab label="BYO-Key (Optional)" />
        </Box>

        <CustomTabPanel value="local" index="local">
          <div className="grid gap-4">
            {/* Auto-install Models */}
            <div>
              <Typography variant="h6" component="h3" className="mb-3 text-green-700">
                Auto-Install Models (Bundled)
              </Typography>
              {LOCAL_MODELS.filter(m => m.priority === 'auto-install').map(model => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>

            {/* Optional Models */}
            <div>
              <Typography variant="h6" component="h3" className="mb-3 text-blue-700">
                Optional Models (On-Demand)
              </Typography>
              {LOCAL_MODELS.filter(m => m.priority === 'optional').map(model => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>

            {/* Workstation Models */}
            <div>
              <Typography variant="h6" component="h3" className="mb-3 text-purple-700">
                Workstation Models (High-End Hardware)
              </Typography>
              {LOCAL_MODELS.filter(m => m.priority === 'workstation-only').map(model => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          </div>
        </CustomTabPanel>

        <CustomTabPanel value="cloud" index="cloud">
          <CloudModelComparison />
        </CustomTabPanel>

        <CustomTabPanel value="byo" index="byo">
          <Card>
            <CardContent>
              <Alert severity="info">
                <Typography variant="body2">
                  BYO-Key configuration for additional providers (OpenAI, Anthropic, Google, xAI) 
                  will be available in the Settings panel. Aura provides managed cloud APIs 
                  for Kimi K2 and DeepSeek R1 without requiring your own keys.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </CustomTabPanel>
      </Tabs>
    </Box>
  );
};

export default ModelManager; 