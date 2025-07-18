/**
 * ModelManager.tsx - Model management UI for CodeForge
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  Trash2, 
  HardDrive, 
  Cpu, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Pause,
  Play,
  X,
  Cloud,
  Monitor,
  Zap
} from 'lucide-react';
import { ModelDownloader, ModelVariant, DownloadProgress, LOCAL_MODELS } from '@/lib/models/ModelDownloader';
import { formatBytes, formatTime } from '@/lib/utils';

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
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {model.name}
                <Badge className={`text-xs ${getPriorityBadgeColor(model.priority)}`}>
                  {model.priority.replace('-', ' ').toUpperCase()}
                </Badge>
                {status === 'downloaded' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">{model.useCase}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{model.parameters}</div>
              <div className="text-xs text-gray-500">{formatBytes(model.downloadSize)}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Hardware Requirements */}
          <div className="flex items-center gap-4 mb-3 text-sm">
            <div className="flex items-center gap-1">
              <Monitor className="w-4 h-4" />
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
              <AlertDescription className="text-sm">
                {warning}
              </AlertDescription>
            </Alert>
          )}

          {/* Download Progress */}
          {progress && status === 'downloading' && (
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>{progress.status === 'verifying' ? 'Verifying...' : 'Downloading...'}</span>
                <span>{Math.round(progress.percentage)}%</span>
              </div>
              <Progress value={progress.percentage} className="mb-2" />
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
                variant="outline"
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
                  variant={isSelected ? "default" : "outline"}
                  className="flex-1"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {isSelected ? 'Selected' : 'Select'}
                </Button>
                <Button 
                  onClick={() => handleDelete(model.id)}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}

            {status === 'error' && (
              <Button 
                onClick={() => handleDownload(model.id)}
                variant="outline"
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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Current Usage */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Models Downloaded</span>
                <span>{formatBytes(storageUsed)} / {formatBytes(totalModelsSize)}</span>
              </div>
              <Progress value={(storageUsed / totalModelsSize) * 100} />
            </div>

            {/* Disk Space */}
            {systemInfo && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Disk Space Used</span>
                  <span>{formatBytes(storageUsed)} / {formatBytes(systemInfo.availableDiskSpace)}</span>
                </div>
                <Progress value={storagePercentage} />
              </div>
            )}

            {/* Model Count */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{downloadedModels.length}</div>
                <div className="text-xs text-gray-500">Downloaded</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {Array.from(downloadProgress.values()).filter(p => p.status === 'downloading').length}
                </div>
                <div className="text-xs text-gray-500">Downloading</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-600">{LOCAL_MODELS.length}</div>
                <div className="text-xs text-gray-500">Available</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const CloudModelComparison: React.FC = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Cloud APIs (CodeForge Managed)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Kimi K2 */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">Kimi K2 (Agentic)</h4>
                <p className="text-sm text-gray-600">1T parameters, tool use & autonomous workflows</p>
              </div>
              <Badge variant="outline">Cloud API</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Performance:</span> 65.8% SWE-bench
              </div>
              <div>
                <span className="text-gray-500">Cost:</span> $0.60/$2.50 per M tokens
              </div>
            </div>
          </div>

          {/* DeepSeek R1 */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-medium">DeepSeek R1 (Reasoning)</h4>
                <p className="text-sm text-gray-600">671B parameters, complex reasoning</p>
              </div>
              <Badge variant="outline">Cloud API</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Context:</span> Up to 128K tokens
              </div>
              <div>
                <span className="text-gray-500">Cost:</span> $0.27/$1.10 per M tokens
              </div>
            </div>
          </div>

          <Alert>
            <AlertDescription className="text-sm">
              Cloud models are included in your CodeForge subscription. No additional API keys required.
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Model Management</h1>
        <p className="text-gray-600">
          Manage your local AI models and configure cloud API access
        </p>
      </div>

      <StorageOverview />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="local">Local Models (7)</TabsTrigger>
          <TabsTrigger value="cloud">Cloud APIs (2)</TabsTrigger>
          <TabsTrigger value="byo">BYO-Key (Optional)</TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="mt-6">
          <div className="grid gap-4">
            {/* Auto-install Models */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-700">
                Auto-Install Models (Bundled)
              </h3>
              {LOCAL_MODELS.filter(m => m.priority === 'auto-install').map(model => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>

            {/* Optional Models */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-blue-700">
                Optional Models (On-Demand)
              </h3>
              {LOCAL_MODELS.filter(m => m.priority === 'optional').map(model => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>

            {/* Workstation Models */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-purple-700">
                Workstation Models (High-End Hardware)
              </h3>
              {LOCAL_MODELS.filter(m => m.priority === 'workstation-only').map(model => (
                <ModelCard key={model.id} model={model} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cloud" className="mt-6">
          <CloudModelComparison />
        </TabsContent>

        <TabsContent value="byo" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Bring Your Own Keys (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertDescription>
                  BYO-Key configuration for additional providers (OpenAI, Anthropic, Google, xAI) 
                  will be available in the Settings panel. CodeForge provides managed cloud APIs 
                  for Kimi K2 and DeepSeek R1 without requiring your own keys.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModelManager; 