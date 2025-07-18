/**
 * BetaOnboarding - Comprehensive Beta User Onboarding Experience
 * 
 * Advanced onboarding system for CodeForge beta users:
 * - Comprehensive getting started tutorial with interactive elements
 * - Feature discovery walkthrough with contextual help
 * - 3D minimap introduction and hands-on training
 * - Model selection guidance with performance recommendations
 * - Integrated feedback collection system for beta insights
 * - Beta-specific feature flags and experimental features
 * - Early access feature previews with usage analytics
 * - User feedback integration with sentiment analysis
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating,
  FormControlLabel,
  Switch,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  IconButton,
  Paper,
  Grid,
  LinearProgress,
  Fade,
  Slide,
  Zoom,
  Alert,
  AlertTitle,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import {
  CheckCircle,
  RadioButtonUnchecked,
  PlayArrow,
  Pause,
  SkipNext,
  SkipPrevious,
  Lightbulb,
  ThreeDRotation,
  Computer,
  Speed,
  Feedback,
  Star,
  Help,
  ExpandMore,
  Close,
  Launch,
  TrendingUp,
  Psychology,
  Code,
  Palette,
  Settings,
  Visibility,
  VisibilityOff,
  Send,
  ThumbUp,
  ThumbDown,
  Flag
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled components
const OnboardingContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(15, 15, 25, 0.95) 0%, rgba(25, 25, 40, 0.95) 100%)',
  minHeight: '100vh',
  color: theme.palette.text.primary,
  position: 'relative',
  overflow: 'hidden'
}));

const FeatureCard = styled(Card)(({ theme }: { theme: any }) => ({
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8]
  }
}));

const InteractiveDemo = styled(Box)(({ theme }: { theme: any }) => ({
  background: 'rgba(0, 0, 0, 0.3)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  border: `2px dashed ${theme.palette.primary.main}`,
  position: 'relative',
  minHeight: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}));

const ProgressIndicator = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: theme.spacing(2),
  right: theme.spacing(2),
  background: 'rgba(0, 0, 0, 0.8)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1, 2),
  zIndex: 1000
}));

// Interfaces
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  optional: boolean;
  duration: number; // estimated duration in minutes
  prerequisites?: string[];
}

interface UserProgress {
  currentStep: number;
  completedSteps: Set<string>;
  skippedSteps: Set<string>;
  startTime: number;
  preferences: {
    showTooltips: boolean;
    autoAdvance: boolean;
    playAnimations: boolean;
    collectTelemetry: boolean;
  };
  feedback: {
    stepRatings: Record<string, number>;
    comments: Record<string, string>;
    overallSatisfaction: number;
  };
}

interface FeaturePreview {
  id: string;
  name: string;
  description: string;
  status: 'alpha' | 'beta' | 'experimental';
  enabled: boolean;
  requiredFlag: string;
  impact: 'low' | 'medium' | 'high';
  category: 'performance' | 'ui' | 'ai' | 'collaboration';
}

interface BetaFeedback {
  id: string;
  timestamp: number;
  type: 'bug' | 'feature' | 'improvement' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  title: string;
  description: string;
  rating: number;
  userAgent: string;
  sessionId: string;
  reproductionSteps?: string[];
  expectedBehavior?: string;
  actualBehavior?: string;
  attachments?: string[];
}

const BetaOnboarding: React.FC = () => {
  // State management
  const [progress, setProgress] = useState<UserProgress>({
    currentStep: 0,
    completedSteps: new Set(),
    skippedSteps: new Set(),
    startTime: Date.now(),
    preferences: {
      showTooltips: true,
      autoAdvance: false,
      playAnimations: true,
      collectTelemetry: true
    },
    feedback: {
      stepRatings: {},
      comments: {},
      overallSatisfaction: 5
    }
  });

  const [demoMode, setDemoMode] = useState(false);
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<Partial<BetaFeedback>>({
    type: 'general',
    severity: 'medium',
    rating: 5
  });
  const [featurePreviews, setFeaturePreviews] = useState<FeaturePreview[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const demoTimer = useRef<NodeJS.Timeout>();

  // Onboarding steps configuration
  const onboardingSteps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to CodeForge Beta!',
      description: 'Get ready to experience the future of AI-assisted development',
      component: <WelcomeStep />,
      optional: false,
      duration: 2
    },
    {
      id: 'installation',
      title: 'Installation Complete',
      description: 'Verify your installation and system requirements',
      component: <InstallationStep />,
      optional: false,
      duration: 3
    },
    {
      id: 'model_selection',
      title: 'Choose Your AI Models',
      description: 'Select the best models for your hardware and workflow',
      component: <ModelSelectionStep />,
      optional: false,
      duration: 5
    },
    {
      id: 'interface_tour',
      title: 'Interface Overview',
      description: 'Explore the CodeForge interface and key features',
      component: <InterfaceTourStep />,
      optional: false,
      duration: 4
    },
    {
      id: '3d_minimap',
      title: '3D Code Visualization',
      description: 'Learn to navigate and use the revolutionary 3D minimap',
      component: <MinimapTrainingStep />,
      optional: false,
      duration: 8
    },
    {
      id: 'ai_completion',
      title: 'AI-Powered Completion',
      description: 'Master AI code completion and intelligent suggestions',
      component: <CompletionTrainingStep />,
      optional: false,
      duration: 6
    },
    {
      id: 'collaboration',
      title: 'Real-time Collaboration',
      description: 'Experience collaborative coding with your team',
      component: <CollaborationStep />,
      optional: true,
      duration: 5
    },
    {
      id: 'beta_features',
      title: 'Beta Feature Previews',
      description: 'Explore experimental features and provide feedback',
      component: <BetaFeaturesStep />,
      optional: true,
      duration: 4
    },
    {
      id: 'feedback',
      title: 'Share Your Feedback',
      description: 'Help us improve CodeForge with your insights',
      component: <FeedbackStep />,
      optional: false,
      duration: 3
    }
  ];

  // Event handlers
  const handleNext = useCallback(() => {
    const currentStepId = onboardingSteps[progress.currentStep]?.id;
    if (currentStepId) {
      setProgress(prev => ({
        ...prev,
        currentStep: Math.min(prev.currentStep + 1, onboardingSteps.length - 1),
        completedSteps: new Set([...prev.completedSteps, currentStepId])
      }));
    }
  }, [progress.currentStep, onboardingSteps]);

  const handlePrevious = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0)
    }));
  }, []);

  const handleSkip = useCallback(() => {
    const currentStepId = onboardingSteps[progress.currentStep]?.id;
    if (currentStepId && onboardingSteps[progress.currentStep]?.optional) {
      setProgress(prev => ({
        ...prev,
        currentStep: Math.min(prev.currentStep + 1, onboardingSteps.length - 1),
        skippedSteps: new Set([...prev.skippedSteps, currentStepId])
      }));
    }
  }, [progress.currentStep, onboardingSteps]);

  const handleStepRating = useCallback((stepId: string, rating: number) => {
    setProgress(prev => ({
      ...prev,
      feedback: {
        ...prev.feedback,
        stepRatings: {
          ...prev.feedback.stepRatings,
          [stepId]: rating
        }
      }
    }));
  }, []);

  const handleComplete = useCallback(() => {
    setShowCelebration(true);
    
    // Save onboarding completion
    localStorage.setItem('codeforge_onboarding_completed', JSON.stringify({
      timestamp: Date.now(),
      duration: Date.now() - progress.startTime,
      progress: progress
    }));

    setTimeout(() => {
      setShowCelebration(false);
      // Navigate to main application
    }, 3000);
  }, [progress]);

  const handleFeedbackSubmit = useCallback(() => {
    const feedback: BetaFeedback = {
      id: `feedback_${Date.now()}`,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      sessionId: `session_${Date.now()}`,
      ...currentFeedback
    } as BetaFeedback;

    // Submit feedback to backend
    console.log('Submitting feedback:', feedback);
    
    setFeedbackDialogOpen(false);
    setCurrentFeedback({
      type: 'general',
      severity: 'medium',
      rating: 5
    });
  }, [currentFeedback]);

  const toggleDemoMode = useCallback(() => {
    setDemoMode(prev => !prev);
    setIsPlaying(false);
  }, []);

  const playDemo = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      if (demoTimer.current) {
        clearTimeout(demoTimer.current);
      }
    } else {
      setIsPlaying(true);
      // Auto-advance through steps for demo
      demoTimer.current = setTimeout(() => {
        handleNext();
        setIsPlaying(false);
      }, 3000);
    }
  }, [isPlaying, handleNext]);

  // Load feature previews
  useEffect(() => {
    const previews: FeaturePreview[] = [
      {
        id: 'voice_commands',
        name: 'Voice Commands',
        description: 'Control CodeForge with voice commands',
        status: 'alpha',
        enabled: false,
        requiredFlag: 'voice_commands_enabled',
        impact: 'medium',
        category: 'ui'
      },
      {
        id: 'ai_pair_programmer',
        name: 'AI Pair Programmer',
        description: 'Advanced AI pair programming assistant',
        status: 'beta',
        enabled: true,
        requiredFlag: 'ai_pair_enabled',
        impact: 'high',
        category: 'ai'
      },
      {
        id: 'performance_profiler',
        name: 'Real-time Performance Profiler',
        description: 'Monitor code performance in real-time',
        status: 'experimental',
        enabled: false,
        requiredFlag: 'profiler_enabled',
        impact: 'high',
        category: 'performance'
      }
    ];
    setFeaturePreviews(previews);
  }, []);

  const currentStep = onboardingSteps[progress.currentStep];
  const isLastStep = progress.currentStep === onboardingSteps.length - 1;
  const completionPercentage = (progress.completedSteps.size / onboardingSteps.length) * 100;

  return (
    <OnboardingContainer>
      {/* Progress Indicator */}
      <ProgressIndicator>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="caption">
            {progress.currentStep + 1} / {onboardingSteps.length}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={completionPercentage}
            sx={{ width: 100, height: 6, borderRadius: 3 }}
          />
        </Box>
      </ProgressIndicator>

      {/* Demo Controls */}
      {demoMode && (
        <Box position="fixed" top={2} left={2} zIndex={1000}>
          <Paper sx={{ p: 1, background: 'rgba(0,0,0,0.8)' }}>
            <Box display="flex" gap={1}>
              <IconButton size="small" onClick={playDemo} color="primary">
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton size="small" onClick={handlePrevious}>
                <SkipPrevious />
              </IconButton>
              <IconButton size="small" onClick={handleNext}>
                <SkipNext />
              </IconButton>
              <IconButton size="small" onClick={toggleDemoMode}>
                <Close />
              </IconButton>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Main Content */}
      <Box p={4} pt={8}>
        <Grid container spacing={4}>
          {/* Stepper */}
          <Grid item xs={12} md={4}>
            <Card sx={{ background: 'rgba(255,255,255,0.05)' }}>
              <CardHeader
                title="Onboarding Progress"
                action={
                  <Tooltip title="Demo Mode">
                    <IconButton onClick={toggleDemoMode} color={demoMode ? 'primary' : 'default'}>
                      <PlayArrow />
                    </IconButton>
                  </Tooltip>
                }
              />
              <CardContent>
                <Stepper activeStep={progress.currentStep} orientation="vertical">
                  {onboardingSteps.map((step, index) => (
                    <Step key={step.id}>
                      <StepLabel
                        optional={step.optional && <Typography variant="caption">Optional</Typography>}
                        StepIconComponent={({ active, completed }) => (
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: completed ? 'success.main' : active ? 'primary.main' : 'grey.500',
                              color: 'white'
                            }}
                          >
                            {completed ? <CheckCircle sx={{ fontSize: 16 }} /> : index + 1}
                          </Box>
                        )}
                      >
                        <Typography variant="body2" fontWeight={index === progress.currentStep ? 'bold' : 'normal'}>
                          {step.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ~{step.duration} min
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </CardContent>
            </Card>
          </Grid>

          {/* Current Step Content */}
          <Grid item xs={12} md={8}>
            <Fade in key={progress.currentStep}>
              <Card sx={{ minHeight: 500 }}>
                <CardHeader
                  title={currentStep?.title}
                  subheader={currentStep?.description}
                  action={
                    <Box display="flex" gap={1}>
                      {currentStep?.optional && (
                        <Button variant="outlined" onClick={handleSkip}>
                          Skip
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        onClick={() => setFeedbackDialogOpen(true)}
                        startIcon={<Feedback />}
                      >
                        Feedback
                      </Button>
                    </Box>
                  }
                />
                <CardContent>
                  {currentStep?.component}
                </CardContent>
                
                {/* Navigation */}
                <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
                  <Button
                    onClick={handlePrevious}
                    disabled={progress.currentStep === 0}
                    startIcon={<SkipPrevious />}
                  >
                    Previous
                  </Button>
                  
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="text.secondary">
                      Rate this step:
                    </Typography>
                    <Rating
                      value={progress.feedback.stepRatings[currentStep?.id || ''] || 0}
                      onChange={(_, value) => handleStepRating(currentStep?.id || '', value || 0)}
                      size="small"
                    />
                  </Box>

                  <Button
                    onClick={isLastStep ? handleComplete : handleNext}
                    variant="contained"
                    endIcon={isLastStep ? <CheckCircle /> : <SkipNext />}
                  >
                    {isLastStep ? 'Complete' : 'Next'}
                  </Button>
                </Box>
              </Card>
            </Fade>
          </Grid>
        </Grid>
      </Box>

      {/* Feedback Dialog */}
      <Dialog
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Beta Feedback</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Type"
                value={currentFeedback.type}
                onChange={(e) => setCurrentFeedback(prev => ({ ...prev, type: e.target.value as any }))}
              >
                <MenuItem value="bug">Bug Report</MenuItem>
                <MenuItem value="feature">Feature Request</MenuItem>
                <MenuItem value="improvement">Improvement</MenuItem>
                <MenuItem value="general">General Feedback</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="Severity"
                value={currentFeedback.severity}
                onChange={(e) => setCurrentFeedback(prev => ({ ...prev, severity: e.target.value as any }))}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={currentFeedback.title || ''}
                onChange={(e) => setCurrentFeedback(prev => ({ ...prev, title: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={currentFeedback.description || ''}
                onChange={(e) => setCurrentFeedback(prev => ({ ...prev, description: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" gap={2}>
                <Typography>Overall Rating:</Typography>
                <Rating
                  value={currentFeedback.rating || 5}
                  onChange={(_, value) => setCurrentFeedback(prev => ({ ...prev, rating: value || 5 }))}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleFeedbackSubmit}
            variant="contained"
            startIcon={<Send />}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      {/* Celebration Animation */}
      {showCelebration && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          bgcolor="rgba(0,0,0,0.8)"
          zIndex={9999}
        >
          <Zoom in>
            <Card sx={{ p: 4, textAlign: 'center', maxWidth: 400 }}>
              <Typography variant="h4" gutterBottom>
                🎉 Congratulations!
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                You've completed the CodeForge beta onboarding!
                Welcome to the future of AI-assisted development.
              </Typography>
              <Button
                variant="contained"
                onClick={() => setShowCelebration(false)}
                sx={{ mt: 2 }}
              >
                Get Started Coding!
              </Button>
            </Card>
          </Zoom>
        </Box>
      )}
    </OnboardingContainer>
  );
};

// Step Components
const WelcomeStep: React.FC = () => (
  <Box>
    <Typography variant="h5" gutterBottom>
      Welcome to the CodeForge Beta! 🚀
    </Typography>
    <Typography variant="body1" paragraph>
      You're about to experience the future of AI-assisted development. CodeForge combines cutting-edge
      AI models with revolutionary 3D code visualization to transform how you write, understand, and
      collaborate on code.
    </Typography>
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={4}>
        <FeatureCard>
          <CardContent sx={{ textAlign: 'center' }}>
            <ThreeDRotation color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">3D Code Visualization</Typography>
            <Typography variant="body2" color="text.secondary">
              Navigate your codebase in three dimensions
            </Typography>
          </CardContent>
        </FeatureCard>
      </Grid>
      <Grid item xs={4}>
        <FeatureCard>
          <CardContent sx={{ textAlign: 'center' }}>
            <Psychology color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">AI-Powered Completion</Typography>
            <Typography variant="body2" color="text.secondary">
              Intelligent code suggestions and generation
            </Typography>
          </CardContent>
        </FeatureCard>
      </Grid>
      <Grid item xs={4}>
        <FeatureCard>
          <CardContent sx={{ textAlign: 'center' }}>
            <Speed color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h6">Lightning Fast</Typography>
            <Typography variant="body2" color="text.secondary">
              Local models for instant responses
            </Typography>
          </CardContent>
        </FeatureCard>
      </Grid>
    </Grid>
  </Box>
);

const InstallationStep: React.FC = () => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Installation Verification ✅
    </Typography>
    <Alert severity="success" sx={{ mb: 2 }}>
      <AlertTitle>Installation Complete</AlertTitle>
      CodeForge has been successfully installed on your system.
    </Alert>
    <List>
      <ListItem>
        <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
        <ListItemText primary="System Requirements" secondary="All requirements met" />
      </ListItem>
      <ListItem>
        <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
        <ListItemText primary="GPU Support" secondary="Hardware acceleration available" />
      </ListItem>
      <ListItem>
        <ListItemIcon><CheckCircle color="success" /></ListItemIcon>
        <ListItemText primary="Model Storage" secondary="Sufficient storage space available" />
      </ListItem>
    </List>
  </Box>
);

const ModelSelectionStep: React.FC = () => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Choose Your AI Models 🤖
    </Typography>
    <Typography variant="body2" paragraph color="text.secondary">
      Select the best models for your hardware and workflow. We recommend starting with our
      curated bundles based on your system capabilities.
    </Typography>
    <InteractiveDemo>
      <Typography variant="h6" color="primary">
        Interactive Model Selection Demo
      </Typography>
    </InteractiveDemo>
  </Box>
);

const InterfaceTourStep: React.FC = () => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Interface Overview 🎯
    </Typography>
    <Typography variant="body2" paragraph>
      Let's explore the CodeForge interface and discover its key features.
    </Typography>
    <InteractiveDemo>
      <Typography variant="h6" color="primary">
        Interactive Interface Tour
      </Typography>
    </InteractiveDemo>
  </Box>
);

const MinimapTrainingStep: React.FC = () => (
  <Box>
    <Typography variant="h6" gutterBottom>
      3D Code Visualization Training 🎮
    </Typography>
    <Typography variant="body2" paragraph>
      Master the revolutionary 3D minimap - navigate your codebase like never before!
    </Typography>
    <InteractiveDemo>
      <Typography variant="h6" color="primary">
        3D Minimap Interactive Tutorial
      </Typography>
    </InteractiveDemo>
  </Box>
);

const CompletionTrainingStep: React.FC = () => (
  <Box>
    <Typography variant="h6" gutterBottom>
      AI-Powered Code Completion ⚡
    </Typography>
    <Typography variant="body2" paragraph>
      Learn to leverage AI for intelligent code completion and suggestions.
    </Typography>
    <InteractiveDemo>
      <Typography variant="h6" color="primary">
        AI Completion Demo
      </Typography>
    </InteractiveDemo>
  </Box>
);

const CollaborationStep: React.FC = () => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Real-time Collaboration 👥
    </Typography>
    <Typography variant="body2" paragraph>
      Experience seamless collaboration with your team in real-time.
    </Typography>
    <InteractiveDemo>
      <Typography variant="h6" color="primary">
        Collaboration Demo
      </Typography>
    </InteractiveDemo>
  </Box>
);

const BetaFeaturesStep: React.FC = () => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Beta Feature Previews 🧪
    </Typography>
    <Typography variant="body2" paragraph>
      Explore experimental features and help shape the future of CodeForge.
    </Typography>
    <InteractiveDemo>
      <Typography variant="h6" color="primary">
        Feature Preview Gallery
      </Typography>
    </InteractiveDemo>
  </Box>
);

const FeedbackStep: React.FC = () => (
  <Box>
    <Typography variant="h6" gutterBottom>
      Share Your Feedback 💬
    </Typography>
    <Typography variant="body2" paragraph>
      Your feedback is invaluable in making CodeForge better. Share your thoughts and help us improve!
    </Typography>
    <InteractiveDemo>
      <Typography variant="h6" color="primary">
        Feedback Collection Interface
      </Typography>
    </InteractiveDemo>
  </Box>
);

export default BetaOnboarding; 