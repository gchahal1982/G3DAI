import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Toolbar,
  IconButton,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Typography,
  Chip,
  Badge,
  Tooltip,
  Popover,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  LinearProgress,
  Menu,
  Divider,
  Alert
} from '@mui/material';
import {
  Psychology as AIIcon,
  Tune as TuneIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  CloudQueue as CloudIcon,
  Computer as LocalIcon,
  FilterList as FilterIcon,
  Help as HelpIcon,
  Settings as SettingsIcon,
  Bolt as PerformanceIcon,
  Code as CodeIcon,
  BugReport as DebugIcon,
  Security as SecurityIcon,
  Description as DocIcon,
  Close as CloseIcon,
  ExpandMore as ExpandIcon,
  Keyboard as ShortcutIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

// Types and interfaces
interface AIModel {
  id: string;
  name: string;
  provider: 'local' | 'openai' | 'anthropic' | 'google' | 'deepseek' | 'qwen' | 'llama';
  contextWindow: number;
  costPerToken?: number;
  latency: number;
  capabilities: ('completion' | 'chat' | 'refactor' | 'multimodal')[];
  status: 'available' | 'loading' | 'error' | 'offline';
  size?: string;
  quantization?: string;
}

interface AIMode {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  defaultTemperature: number;
  maxTokens: number;
  suggestedModels: string[];
}

interface PerformanceMetrics {
  latency: number;
  tokensPerSecond: number;
  memoryUsage: number;
  cpuUsage: number;
  gpuUsage?: number;
  cacheHitRate: number;
  requestsPerMinute: number;
  costPerHour: number;
}

interface SuggestionFilter {
  type: 'completion' | 'refactor' | 'test' | 'doc' | 'security';
  enabled: boolean;
  threshold: number;
}

// Styled components
const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`,
  backdropFilter: 'blur(10px)',
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  padding: theme.spacing(0, 2),
  minHeight: '56px !important',
  gap: theme.spacing(1),
  flexWrap: 'wrap',
  '& .MuiFormControl-root': {
    minWidth: 120,
  },
  '& .MuiSelect-select': {
    fontSize: '0.875rem',
  }
}));

const PerformanceChip = styled(Chip)<{ status: 'good' | 'warning' | 'error' }>(({ theme, status }) => ({
  backgroundColor: alpha(
    status === 'good' ? theme.palette.success.main :
    status === 'warning' ? theme.palette.warning.main :
    theme.palette.error.main,
    0.1
  ),
  color: status === 'good' ? theme.palette.success.main :
         status === 'warning' ? theme.palette.warning.main :
         theme.palette.error.main,
  border: `1px solid ${alpha(
    status === 'good' ? theme.palette.success.main :
    status === 'warning' ? theme.palette.warning.main :
    theme.palette.error.main,
    0.3
  )}`,
  '& .MuiChip-icon': {
    color: 'inherit'
  }
}));

const QuickActionButton = styled(IconButton)(({ theme }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
  '&.active': {
    backgroundColor: alpha(theme.palette.primary.main, 0.3),
    color: theme.palette.primary.main,
  }
}));

// Props interface
interface EditorToolbarProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  selectedMode: string;
  onModeChange: (modeId: string) => void;
  temperature: number;
  onTemperatureChange: (temp: number) => void;
  contextLimit: number;
  onContextLimitChange: (limit: number) => void;
  filters: SuggestionFilter[];
  onFiltersChange: (filters: SuggestionFilter[]) => void;
  metrics: PerformanceMetrics;
  onShowShortcuts: () => void;
  onOpenSettings: () => void;
  models: AIModel[];
  isProcessing?: boolean;
  cloudBurstEnabled?: boolean;
  onCloudBurstToggle?: (enabled: boolean) => void;
}

// Task 1: Create AI mode selector
export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  selectedModel,
  onModelChange,
  selectedMode,
  onModeChange,
  temperature,
  onTemperatureChange,
  contextLimit,
  onContextLimitChange,
  filters,
  onFiltersChange,
  metrics,
  onShowShortcuts,
  onOpenSettings,
  models,
  isProcessing = false,
  cloudBurstEnabled = false,
  onCloudBurstToggle
}) => {
  const [temperatureAnchor, setTemperatureAnchor] = useState<HTMLElement | null>(null);
  const [filtersAnchor, setFiltersAnchor] = useState<HTMLElement | null>(null);
  const [metricsAnchor, setMetricsAnchor] = useState<HTMLElement | null>(null);
  const [contextAnchor, setContextAnchor] = useState<HTMLElement | null>(null);

  // Task 1: Define AI modes
  const aiModes: AIMode[] = useMemo(() => [
    {
      id: 'completion',
      name: 'Auto-Complete',
      description: 'Real-time code completion and suggestions',
      icon: <CodeIcon />,
      defaultTemperature: 0.1,
      maxTokens: 256,
      suggestedModels: ['qwen3-coder-14b', 'phi-4-mini', 'gemma-3-12b']
    },
    {
      id: 'refactor',
      name: 'Refactor',
      description: 'Code optimization and restructuring',
      icon: <TuneIcon />,
      defaultTemperature: 0.3,
      maxTokens: 1024,
      suggestedModels: ['deepseek-r1', 'kimi-k2', 'qwen3-coder-32b']
    },
    {
      id: 'debug',
      name: 'Debug',
      description: 'Bug detection and fixing assistance',
      icon: <DebugIcon />,
      defaultTemperature: 0.2,
      maxTokens: 512,
      suggestedModels: ['deepseek-r1', 'qwen3-coder-14b', 'phi-4-mini']
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Security vulnerability analysis',
      icon: <SecurityIcon />,
      defaultTemperature: 0.0,
      maxTokens: 512,
      suggestedModels: ['deepseek-r1', 'kimi-k2', 'starcoder2-15b']
    },
    {
      id: 'documentation',
      name: 'Docs',
      description: 'Documentation and comment generation',
      icon: <DocIcon />,
      defaultTemperature: 0.4,
      maxTokens: 1024,
      suggestedModels: ['qwen3-coder-14b', 'gemma-3-12b', 'llama-3.3-70b']
    }
  ], []);

  // Get current model info
  const currentModel = useMemo(() => 
    models.find(m => m.id === selectedModel),
    [models, selectedModel]
  );

  const currentMode = useMemo(() => 
    aiModes.find(m => m.id === selectedMode),
    [aiModes, selectedMode]
  );

  // Task 6: Performance metrics display
  const getPerformanceStatus = useCallback((value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.warning) return 'warning';
    return 'error';
  }, []);

  const formatLatency = useCallback((latency: number) => {
    if (latency < 1000) return `${Math.round(latency)}ms`;
    return `${(latency / 1000).toFixed(1)}s`;
  }, []);

  const formatMemory = useCallback((bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb < 1) return `${Math.round(gb * 1024)}MB`;
    return `${gb.toFixed(1)}GB`;
  }, []);

  // Task 3: Temperature controls
  const handleTemperatureClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setTemperatureAnchor(event.currentTarget);
  }, []);

  const handleTemperatureClose = useCallback(() => {
    setTemperatureAnchor(null);
  }, []);

  // Task 4: Context limit indicator  
  const handleContextClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setContextAnchor(event.currentTarget);
  }, []);

  const handleContextClose = useCallback(() => {
    setContextAnchor(null);
  }, []);

  // Task 5: Suggestion filters
  const handleFiltersClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setFiltersAnchor(event.currentTarget);
  }, []);

  const handleFiltersClose = useCallback(() => {
    setFiltersAnchor(null);
  }, []);

  const handleFilterToggle = useCallback((type: SuggestionFilter['type']) => {
    const newFilters = filters.map(filter => 
      filter.type === type 
        ? { ...filter, enabled: !filter.enabled }
        : filter
    );
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  // Task 6: Performance metrics
  const handleMetricsClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setMetricsAnchor(event.currentTarget);
  }, []);

  const handleMetricsClose = useCallback(() => {
    setMetricsAnchor(null);
  }, []);

  // Task 7: Quick actions
  const quickActions = useMemo(() => [
    {
      id: 'explain',
      icon: <HelpIcon />,
      tooltip: 'Explain Code (Cmd+E)',
      onClick: () => console.log('Explain code')
    },
    {
      id: 'optimize',
      icon: <PerformanceIcon />,
      tooltip: 'Optimize Code (Cmd+Shift+O)',
      onClick: () => console.log('Optimize code')
    },
    {
      id: 'test',
      icon: <DebugIcon />,
      tooltip: 'Generate Tests (Cmd+T)',
      onClick: () => console.log('Generate tests')
    },
    {
      id: 'doc',
      icon: <DocIcon />,
      tooltip: 'Add Documentation (Cmd+D)',
      onClick: () => console.log('Add documentation')
    }
  ], []);

  return (
    <StyledToolbar>
      {/* Task 1: AI Mode Selector */}
      <FormControl size="small" sx={{ minWidth: 140 }}>
        <InputLabel>AI Mode</InputLabel>
        <Select
          value={selectedMode}
          onChange={(e) => onModeChange(e.target.value)}
          label="AI Mode"
          disabled={isProcessing}
        >
          {aiModes.map((mode) => (
            <MenuItem key={mode.id} value={mode.id}>
              <Box display="flex" alignItems="center" gap={1}>
                {mode.icon}
                <Box>
                  <Typography variant="body2">{mode.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {mode.description}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Task 2: Model Selection Dropdown */}
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Model</InputLabel>
        <Select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          label="Model"
          disabled={isProcessing}
          renderValue={(value) => {
            const model = models.find(m => m.id === value);
            return (
              <Box display="flex" alignItems="center" gap={1}>
                {model?.provider === 'local' ? <LocalIcon fontSize="small" /> : <CloudIcon fontSize="small" />}
                <Typography variant="body2">{model?.name}</Typography>
                {model?.status === 'loading' && <LinearProgress sx={{ width: 20, height: 2 }} />}
              </Box>
            );
          }}
        >
          {models.map((model) => (
            <MenuItem key={model.id} value={model.id} disabled={model.status === 'error'}>
              <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
                <Box display="flex" alignItems="center" gap={1}>
                  {model.provider === 'local' ? <LocalIcon fontSize="small" /> : <CloudIcon fontSize="small" />}
                  <Box>
                    <Typography variant="body2">{model.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {model.contextWindow.toLocaleString()} tokens • {formatLatency(model.latency)}
                      {model.size && ` • ${model.size}`}
                    </Typography>
                  </Box>
                </Box>
                <Chip 
                  size="small" 
                  label={model.status} 
                  color={model.status === 'available' ? 'success' : 'default'}
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Divider orientation="vertical" flexItem />

      {/* Task 3: Temperature Controls */}
      <Tooltip title={`Temperature: ${temperature.toFixed(1)} (creativity level)`}>
        <Button
          size="small"
          startIcon={<TuneIcon />}
          onClick={handleTemperatureClick}
          variant="outlined"
          disabled={isProcessing}
        >
          Temp: {temperature.toFixed(1)}
        </Button>
      </Tooltip>

      <Popover
        open={Boolean(temperatureAnchor)}
        anchorEl={temperatureAnchor}
        onClose={handleTemperatureClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Paper sx={{ p: 3, width: 280 }}>
          <Typography variant="subtitle2" gutterBottom>
            Temperature Control
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            Controls creativity: 0.0 = deterministic, 1.0 = creative
          </Typography>
          <Slider
            value={temperature}
            onChange={(_, value) => onTemperatureChange(value as number)}
            min={0.0}
            max={1.0}
            step={0.1}
            marks={[
              { value: 0.0, label: 'Precise' },
              { value: 0.5, label: 'Balanced' },
              { value: 1.0, label: 'Creative' }
            ]}
            valueLabelDisplay="auto"
          />
        </Paper>
      </Popover>

      {/* Task 4: Context Limit Indicator */}
      <Tooltip title={`Context limit: ${contextLimit.toLocaleString()} tokens`}>
        <Button
          size="small"
          startIcon={<MemoryIcon />}
          onClick={handleContextClick}
          variant="outlined"
          disabled={isProcessing}
        >
          {(contextLimit / 1000).toFixed(0)}k
        </Button>
      </Tooltip>

      <Popover
        open={Boolean(contextAnchor)}
        anchorEl={contextAnchor}
        onClose={handleContextClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Paper sx={{ p: 3, width: 300 }}>
          <Typography variant="subtitle2" gutterBottom>
            Context Window
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" mb={2}>
            Maximum tokens to include in AI requests
          </Typography>
          <Slider
            value={contextLimit}
            onChange={(_, value) => onContextLimitChange(value as number)}
            min={1000}
            max={currentModel?.contextWindow || 128000}
            step={1000}
            marks={[
              { value: 4000, label: '4k' },
              { value: 16000, label: '16k' },
              { value: 128000, label: '128k' }
            ]}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Typography variant="caption" color="text.secondary" mt={1}>
            Model max: {((currentModel?.contextWindow || 0) / 1000).toFixed(0)}k tokens
          </Typography>
        </Paper>
      </Popover>

      {/* Task 5: Suggestion Filters */}
      <Tooltip title="Configure suggestion filters">
        <Button
          size="small"
          startIcon={<FilterIcon />}
          onClick={handleFiltersClick}
          variant="outlined"
          disabled={isProcessing}
        >
          Filters ({filters.filter(f => f.enabled).length})
        </Button>
      </Tooltip>

      <Popover
        open={Boolean(filtersAnchor)}
        anchorEl={filtersAnchor}
        onClose={handleFiltersClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Paper sx={{ p: 2, width: 320 }}>
          <Typography variant="subtitle2" gutterBottom>
            Suggestion Filters
          </Typography>
          <Stack spacing={1}>
            {filters.map((filter) => (
              <FormControlLabel
                key={filter.type}
                control={
                  <Switch
                    checked={filter.enabled}
                    onChange={() => handleFilterToggle(filter.type)}
                    size="small"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" textTransform="capitalize">
                      {filter.type} Suggestions
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Threshold: {Math.round(filter.threshold * 100)}%
                    </Typography>
                  </Box>
                }
              />
            ))}
          </Stack>
        </Paper>
      </Popover>

      <Divider orientation="vertical" flexItem />

      {/* Task 6: Performance Metrics Display */}
      <PerformanceChip
        icon={<SpeedIcon />}
        label={formatLatency(metrics.latency)}
        size="small"
        status={getPerformanceStatus(metrics.latency, { good: 100, warning: 500 })}
        onClick={handleMetricsClick}
        clickable
      />

      <PerformanceChip
        icon={<MemoryIcon />}
        label={formatMemory(metrics.memoryUsage)}
        size="small"
        status={getPerformanceStatus(metrics.memoryUsage / (1024**3), { good: 2, warning: 4 })}
        onClick={handleMetricsClick}
        clickable
      />

      <PerformanceChip
        icon={<PerformanceIcon />}
        label={`${metrics.tokensPerSecond.toFixed(0)} t/s`}
        size="small"
        status={getPerformanceStatus(100 - metrics.tokensPerSecond, { good: 80, warning: 50 })}
        onClick={handleMetricsClick}
        clickable
      />

      <Popover
        open={Boolean(metricsAnchor)}
        anchorEl={metricsAnchor}
        onClose={handleMetricsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Paper sx={{ p: 3, width: 350 }}>
          <Typography variant="subtitle2" gutterBottom>
            Performance Metrics
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Response Latency
              </Typography>
              <Typography variant="h6">
                {formatLatency(metrics.latency)}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={Math.min(100, (1000 - metrics.latency) / 10)} 
                sx={{ mt: 0.5 }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Throughput
              </Typography>
              <Typography variant="h6">
                {metrics.tokensPerSecond.toFixed(1)} tokens/sec
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Memory Usage
              </Typography>
              <Typography variant="h6">
                {formatMemory(metrics.memoryUsage)}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Cache Hit Rate
              </Typography>
              <Typography variant="h6">
                {Math.round(metrics.cacheHitRate * 100)}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Cost per Hour
              </Typography>
              <Typography variant="h6">
                ${metrics.costPerHour.toFixed(3)}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Popover>

      <Box flex={1} />

      {/* Cloud Burst Toggle */}
      {onCloudBurstToggle && (
        <Tooltip title="Enable cloud burst for complex requests">
          <FormControlLabel
            control={
              <Switch
                checked={cloudBurstEnabled}
                onChange={(e) => onCloudBurstToggle(e.target.checked)}
                size="small"
              />
            }
            label={
              <Box display="flex" alignItems="center" gap={0.5}>
                <CloudIcon fontSize="small" />
                <Typography variant="caption">Cloud Burst</Typography>
              </Box>
            }
          />
        </Tooltip>
      )}

      {/* Task 7: Quick Actions */}
      <Box display="flex" gap={0.5}>
        {quickActions.map((action) => (
          <Tooltip key={action.id} title={action.tooltip}>
            <QuickActionButton
              size="small"
              onClick={action.onClick}
              disabled={isProcessing}
            >
              {action.icon}
            </QuickActionButton>
          </Tooltip>
        ))}
      </Box>

      {/* Task 8: Keyboard Shortcuts & Settings */}
      <Tooltip title="Keyboard shortcuts">
        <IconButton size="small" onClick={onShowShortcuts} disabled={isProcessing}>
          <ShortcutIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Settings">
        <IconButton size="small" onClick={onOpenSettings} disabled={isProcessing}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      {/* Processing indicator */}
      {isProcessing && (
        <Badge color="primary" variant="dot">
          <AIIcon sx={{ color: 'primary.main', animation: 'pulse 2s infinite' }} />
        </Badge>
      )}
    </StyledToolbar>
  );
};

export default EditorToolbar; 