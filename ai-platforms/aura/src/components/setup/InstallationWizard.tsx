/**
 * InstallationWizard - Aura Setup Flow
 * 
 * Comprehensive installation wizard for optimal user onboarding:
 * - Hardware detection and recommendation UI
 * - Interactive model bundle selection interface
 * - Real-time download progress visualization
 * - Storage space allocation interface with usage preview
 * - Installation preferences configuration
 * - Optional model selection with detailed descriptions
 * - Installation verification and testing system
 * - Integrated getting started tutorial
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Grid,
  FormControl,
  FormControlLabel,
  FormGroup,
  Switch,
  Slider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Computer,
  Download,
  Storage,
  Settings,
  CheckCircle,
  Warning,
  Info,
  ExpandMore,
  Memory,
  Speed,
  Security,
} from '@mui/icons-material';

// Types
interface HardwareProfile {
  gpu: { name: string; vramGB: number; vendor: string };
  cpu: { name: string; cores: number; vendor: string };
  memory: { totalGB: number; availableGB: number };
  storage: { availableGB: number; type: string };
  tier: 'basic' | 'standard' | 'enthusiast' | 'workstation';
  score: number;
}

interface ModelBundle {
  tier: string;
  name: string;
  description: string;
  sizeGB: number;
  models: Array<{
    id: string;
    name: string;
    sizeGB: number;
    capabilities: string[];
    performance: string;
  }>;
  requirements: {
    minVRAMGB: number;
    minRAMGB: number;
    minStorageGB: number;
  };
}

interface InstallationPreferences {
  autoUpdate: boolean;
  backgroundDownload: boolean;
  telemetryEnabled: boolean;
  storageLocation: string;
  maxBandwidthMBps: number;
  scheduleDownloads: boolean;
  scheduleStart: number;
  scheduleEnd: number;
}

const InstallationWizard: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [hardwareProfile, setHardwareProfile] = useState<HardwareProfile | null>(null);
  const [selectedBundle, setSelectedBundle] = useState<ModelBundle | null>(null);
  const [optionalModels, setOptionalModels] = useState<Set<string>>(new Set());
  const [preferences, setPreferences] = useState<InstallationPreferences>({
    autoUpdate: true,
    backgroundDownload: true,
    telemetryEnabled: true,
    storageLocation: '',
    maxBandwidthMBps: 0, // 0 = unlimited
    scheduleDownloads: false,
    scheduleStart: 22,
    scheduleEnd: 6,
  });
  const [downloadProgress, setDownloadProgress] = useState<Map<string, number>>(new Map());
  const [isInstalling, setIsInstalling] = useState(false);
  const [installationComplete, setInstallationComplete] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  // Mock data
  const availableBundles: ModelBundle[] = [
    {
      tier: 'basic',
      name: 'Starter Bundle',
      description: 'Essential models for basic coding assistance',
      sizeGB: 5.0,
      models: [
        {
          id: 'qwen-3-coder-4b',
          name: 'Qwen 3 Coder 4B',
          sizeGB: 2.2,
          capabilities: ['Code Completion', 'Simple Refactoring'],
          performance: 'Fast',
        },
        {
          id: 'phi-4-mini',
          name: 'Phi 4 Mini',
          sizeGB: 1.8,
          capabilities: ['Function Calling', 'Agentic Tasks'],
          performance: 'Very Fast',
        },
      ],
      requirements: { minVRAMGB: 4, minRAMGB: 8, minStorageGB: 10 },
    },
    {
      tier: 'standard',
      name: 'Standard Bundle',
      description: 'Balanced performance and capability',
      sizeGB: 12.0,
      models: [
        {
          id: 'qwen-3-coder-8b',
          name: 'Qwen 3 Coder 8B',
          sizeGB: 4.5,
          capabilities: ['Advanced Completion', 'Refactoring', 'Documentation'],
          performance: 'Good',
        },
        {
          id: 'starcoder2-7b',
          name: 'StarCoder2 7B',
          sizeGB: 3.8,
          capabilities: ['Polyglot Programming', 'Code Search'],
          performance: 'Good',
        },
      ],
      requirements: { minVRAMGB: 8, minRAMGB: 16, minStorageGB: 25 },
    },
    {
      tier: 'enthusiast',
      name: 'Enthusiast Bundle',
      description: 'High-quality models for advanced users',
      sizeGB: 35.0,
      models: [
        {
          id: 'qwen-3-coder-14b',
          name: 'Qwen 3 Coder 14B',
          sizeGB: 8.0,
          capabilities: ['Expert Completion', 'Architecture', 'Testing'],
          performance: 'Excellent',
        },
        {
          id: 'mistral-codestral-22b',
          name: 'Mistral Codestral 22B',
          sizeGB: 12.0,
          capabilities: ['Advanced Architecture', 'Optimization'],
          performance: 'Excellent',
        },
      ],
      requirements: { minVRAMGB: 16, minRAMGB: 32, minStorageGB: 50 },
    },
  ];

  const optionalModelsList = [
    {
      id: 'llama-3.3-70b',
      name: 'Llama 3.3 70B',
      sizeGB: 35.0,
      description: 'Advanced reasoning and complex refactoring',
      requirements: { minVRAMGB: 24, minRAMGB: 64 },
    },
    {
      id: 'deepseek-coder-v2-lite',
      name: 'DeepSeek Coder V2 Lite',
      sizeGB: 8.5,
      description: 'Fast inference with MoE architecture',
      requirements: { minVRAMGB: 6, minRAMGB: 12 },
    },
  ];

  // Hardware detection simulation
  useEffect(() => {
    const detectHardware = async () => {
      // Simulate hardware detection
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setHardwareProfile({
        gpu: { name: 'NVIDIA RTX 4070', vramGB: 12, vendor: 'NVIDIA' },
        cpu: { name: 'Intel i7-12700K', cores: 12, vendor: 'Intel' },
        memory: { totalGB: 32, availableGB: 24 },
        storage: { availableGB: 500, type: 'NVMe SSD' },
        tier: 'enthusiast',
        score: 85,
      });
    };

    if (activeStep === 0) {
      detectHardware();
    }
  }, [activeStep]);

  // Auto-select recommended bundle
  useEffect(() => {
    if (hardwareProfile && !selectedBundle) {
      const recommendedBundle = availableBundles.find(bundle => bundle.tier === hardwareProfile.tier);
      if (recommendedBundle) {
        setSelectedBundle(recommendedBundle);
      }
    }
  }, [hardwareProfile, selectedBundle]);

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleBundleSelect = (bundle: ModelBundle) => {
    setSelectedBundle(bundle);
  };

  const handleOptionalModelToggle = (modelId: string) => {
    const newOptionalModels = new Set(optionalModels);
    if (newOptionalModels.has(modelId)) {
      newOptionalModels.delete(modelId);
    } else {
      newOptionalModels.add(modelId);
    }
    setOptionalModels(newOptionalModels);
  };

  const handleStartInstallation = async () => {
    setIsInstalling(true);
    setActiveStep(4); // Progress step

    // Simulate download progress
    const allModels = [
      ...(selectedBundle?.models || []),
      ...optionalModelsList.filter(model => optionalModels.has(model.id)),
    ];

    for (const model of allModels) {
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setDownloadProgress(prev => new Map(prev.set(model.id, progress)));
      }
    }

    setInstallationComplete(true);
    setIsInstalling(false);
    setActiveStep(5); // Completion step
  };

  const steps = [
    {
      label: 'Hardware Detection',
      description: 'Analyzing your system capabilities',
      icon: <Computer />,
    },
    {
      label: 'Bundle Selection',
      description: 'Choose your model bundle',
      icon: <Download />,
    },
    {
      label: 'Optional Models',
      description: 'Select additional models',
      icon: <Settings />,
    },
    {
      label: 'Preferences',
      description: 'Configure installation settings',
      icon: <Storage />,
    },
    {
      label: 'Installation',
      description: 'Downloading and installing models',
      icon: <Download />,
    },
    {
      label: 'Complete',
      description: 'Setup complete and ready to use',
      icon: <CheckCircle />,
    },
  ];

  const renderHardwareDetection = () => (
    <Box>
      {!hardwareProfile ? (
        <Box display="flex" flexDirection="column" alignItems="center" py={4}>
          <LinearProgress sx={{ width: '100%', mb: 2 }} />
          <Typography>Detecting hardware capabilities...</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ width: '100%' }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              Hardware detection complete! Your system is classified as <strong>{hardwareProfile.tier}</strong> tier.
            </Alert>
          </Box>
          
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Computer sx={{ mr: 1 }} />
                  <Typography variant="h6">Graphics Card</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {hardwareProfile.gpu.name}
                </Typography>
                <Typography variant="body2">
                  VRAM: {hardwareProfile.gpu.vramGB}GB
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Speed sx={{ mr: 1 }} />
                  <Typography variant="h6">Processor</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {hardwareProfile.cpu.name}
                </Typography>
                <Typography variant="body2">
                  Cores: {hardwareProfile.cpu.cores}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Memory sx={{ mr: 1 }} />
                  <Typography variant="h6">Memory</Typography>
                </Box>
                <Typography variant="body2">
                  Total: {hardwareProfile.memory.totalGB}GB
                </Typography>
                <Typography variant="body2">
                  Available: {hardwareProfile.memory.availableGB}GB
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Storage sx={{ mr: 1 }} />
                  <Typography variant="h6">Storage</Typography>
                </Box>
                <Typography variant="body2">
                  Available: {hardwareProfile.storage.availableGB}GB
                </Typography>
                <Typography variant="body2">
                  Type: {hardwareProfile.storage.type}
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box sx={{ width: '100%' }}>
            <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Performance Score: {hardwareProfile.score}/100
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={hardwareProfile.score} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white',
                    }
                  }} 
                />
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}
    </Box>
  );

  const renderBundleSelection = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {availableBundles.map((bundle) => (
        <Box key={bundle.tier} sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(33.33% - 16px)' }, minWidth: 0 }}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              border: selectedBundle?.tier === bundle.tier ? 2 : 1,
              borderColor: selectedBundle?.tier === bundle.tier ? 'primary.main' : 'divider',
              position: 'relative',
            }}
            onClick={() => handleBundleSelect(bundle)}
          >
            {hardwareProfile?.tier === bundle.tier && (
              <Chip
                label="Recommended"
                color="primary"
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8 }}
              />
            )}
            
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {bundle.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {bundle.description}
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2">
                  Total Size: <strong>{bundle.sizeGB}GB</strong>
                </Typography>
                <Typography variant="body2">
                  Models: <strong>{bundle.models.length}</strong>
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Requirements:
                </Typography>
                <Typography variant="caption" display="block">
                  VRAM: {bundle.requirements.minVRAMGB}GB
                </Typography>
                <Typography variant="caption" display="block">
                  RAM: {bundle.requirements.minRAMGB}GB
                </Typography>
                <Typography variant="caption" display="block">
                  Storage: {bundle.requirements.minStorageGB}GB
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" fontWeight="bold" gutterBottom>
                  Included Models:
                </Typography>
                {bundle.models.map((model) => (
                  <Chip
                    key={model.id}
                    label={model.name}
                    size="small"
                    sx={{ mr: 0.5, mb: 0.5 }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );

  const renderOptionalModels = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Optional Models
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Select additional models based on your specific needs. These can be downloaded later if needed.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {optionalModelsList.map((model) => (
          <Box key={model.id}>
            <Card sx={{ mb: 1 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box flex={1}>
                    <Typography variant="h6">{model.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {model.description}
                    </Typography>
                    <Box mt={1}>
                      <Chip label={`${model.sizeGB}GB`} size="small" sx={{ mr: 1 }} />
                      <Chip 
                        label={`VRAM: ${model.requirements.minVRAMGB}GB`} 
                        size="small" 
                        sx={{ mr: 1 }} 
                      />
                      <Chip 
                        label={`RAM: ${model.requirements.minRAMGB}GB`} 
                        size="small" 
                      />
                    </Box>
                  </Box>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={optionalModels.has(model.id)}
                        onChange={() => handleOptionalModelToggle(model.id)}
                        disabled={!!hardwareProfile && 
                          (hardwareProfile.gpu.vramGB < model.requirements.minVRAMGB ||
                           hardwareProfile.memory.totalGB < model.requirements.minRAMGB)}
                      />
                    }
                    label=""
                  />
                </Box>
                
                {hardwareProfile && 
                  (hardwareProfile.gpu.vramGB < model.requirements.minVRAMGB ||
                   hardwareProfile.memory.totalGB < model.requirements.minRAMGB) && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Your system doesn't meet the minimum requirements for this model.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );

  const renderPreferences = () => (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Download Settings
              </Typography>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.backgroundDownload}
                      onChange={(e) => setPreferences(prev => ({ ...prev, backgroundDownload: e.target.checked }))}
                    />
                  }
                  label="Enable background downloads"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.autoUpdate}
                      onChange={(e) => setPreferences(prev => ({ ...prev, autoUpdate: e.target.checked }))}
                    />
                  }
                  label="Auto-update models"
                />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.scheduleDownloads}
                      onChange={(e) => setPreferences(prev => ({ ...prev, scheduleDownloads: e.target.checked }))}
                    />
                  }
                  label="Schedule downloads for off-peak hours"
                />
              </FormGroup>

              {preferences.scheduleDownloads && (
                <Box mt={2}>
                  <Typography gutterBottom>Download Schedule</Typography>
                  <Box display="flex" gap={2} alignItems="center">
                    <Typography variant="body2">From:</Typography>
                    <FormControl size="small">
                      <input
                        type="time"
                        value={`${preferences.scheduleStart.toString().padStart(2, '0')}:00`}
                        onChange={(e) => {
                          const hour = parseInt(e.target.value.split(':')[0]);
                          setPreferences(prev => ({ ...prev, scheduleStart: hour }));
                        }}
                      />
                    </FormControl>
                    <Typography variant="body2">To:</Typography>
                    <FormControl size="small">
                      <input
                        type="time"
                        value={`${preferences.scheduleEnd.toString().padStart(2, '0')}:00`}
                        onChange={(e) => {
                          const hour = parseInt(e.target.value.split(':')[0]);
                          setPreferences(prev => ({ ...prev, scheduleEnd: hour }));
                        }}
                      />
                    </FormControl>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' }, minWidth: 0 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Privacy & Performance
              </Typography>
              
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.telemetryEnabled}
                      onChange={(e) => setPreferences(prev => ({ ...prev, telemetryEnabled: e.target.checked }))}
                    />
                  }
                  label="Enable anonymous telemetry"
                />
              </FormGroup>

              <Box mt={2}>
                <Typography gutterBottom>
                  Bandwidth Limit (0 = unlimited)
                </Typography>
                <Slider
                  value={preferences.maxBandwidthMBps}
                  onChange={(_, value) => setPreferences(prev => ({ ...prev, maxBandwidthMBps: value as number }))}
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => value === 0 ? 'Unlimited' : `${value} MB/s`}
                />
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: '100%' }}>
          <Accordion expanded={showAdvancedOptions} onChange={() => setShowAdvancedOptions(!showAdvancedOptions)}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Advanced Options</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" paragraph>
                Advanced configuration options for power users.
              </Typography>
              
              <FormGroup>
                <FormControlLabel
                  control={<Switch />}
                  label="Enable GPU optimization"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Use experimental features"
                />
                <FormControlLabel
                  control={<Switch />}
                  label="Enable debug logging"
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Box>
  );

  const renderInstallationProgress = () => {
    const allModels = [
      ...(selectedBundle?.models || []),
      ...optionalModelsList.filter(model => optionalModels.has(model.id)),
    ];

    const totalProgress = allModels.length > 0 
      ? Array.from(downloadProgress.values()).reduce((sum, progress) => sum + progress, 0) / (allModels.length * 100) * 100
      : 0;

    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Installing Models
        </Typography>
        
        <Box mb={3}>
          <Typography variant="body2" gutterBottom>
            Overall Progress: {Math.round(totalProgress)}%
          </Typography>
          <LinearProgress variant="determinate" value={totalProgress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>

        <List>
          {allModels.map((model) => (
            <ListItem key={model.id}>
              <ListItemIcon>
                {downloadProgress.get(model.id) === 100 ? (
                  <CheckCircle color="success" />
                ) : isInstalling ? (
                  <Download color="primary" />
                ) : (
                  <Info />
                )}
              </ListItemIcon>
              <ListItemText
                primary={model.name}
                secondary={
                  <Box>
                    <Typography variant="body2">
                      {downloadProgress.get(model.id) || 0}% • {model.sizeGB}GB
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={downloadProgress.get(model.id) || 0} 
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Box>
    );
  };

  const renderCompletion = () => (
    <Box textAlign="center" py={4}>
      <CheckCircle color="success" sx={{ fontSize: 64, mb: 2 }} />
      <Typography variant="h4" gutterBottom>
        Installation Complete!
      </Typography>
      <Typography variant="body1" paragraph>
        Aura is now ready to use. Your models have been successfully installed and are ready for coding assistance.
      </Typography>
      
      <Box mt={4}>
        <Button variant="contained" size="large" sx={{ mr: 2 }}>
          Start Tutorial
        </Button>
        <Button variant="outlined" size="large">
          Open Aura
        </Button>
      </Box>
    </Box>
  );

  const getStepContent = (step: number) => {
    switch (step) {
      case 0: return renderHardwareDetection();
      case 1: return renderBundleSelection();
      case 2: return renderOptionalModels();
      case 3: return renderPreferences();
      case 4: return renderInstallationProgress();
      case 5: return renderCompletion();
      default: return 'Unknown step';
    }
  };

  const canProceed = (step: number) => {
    switch (step) {
      case 0: return hardwareProfile !== null;
      case 1: return selectedBundle !== null;
      case 2: case 3: return true;
      case 4: return installationComplete;
      default: return false;
    }
  };

  return (
    <Box maxWidth="lg" mx="auto" p={3}>
      <Typography variant="h3" gutterBottom textAlign="center">
        Welcome to Aura
      </Typography>
      <Typography variant="h6" color="text.secondary" textAlign="center" paragraph>
        Let's set up your AI-powered development environment
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              icon={step.icon}
              optional={
                index === steps.length - 1 ? (
                  <Typography variant="caption">Last step</Typography>
                ) : null
              }
            >
              {step.label}
            </StepLabel>
            <StepContent>
              <Typography paragraph>{step.description}</Typography>
              
              <Box mt={2}>
                {getStepContent(index)}
              </Box>

              <Box mt={3}>
                <Button
                  variant="contained"
                  onClick={index === 3 ? handleStartInstallation : handleNext}
                  disabled={!canProceed(index) || (index === 4 && isInstalling)}
                  sx={{ mr: 1 }}
                >
                  {index === steps.length - 1 ? 'Finish' : 
                   index === 3 ? 'Start Installation' : 'Continue'}
                </Button>
                <Button
                  disabled={index === 0 || index === 4 || index === 5}
                  onClick={handleBack}
                >
                  Back
                </Button>
              </Box>
            </StepContent>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default InstallationWizard; 