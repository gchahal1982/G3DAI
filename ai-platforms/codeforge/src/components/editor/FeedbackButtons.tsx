import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Rating,
  Chip,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Fade,
  Zoom,
  Collapse,
  Stack,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Slider,
  Paper,
  LinearProgress,
  CircularProgress,
  Avatar,
  Badge,
  ButtonGroup
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Feedback as FeedbackIcon,
  Send as SendIcon,
  Close as CloseIcon,
  Comment as CommentIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  BugReport as BugReportIcon,
  Lightbulb as SuggestionIcon,
  Flag as FlagIcon,
  Share as ShareIcon,
  BookmarkAdd as BookmarkIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { 
  FeedbackCollector, 
  FeedbackType, 
  TargetType, 
  Feedback,
  FeedbackContext,
  CodeContext
} from '../../lib/feedback/FeedbackCollector';

// Props interfaces
interface FeedbackButtonsProps {
  targetId: string;
  targetType: TargetType;
  agentId?: string;
  context?: Partial<FeedbackContext>;
  codeContext?: CodeContext;
  onFeedbackSubmitted?: (feedback: Feedback) => void;
  compact?: boolean;
  showAnalytics?: boolean;
  userId?: string;
  sessionId?: string;
  className?: string;
}

interface ThumbsFeedbackProps {
  targetId: string;
  targetType: TargetType;
  agentId?: string;
  context?: Partial<FeedbackContext>;
  onFeedbackSubmitted?: (feedback: Feedback) => void;
  size?: 'small' | 'medium' | 'large';
  showLabels?: boolean;
  userId?: string;
  sessionId?: string;
}

interface StarRatingFeedbackProps {
  targetId: string;
  targetType: TargetType;
  agentId?: string;
  context?: Partial<FeedbackContext>;
  onFeedbackSubmitted?: (feedback: Feedback) => void;
  maxStars?: number;
  precision?: number;
  showLabel?: boolean;
  showComment?: boolean;
  userId?: string;
  sessionId?: string;
}

interface DetailedFeedbackProps {
  targetId: string;
  targetType: TargetType;
  agentId?: string;
  context?: Partial<FeedbackContext>;
  codeContext?: CodeContext;
  onFeedbackSubmitted?: (feedback: Feedback) => void;
  triggerButton?: React.ReactNode;
  userId?: string;
  sessionId?: string;
}

interface QuickFeedbackProps {
  targetId: string;
  targetType: TargetType;
  agentId?: string;
  options: QuickFeedbackOption[];
  onFeedbackSubmitted?: (feedback: Feedback) => void;
  multiSelect?: boolean;
  userId?: string;
  sessionId?: string;
}

interface QuickFeedbackOption {
  id: string;
  label: string;
  type: FeedbackType;
  rating: number;
  icon?: React.ReactNode;
  color?: string;
}

// Custom hooks
const useFeedbackCollector = () => {
  const [collector] = useState(() => new FeedbackCollector());
  return collector;
};

const useFeedbackState = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFeedback = useCallback(async (
    collector: FeedbackCollector,
    feedbackData: any,
    onSuccess?: (feedback: Feedback) => void
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const feedback = await collector.collectFeedback(feedbackData);
      setShowSuccess(true);
      onSuccess?.(feedback);
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    isSubmitting,
    showSuccess,
    error,
    submitFeedback,
    setError
  };
};

// Thumbs Up/Down Component
export const ThumbsFeedback: React.FC<ThumbsFeedbackProps> = ({
  targetId,
  targetType,
  agentId,
  context = {},
  onFeedbackSubmitted,
  size = 'medium',
  showLabels = false,
  userId,
  sessionId = 'anonymous'
}) => {
  const theme = useTheme();
  const collector = useFeedbackCollector();
  const { isSubmitting, showSuccess, error, submitFeedback } = useFeedbackState();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  const handleThumbsClick = useCallback(async (isPositive: boolean) => {
    const rating = isPositive ? 1 : -1;
    setSelectedRating(rating);

    await submitFeedback(
      collector,
      {
        type: FeedbackType.THUMBS_UP_DOWN,
        target: { type: targetType, id: targetId, agentId },
        rating,
        metadata: collector['generateMetadata'](),
        context,
        userId,
        sessionId
      },
      onFeedbackSubmitted
    );
  }, [collector, targetType, targetId, agentId, context, userId, sessionId, submitFeedback, onFeedbackSubmitted]);

  const getButtonSize = () => {
    switch (size) {
      case 'small': return 'small';
      case 'large': return 'large';
      default: return 'medium';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small': return 'small';
      case 'large': return 'large';
      default: 'medium';
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Tooltip title="This is helpful">
        <IconButton
          size={getButtonSize()}
          onClick={() => handleThumbsClick(true)}
          disabled={isSubmitting}
          sx={{
            color: selectedRating === 1 ? theme.palette.success.main : 'inherit',
            '&:hover': {
              backgroundColor: theme.palette.success.light + '20'
            }
          }}
        >
          <ThumbUpIcon fontSize={getIconSize()} />
        </IconButton>
      </Tooltip>

      {showLabels && (
        <Typography variant="caption" color="text.secondary">
          Helpful
        </Typography>
      )}

      <Tooltip title="This is not helpful">
        <IconButton
          size={getButtonSize()}
          onClick={() => handleThumbsClick(false)}
          disabled={isSubmitting}
          sx={{
            color: selectedRating === -1 ? theme.palette.error.main : 'inherit',
            '&:hover': {
              backgroundColor: theme.palette.error.light + '20'
            }
          }}
        >
          <ThumbDownIcon fontSize={getIconSize()} />
        </IconButton>
      </Tooltip>

      {showLabels && (
        <Typography variant="caption" color="text.secondary">
          Not helpful
        </Typography>
      )}

      {isSubmitting && (
        <CircularProgress size={16} />
      )}

      <Snackbar open={showSuccess} autoHideDuration={3000}>
        <Alert severity="success" variant="filled">
          Thanks for your feedback!
        </Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={5000}>
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Star Rating Component
export const StarRatingFeedback: React.FC<StarRatingFeedbackProps> = ({
  targetId,
  targetType,
  agentId,
  context = {},
  onFeedbackSubmitted,
  maxStars = 5,
  precision = 1,
  showLabel = true,
  showComment = false,
  userId,
  sessionId = 'anonymous'
}) => {
  const collector = useFeedbackCollector();
  const { isSubmitting, showSuccess, error, submitFeedback } = useFeedbackState();
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [showCommentDialog, setShowCommentDialog] = useState(false);

  const handleRatingChange = useCallback(async (newValue: number | null) => {
    if (newValue === null) return;

    setRating(newValue);

    if (showComment) {
      setShowCommentDialog(true);
    } else {
      await submitFeedback(
        collector,
        {
          type: FeedbackType.STAR_RATING,
          target: { type: targetType, id: targetId, agentId },
          rating: newValue,
          metadata: collector['generateMetadata'](),
          context,
          userId,
          sessionId
        },
        onFeedbackSubmitted
      );
    }
  }, [collector, targetType, targetId, agentId, context, userId, sessionId, showComment, submitFeedback, onFeedbackSubmitted]);

  const handleCommentSubmit = useCallback(async () => {
    if (rating === null) return;

    await submitFeedback(
      collector,
      {
        type: FeedbackType.STAR_RATING,
        target: { type: targetType, id: targetId, agentId },
        rating,
        comment: comment.trim() || undefined,
        metadata: collector['generateMetadata'](),
        context,
        userId,
        sessionId
      },
      onFeedbackSubmitted
    );

    setShowCommentDialog(false);
    setComment('');
  }, [collector, targetType, targetId, agentId, rating, comment, context, userId, sessionId, submitFeedback, onFeedbackSubmitted]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {showLabel && (
        <Typography variant="body2" color="text.secondary">
          Rate this:
        </Typography>
      )}

      <Rating
        value={rating}
        onChange={(_, newValue) => handleRatingChange(newValue)}
        max={maxStars}
        precision={precision}
        disabled={isSubmitting}
        sx={{
          '& .MuiRating-iconFilled': {
            color: '#ffc107'
          }
        }}
      />

      {rating && (
        <Typography variant="caption" color="text.secondary">
          {rating}/{maxStars}
        </Typography>
      )}

      {isSubmitting && (
        <CircularProgress size={16} />
      )}

      {/* Comment Dialog */}
      <Dialog open={showCommentDialog} onClose={() => setShowCommentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add a comment (optional)</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Your feedback"
            placeholder="Tell us more about your rating..."
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCommentDialog(false)}>Skip</Button>
          <Button onClick={handleCommentSubmit} variant="contained" disabled={isSubmitting}>
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showSuccess} autoHideDuration={3000}>
        <Alert severity="success" variant="filled">
          Thanks for your rating!
        </Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={5000}>
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Quick Feedback Component
export const QuickFeedback: React.FC<QuickFeedbackProps> = ({
  targetId,
  targetType,
  agentId,
  options,
  onFeedbackSubmitted,
  multiSelect = false,
  userId,
  sessionId = 'anonymous'
}) => {
  const collector = useFeedbackCollector();
  const { isSubmitting, showSuccess, error, submitFeedback } = useFeedbackState();
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

  const handleOptionClick = useCallback(async (option: QuickFeedbackOption) => {
    if (multiSelect) {
      const newSelected = new Set(selectedOptions);
      if (newSelected.has(option.id)) {
        newSelected.delete(option.id);
      } else {
        newSelected.add(option.id);
      }
      setSelectedOptions(newSelected);
    } else {
      setSelectedOptions(new Set([option.id]));
      
      // Submit immediately for single select
      await submitFeedback(
        collector,
        {
          type: option.type,
          target: { type: targetType, id: targetId, agentId },
          rating: option.rating,
          comment: option.label,
          metadata: collector['generateMetadata'](),
          context: {},
          userId,
          sessionId
        },
        onFeedbackSubmitted
      );
    }
  }, [collector, targetType, targetId, agentId, multiSelect, selectedOptions, userId, sessionId, submitFeedback, onFeedbackSubmitted]);

  const handleSubmitMultiple = useCallback(async () => {
    const selectedOptionObjects = options.filter(option => selectedOptions.has(option.id));
    
    for (const option of selectedOptionObjects) {
      await submitFeedback(
        collector,
        {
          type: option.type,
          target: { type: targetType, id: targetId, agentId },
          rating: option.rating,
          comment: option.label,
          metadata: collector['generateMetadata'](),
          context: {},
          userId,
          sessionId
        },
        onFeedbackSubmitted
      );
    }

    setSelectedOptions(new Set());
  }, [collector, targetType, targetId, agentId, options, selectedOptions, userId, sessionId, submitFeedback, onFeedbackSubmitted]);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        How was this? {multiSelect && '(Select all that apply)'}
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
        {options.map((option) => (
          <Chip
            key={option.id}
            label={option.label}
            icon={option.icon}
            clickable
            variant={selectedOptions.has(option.id) ? 'filled' : 'outlined'}
            color={selectedOptions.has(option.id) ? 'primary' : 'default'}
            onClick={() => handleOptionClick(option)}
            disabled={isSubmitting}
            sx={{
              backgroundColor: selectedOptions.has(option.id) ? option.color : undefined,
              '&:hover': {
                backgroundColor: option.color ? option.color + '40' : undefined
              }
            }}
          />
        ))}
      </Stack>

      {multiSelect && selectedOptions.size > 0 && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={handleSubmitMultiple}
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <SendIcon />}
          >
            Submit Feedback
          </Button>
        </Box>
      )}

      <Snackbar open={showSuccess} autoHideDuration={3000}>
        <Alert severity="success" variant="filled">
          Thanks for your feedback!
        </Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={5000}>
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Detailed Feedback Component
export const DetailedFeedback: React.FC<DetailedFeedbackProps> = ({
  targetId,
  targetType,
  agentId,
  context = {},
  codeContext,
  onFeedbackSubmitted,
  triggerButton,
  userId,
  sessionId = 'anonymous'
}) => {
  const collector = useFeedbackCollector();
  const { isSubmitting, showSuccess, error, submitFeedback } = useFeedbackState();
  const [open, setOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(FeedbackType.STAR_RATING);
  const [rating, setRating] = useState<number>(3);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('general');

  const handleSubmit = useCallback(async () => {
    const feedbackContext = codeContext ? { ...context, codeContext } : context;

    await submitFeedback(
      collector,
      {
        type: feedbackType,
        target: { type: targetType, id: targetId, agentId },
        rating,
        comment: comment.trim() || undefined,
        metadata: { 
          ...collector['generateMetadata'](),
          category 
        },
        context: feedbackContext,
        userId,
        sessionId
      },
      onFeedbackSubmitted
    );

    setOpen(false);
    setComment('');
    setRating(3);
    setCategory('general');
  }, [collector, feedbackType, targetType, targetId, agentId, rating, comment, category, context, codeContext, userId, sessionId, submitFeedback, onFeedbackSubmitted]);

  const defaultTrigger = (
    <IconButton size="small" onClick={() => setOpen(true)}>
      <FeedbackIcon />
    </IconButton>
  );

  return (
    <>
      {triggerButton ? (
        <Box onClick={() => setOpen(true)}>
          {triggerButton}
        </Box>
      ) : (
        defaultTrigger
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Share Your Feedback</Typography>
            <IconButton onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3}>
            {/* Feedback Type */}
            <FormControl>
              <FormLabel>What type of feedback is this?</FormLabel>
              <RadioGroup
                value={feedbackType}
                onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                row
              >
                <FormControlLabel 
                  value={FeedbackType.STAR_RATING} 
                  control={<Radio />} 
                  label="General Rating" 
                />
                <FormControlLabel 
                  value={FeedbackType.BUG_REPORT} 
                  control={<Radio />} 
                  label="Bug Report" 
                />
                <FormControlLabel 
                  value={FeedbackType.FEATURE_REQUEST} 
                  control={<Radio />} 
                  label="Feature Request" 
                />
              </RadioGroup>
            </FormControl>

            {/* Rating */}
            {feedbackType === FeedbackType.STAR_RATING && (
              <Box>
                <FormLabel>Overall Rating</FormLabel>
                <Rating
                  value={rating}
                  onChange={(_, newValue) => setRating(newValue || 1)}
                  max={5}
                  size="large"
                />
              </Box>
            )}

            {feedbackType === FeedbackType.BUG_REPORT && (
              <Box>
                <FormLabel>Severity</FormLabel>
                <Slider
                  value={rating}
                  onChange={(_, newValue) => setRating(Array.isArray(newValue) ? newValue[0] : newValue)}
                  min={1}
                  max={5}
                  step={1}
                  marks={[
                    { value: 1, label: 'Low' },
                    { value: 2, label: 'Medium' },
                    { value: 3, label: 'High' },
                    { value: 4, label: 'Critical' }
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            )}

            {/* Category */}
            <FormControl>
              <FormLabel>Category</FormLabel>
              <RadioGroup
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                row
              >
                <FormControlLabel value="general" control={<Radio />} label="General" />
                <FormControlLabel value="performance" control={<Radio />} label="Performance" />
                <FormControlLabel value="ui" control={<Radio />} label="User Interface" />
                <FormControlLabel value="accuracy" control={<Radio />} label="Accuracy" />
              </RadioGroup>
            </FormControl>

            {/* Comment */}
            <TextField
              label={feedbackType === FeedbackType.BUG_REPORT ? "Describe the bug" : 
                     feedbackType === FeedbackType.FEATURE_REQUEST ? "Describe the feature" : 
                     "Your feedback"}
              placeholder={feedbackType === FeedbackType.BUG_REPORT ? "What happened? What did you expect to happen?" :
                          feedbackType === FeedbackType.FEATURE_REQUEST ? "What feature would you like to see?" :
                          "Tell us about your experience..."}
              multiline
              rows={4}
              fullWidth
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              variant="outlined"
            />

            {/* Code Context Display */}
            {codeContext && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Code Context
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Before:
                  </Typography>
                  <Paper sx={{ p: 1, bgcolor: 'grey.50', fontFamily: 'monospace', fontSize: 12, mb: 1 }}>
                    {codeContext.beforeCode.slice(0, 100)}...
                  </Paper>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Suggested:
                  </Typography>
                  <Paper sx={{ p: 1, bgcolor: 'primary.50', fontFamily: 'monospace', fontSize: 12 }}>
                    {codeContext.suggestedCode.slice(0, 100)}...
                  </Paper>
                </CardContent>
              </Card>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={isSubmitting || !comment.trim()}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : <SendIcon />}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={showSuccess} autoHideDuration={3000}>
        <Alert severity="success" variant="filled">
          Thank you for your detailed feedback!
        </Alert>
      </Snackbar>

      <Snackbar open={!!error} autoHideDuration={5000}>
        <Alert severity="error" variant="filled">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

// Main Feedback Buttons Component
export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  targetId,
  targetType,
  agentId,
  context = {},
  codeContext,
  onFeedbackSubmitted,
  compact = false,
  showAnalytics = false,
  userId,
  sessionId = 'anonymous',
  className
}) => {
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState(false);

  const quickOptions: QuickFeedbackOption[] = useMemo(() => [
    {
      id: 'helpful',
      label: 'Helpful',
      type: FeedbackType.THUMBS_UP_DOWN,
      rating: 1,
      icon: <ThumbUpIcon />,
      color: '#4caf50'
    },
    {
      id: 'accurate',
      label: 'Accurate',
      type: FeedbackType.ACCURACY,
      rating: 5,
      icon: <CheckCircleIcon />,
      color: '#2196f3'
    },
    {
      id: 'confusing',
      label: 'Confusing',
      type: FeedbackType.THUMBS_UP_DOWN,
      rating: -1,
      icon: <WarningIcon />,
      color: '#ff9800'
    },
    {
      id: 'wrong',
      label: 'Wrong',
      type: FeedbackType.ACCURACY,
      rating: 1,
      icon: <ErrorIcon />,
      color: '#f44336'
    }
  ], []);

  if (compact) {
    return (
      <Box className={className} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <ThumbsFeedback
          targetId={targetId}
          targetType={targetType}
          agentId={agentId}
          context={context}
          onFeedbackSubmitted={onFeedbackSubmitted}
          size="small"
          userId={userId}
          sessionId={sessionId}
        />
        
        <DetailedFeedback
          targetId={targetId}
          targetType={targetType}
          agentId={agentId}
          context={context}
          codeContext={codeContext}
          onFeedbackSubmitted={onFeedbackSubmitted}
          userId={userId}
          sessionId={sessionId}
          triggerButton={
            <Tooltip title="Detailed feedback">
              <IconButton size="small">
                <CommentIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          }
        />
      </Box>
    );
  }

  return (
    <Card className={className} variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        How was this suggestion?
      </Typography>

      <Stack spacing={2}>
        {/* Quick Options */}
        <QuickFeedback
          targetId={targetId}
          targetType={targetType}
          agentId={agentId}
          options={quickOptions}
          onFeedbackSubmitted={onFeedbackSubmitted}
          multiSelect={true}
          userId={userId}
          sessionId={sessionId}
        />

        <Divider />

        {/* Star Rating */}
        <StarRatingFeedback
          targetId={targetId}
          targetType={targetType}
          agentId={agentId}
          context={context}
          onFeedbackSubmitted={onFeedbackSubmitted}
          showComment={false}
          userId={userId}
          sessionId={sessionId}
        />

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
          <DetailedFeedback
            targetId={targetId}
            targetType={targetType}
            agentId={agentId}
            context={context}
            codeContext={codeContext}
            onFeedbackSubmitted={onFeedbackSubmitted}
            userId={userId}
            sessionId={sessionId}
            triggerButton={
              <Button size="small" startIcon={<EditIcon />}>
                Detailed Feedback
              </Button>
            }
          />

          {showAnalytics && (
            <Button
              size="small"
              startIcon={<AnalyticsIcon />}
              onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
            >
              Analytics
            </Button>
          )}
        </Stack>

        {/* Analytics Panel */}
        <Collapse in={showAnalyticsPanel}>
          <FeedbackAnalyticsPanel 
            targetId={targetId}
            targetType={targetType}
            agentId={agentId}
          />
        </Collapse>
      </Stack>
    </Card>
  );
};

// Feedback Analytics Panel Component
export const FeedbackAnalyticsPanel: React.FC<{
  targetId: string;
  targetType: TargetType;
  agentId?: string;
}> = ({ targetId, targetType, agentId }) => {
  const collector = useFeedbackCollector();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await collector.getAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [collector]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Alert severity="info">
        No analytics data available yet.
      </Alert>
    );
  }

  const summary = analytics.summary;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Feedback Analytics
      </Typography>

      <Stack spacing={2}>
        {/* Summary Stats */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">{summary.totalFeedback}</Typography>
            <Typography variant="caption" color="text.secondary">Total</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="success.main">{summary.positiveFeedback}</Typography>
            <Typography variant="caption" color="text.secondary">Positive</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" color="error.main">{summary.negativeFeedback}</Typography>
            <Typography variant="caption" color="text.secondary">Negative</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6">{summary.averageRating.toFixed(1)}</Typography>
            <Typography variant="caption" color="text.secondary">Avg Rating</Typography>
          </Box>
        </Box>

        {/* Progress Bar */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Satisfaction Rate
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(summary.positiveFeedback / Math.max(summary.totalFeedback, 1)) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Agent Performance */}
        {agentId && summary.byAgent[agentId] && (
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Agent Performance
            </Typography>
            <Chip
              label={`${summary.byAgent[agentId].averageRating.toFixed(1)}/5`}
              color={summary.byAgent[agentId].averageRating >= 4 ? 'success' : 
                     summary.byAgent[agentId].averageRating >= 3 ? 'warning' : 'error'}
              size="small"
            />
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

// Export all components
export default FeedbackButtons; 