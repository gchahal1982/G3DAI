import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Chip,
  Divider,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  TabPanel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Tooltip,
  Menu,
  MenuItem,
  Grid,
  Paper,
  Stack,
  Avatar,
  AvatarGroup,
  Switch,
  FormControlLabel,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  GitBranch as BranchIcon,
  MergeType as MergeIcon,
  Code as CodeIcon,
  BugReport as BugIcon,
  Security as SecurityIcon,
  Speed as PerformanceIcon,
  Description as DocsIcon,
  TestTube as TestIcon,
  Build as BuildIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  History as HistoryIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  CompareArrows as CompareIcon,
  Approval as ApprovalIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Replay as ReplayIcon,
  FastForward as FastForwardIcon,
  SkipNext as SkipIcon,
  Settings as SettingsIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  MoreVert as MoreIcon,
  Share as ShareIcon,
  Link as LinkIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { 
  GhostBranch, 
  BranchStatus, 
  IntentType, 
  PRStatus, 
  TestStatus, 
  CheckStatus,
  MergeType,
  ConflictType,
  ChangeType
} from '../../lib/git/GhostBranch';

// Props interface
interface GhostBranchPanelProps {
  branches: GhostBranch[];
  selectedBranchId?: string;
  onBranchSelect: (branchId: string) => void;
  onBranchMerge: (branchId: string, strategy: MergeType) => void;
  onBranchRollback: (branchId: string) => void;
  onBranchRefresh: (branchId: string) => void;
  onRunTests: (branchId: string) => void;
  onResolveConflict: (branchId: string, fileId: string, resolution: string) => void;
  loading?: boolean;
}

// Filter and sort types
interface BranchFilters {
  status: BranchStatus[];
  type: IntentType[];
  riskLevel: number[];
  hasConflicts: boolean | null;
  hasFailedTests: boolean | null;
  searchTerm: string;
}

type SortField = 'createdAt' | 'updatedAt' | 'riskLevel' | 'complexity' | 'reviewTime';
type SortDirection = 'asc' | 'desc';

interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

// Tab values
enum TabValue {
  OVERVIEW = 0,
  DIFF = 1,
  TESTS = 2,
  CONFLICTS = 3,
  REVIEWS = 4,
  ANALYTICS = 5
}

// Status color mapping
const getStatusColor = (status: BranchStatus): string => {
  switch (status) {
    case BranchStatus.CREATED: return '#2196f3';
    case BranchStatus.IN_PROGRESS: return '#ff9800';
    case BranchStatus.READY_FOR_REVIEW: return '#9c27b0';
    case BranchStatus.UNDER_REVIEW: return '#673ab7';
    case BranchStatus.APPROVED: return '#4caf50';
    case BranchStatus.MERGED: return '#388e3c';
    case BranchStatus.CLOSED: return '#757575';
    case BranchStatus.CONFLICT: return '#f44336';
    case BranchStatus.FAILED: return '#d32f2f';
    default: return '#757575';
  }
};

// Intent type icons
const getIntentIcon = (type: IntentType) => {
  switch (type) {
    case IntentType.FEATURE: return <CodeIcon />;
    case IntentType.BUGFIX: return <BugIcon />;
    case IntentType.SECURITY: return <SecurityIcon />;
    case IntentType.OPTIMIZATION: return <PerformanceIcon />;
    case IntentType.DOCUMENTATION: return <DocsIcon />;
    case IntentType.TEST: return <TestIcon />;
    default: return <BuildIcon />;
  }
};

// Risk level colors
const getRiskColor = (level: number): string => {
  if (level <= 3) return '#4caf50';
  if (level <= 7) return '#ff9800';
  return '#f44336';
};

// Main component
export const GhostBranchPanel: React.FC<GhostBranchPanelProps> = ({
  branches,
  selectedBranchId,
  onBranchSelect,
  onBranchMerge,
  onBranchRollback,
  onBranchRefresh,
  onRunTests,
  onResolveConflict,
  loading = false
}) => {
  const theme = useTheme();
  
  // State
  const [activeTab, setActiveTab] = useState<TabValue>(TabValue.OVERVIEW);
  const [filters, setFilters] = useState<BranchFilters>({
    status: [],
    type: [],
    riskLevel: [],
    hasConflicts: null,
    hasFailedTests: null,
    searchTerm: ''
  });
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'updatedAt',
    direction: 'desc'
  });
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [rollbackDialogOpen, setRollbackDialogOpen] = useState(false);
  const [selectedMergeStrategy, setSelectedMergeStrategy] = useState<MergeType>(MergeType.SQUASH);
  const [expandedAccordions, setExpandedAccordions] = useState<Set<string>>(new Set());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [actionMenuBranchId, setActionMenuBranchId] = useState<string | null>(null);

  // Selected branch
  const selectedBranch = useMemo(() => 
    branches.find(b => b.id === selectedBranchId), 
    [branches, selectedBranchId]
  );

  // Filtered and sorted branches
  const filteredBranches = useMemo(() => {
    let filtered = branches.filter(branch => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(branch.status)) {
        return false;
      }

      // Type filter
      if (filters.type.length > 0 && !filters.type.includes(branch.intent.type)) {
        return false;
      }

      // Risk level filter
      if (filters.riskLevel.length > 0) {
        const riskRange = getRiskRange(branch.metadata.riskLevel);
        if (!filters.riskLevel.includes(riskRange)) {
          return false;
        }
      }

      // Conflicts filter
      if (filters.hasConflicts !== null) {
        const hasConflicts = branch.conflicts.length > 0;
        if (filters.hasConflicts !== hasConflicts) {
          return false;
        }
      }

      // Failed tests filter
      if (filters.hasFailedTests !== null) {
        const hasFailedTests = branch.tests.some(test => test.status === TestStatus.FAILED);
        if (filters.hasFailedTests !== hasFailedTests) {
          return false;
        }
      }

      // Search term
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const searchableText = [
          branch.name,
          branch.intent.description,
          branch.intent.owner,
          ...branch.metadata.tags
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(term)) {
          return false;
        }
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortOptions.field) {
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'updatedAt':
          aValue = a.updatedAt.getTime();
          bValue = b.updatedAt.getTime();
          break;
        case 'riskLevel':
          aValue = a.metadata.riskLevel;
          bValue = b.metadata.riskLevel;
          break;
        case 'complexity':
          aValue = a.metadata.complexity;
          bValue = b.metadata.complexity;
          break;
        case 'reviewTime':
          aValue = a.metadata.estimatedReviewTime;
          bValue = b.metadata.estimatedReviewTime;
          break;
        default:
          return 0;
      }

      if (sortOptions.direction === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [branches, filters, sortOptions]);

  // Helper functions
  const getRiskRange = (level: number): number => {
    if (level <= 3) return 1; // Low
    if (level <= 7) return 2; // Medium
    return 3; // High
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Event handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  const handleFilterChange = (newFilters: Partial<BranchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (newSort: Partial<SortOptions>) => {
    setSortOptions(prev => ({ ...prev, ...newSort }));
  };

  const handleAccordionToggle = (branchId: string) => {
    setExpandedAccordions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(branchId)) {
        newSet.delete(branchId);
      } else {
        newSet.add(branchId);
      }
      return newSet;
    });
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, branchId: string) => {
    setAnchorEl(event.currentTarget);
    setActionMenuBranchId(branchId);
  };

  const handleActionMenuClose = () => {
    setAnchorEl(null);
    setActionMenuBranchId(null);
  };

  const handleMergeClick = (branchId: string) => {
    onBranchSelect(branchId);
    setMergeDialogOpen(true);
    handleActionMenuClose();
  };

  const handleMergeConfirm = () => {
    if (selectedBranchId) {
      onBranchMerge(selectedBranchId, selectedMergeStrategy);
      setMergeDialogOpen(false);
    }
  };

  const handleRollbackClick = (branchId: string) => {
    onBranchSelect(branchId);
    setRollbackDialogOpen(true);
    handleActionMenuClose();
  };

  const handleRollbackConfirm = () => {
    if (selectedBranchId) {
      onBranchRollback(selectedBranchId);
      setRollbackDialogOpen(false);
    }
  };

  const handleCopyBranchLink = async (branch: GhostBranch) => {
    if (branch.pullRequest?.url) {
      await navigator.clipboard.writeText(branch.pullRequest.url);
      // Show toast notification
    }
    handleActionMenuClose();
  };

  // Render functions
  const renderBranchCard = (branch: GhostBranch) => {
    const isSelected = branch.id === selectedBranchId;
    const isExpanded = expandedAccordions.has(branch.id);

    return (
      <Card
        key={branch.id}
        sx={{
          mb: 2,
          border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid transparent',
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            boxShadow: theme.shadows[4]
          }
        }}
        onClick={() => onBranchSelect(branch.id)}
      >
        <Accordion
          expanded={isExpanded}
          onChange={() => handleAccordionToggle(branch.id)}
          sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{ 
              '&:hover': { backgroundColor: theme.palette.action.hover },
              '& .MuiAccordionSummary-content': { alignItems: 'center' }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
              {/* Intent Icon */}
              <Avatar sx={{ bgcolor: getStatusColor(branch.status), width: 32, height: 32 }}>
                {getIntentIcon(branch.intent.type)}
              </Avatar>

              {/* Branch Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {branch.name}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ 
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {branch.intent.description}
                </Typography>
              </Box>

              {/* Status Chips */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={branch.status.replace('_', ' ')}
                  size="small"
                  sx={{ 
                    bgcolor: getStatusColor(branch.status),
                    color: 'white',
                    fontWeight: 500
                  }}
                />
                <Chip
                  label={`Risk: ${branch.metadata.riskLevel}/10`}
                  size="small"
                  sx={{ 
                    bgcolor: getRiskColor(branch.metadata.riskLevel),
                    color: 'white'
                  }}
                />
                {branch.conflicts.length > 0 && (
                  <Chip
                    label={`${branch.conflicts.length} conflicts`}
                    size="small"
                    color="error"
                    icon={<WarningIcon />}
                  />
                )}
              </Box>

              {/* Actions */}
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleActionMenuOpen(e, branch.id);
                }}
              >
                <MoreIcon />
              </IconButton>
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <BranchDetails branch={branch} />
          </AccordionDetails>
        </Accordion>
      </Card>
    );
  };

  const renderFiltersBar = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Search */}
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            placeholder="Search branches..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange({ searchTerm: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Grid>

        {/* Status Filter */}
        <Grid item xs={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              multiple
              value={filters.status}
              onChange={(e) => handleFilterChange({ 
                status: Array.isArray(e.target.value) ? e.target.value as BranchStatus[] : []
              })}
              renderValue={(selected) => `${selected.length} selected`}
            >
              {Object.values(BranchStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  <Checkbox checked={filters.status.includes(status)} />
                  <ListItemText primary={status.replace('_', ' ')} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Type Filter */}
        <Grid item xs={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              multiple
              value={filters.type}
              onChange={(e) => handleFilterChange({ 
                type: Array.isArray(e.target.value) ? e.target.value as IntentType[] : []
              })}
              renderValue={(selected) => `${selected.length} selected`}
            >
              {Object.values(IntentType).map((type) => (
                <MenuItem key={type} value={type}>
                  <Checkbox checked={filters.type.includes(type)} />
                  <ListItemText primary={type} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Sort */}
        <Grid item xs={6} md={2}>
          <FormControl fullWidth>
            <InputLabel>Sort by</InputLabel>
            <Select
              value={sortOptions.field}
              onChange={(e) => handleSortChange({ field: e.target.value as SortField })}
            >
              <MenuItem value="updatedAt">Last Updated</MenuItem>
              <MenuItem value="createdAt">Created</MenuItem>
              <MenuItem value="riskLevel">Risk Level</MenuItem>
              <MenuItem value="complexity">Complexity</MenuItem>
              <MenuItem value="reviewTime">Review Time</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Sort Direction */}
        <Grid item xs={6} md={1}>
          <IconButton
            onClick={() => handleSortChange({ 
              direction: sortOptions.direction === 'asc' ? 'desc' : 'asc' 
            })}
          >
            <SortIcon sx={{ 
              transform: sortOptions.direction === 'desc' ? 'rotate(180deg)' : 'none'
            }} />
          </IconButton>
        </Grid>

        {/* Quick Filters */}
        <Grid item xs={12} md={2}>
          <Stack direction="row" spacing={1}>
            <FormControlLabel
              control={
                <Switch
                  checked={filters.hasConflicts === true}
                  onChange={(e) => handleFilterChange({ 
                    hasConflicts: e.target.checked ? true : null 
                  })}
                />
              }
              label="Conflicts"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={filters.hasFailedTests === true}
                  onChange={(e) => handleFilterChange({ 
                    hasFailedTests: e.target.checked ? true : null 
                  })}
                />
              }
              label="Failed Tests"
            />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );

  const renderBranchList = () => (
    <Box>
      {renderFiltersBar()}
      
      {loading && <LinearProgress sx={{ mb: 2 }} />}
      
      {filteredBranches.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No branches found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your filters or create a new branch
          </Typography>
        </Paper>
      ) : (
        filteredBranches.map(renderBranchCard)
      )}
    </Box>
  );

  const renderBranchDetails = () => {
    if (!selectedBranch) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Select a branch to view details
          </Typography>
        </Paper>
      );
    }

    return (
      <Card>
        <CardContent>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Overview" />
            <Tab label="Diff" />
            <Tab label="Tests" />
            <Tab label="Conflicts" />
            <Tab label="Reviews" />
            <Tab label="Analytics" />
          </Tabs>

          {activeTab === TabValue.OVERVIEW && <BranchOverview branch={selectedBranch} />}
          {activeTab === TabValue.DIFF && <BranchDiff branch={selectedBranch} />}
          {activeTab === TabValue.TESTS && <BranchTests branch={selectedBranch} onRunTests={onRunTests} />}
          {activeTab === TabValue.CONFLICTS && (
            <BranchConflicts 
              branch={selectedBranch} 
              onResolveConflict={onResolveConflict}
            />
          )}
          {activeTab === TabValue.REVIEWS && <BranchReviews branch={selectedBranch} />}
          {activeTab === TabValue.ANALYTICS && <BranchAnalytics branch={selectedBranch} />}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Ghost Branches
        </Typography>
        <Typography variant="body2" color="text.secondary">
          AI-generated pull requests and automated workflows
        </Typography>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Branch List */}
        <Box sx={{ width: 400, borderRight: 1, borderColor: 'divider', overflow: 'auto', p: 2 }}>
          {renderBranchList()}
        </Box>

        {/* Branch Details */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {renderBranchDetails()}
        </Box>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => actionMenuBranchId && handleMergeClick(actionMenuBranchId)}>
          <ListItemIcon><MergeIcon /></ListItemIcon>
          <ListItemText>Merge</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => actionMenuBranchId && onRunTests(actionMenuBranchId)}>
          <ListItemIcon><TestIcon /></ListItemIcon>
          <ListItemText>Run Tests</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => actionMenuBranchId && onBranchRefresh(actionMenuBranchId)}>
          <ListItemIcon><RefreshIcon /></ListItemIcon>
          <ListItemText>Refresh</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => actionMenuBranchId && handleRollbackClick(actionMenuBranchId)}>
          <ListItemIcon><ReplayIcon /></ListItemIcon>
          <ListItemText>Rollback</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          const branch = branches.find(b => b.id === actionMenuBranchId);
          if (branch) handleCopyBranchLink(branch);
        }}>
          <ListItemIcon><CopyIcon /></ListItemIcon>
          <ListItemText>Copy Link</ListItemText>
        </MenuItem>
      </Menu>

      {/* Merge Dialog */}
      <Dialog open={mergeDialogOpen} onClose={() => setMergeDialogOpen(false)}>
        <DialogTitle>Merge Branch</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to merge "{selectedBranch?.name}"?
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Merge Strategy</InputLabel>
            <Select
              value={selectedMergeStrategy}
              onChange={(e) => setSelectedMergeStrategy(e.target.value as MergeType)}
            >
              <MenuItem value={MergeType.SQUASH}>Squash and merge</MenuItem>
              <MenuItem value={MergeType.MERGE_COMMIT}>Create a merge commit</MenuItem>
              <MenuItem value={MergeType.REBASE}>Rebase and merge</MenuItem>
              <MenuItem value={MergeType.FAST_FORWARD}>Fast-forward</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMergeDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleMergeConfirm} variant="contained">
            Merge
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rollback Dialog */}
      <Dialog open={rollbackDialogOpen} onClose={() => setRollbackDialogOpen(false)}>
        <DialogTitle>Rollback Branch</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The branch and all its changes will be permanently deleted.
          </Alert>
          <Typography variant="body1">
            Are you sure you want to rollback "{selectedBranch?.name}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRollbackDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRollbackConfirm} variant="contained" color="error">
            Rollback
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Branch Details Component
const BranchDetails: React.FC<{ branch: GhostBranch }> = ({ branch }) => {
  return (
    <Grid container spacing={2}>
      {/* Intent Info */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Intent
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {branch.intent.description}
        </Typography>
        
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Requirements
        </Typography>
        <List dense>
          {branch.intent.requirements.map((req, index) => (
            <ListItem key={index} sx={{ pl: 0 }}>
              <ListItemIcon sx={{ minWidth: 20 }}>
                <CheckIcon fontSize="small" color="success" />
              </ListItemIcon>
              <ListItemText 
                primary={req}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>
      </Grid>

      {/* Metadata */}
      <Grid item xs={12} md={6}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Metadata
        </Typography>
        <Stack spacing={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Complexity:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {branch.metadata.complexity}/10
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Est. Review Time:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {Math.round(branch.metadata.estimatedReviewTime)}m
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Created:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {branch.createdAt.toLocaleDateString()}
            </Typography>
          </Box>
        </Stack>

        {/* Tags */}
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 2, mb: 1 }}>
          Tags
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {branch.metadata.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
      </Grid>

      {/* Commits */}
      <Grid item xs={12}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Commits ({branch.commits.length})
        </Typography>
        <List dense>
          {branch.commits.slice(0, 3).map((commit) => (
            <ListItem key={commit.id} sx={{ pl: 0 }}>
              <ListItemIcon>
                <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                  AI
                </Avatar>
              </ListItemIcon>
              <ListItemText 
                primary={commit.message}
                secondary={`${commit.author.name} • ${commit.timestamp.toLocaleString()}`}
                primaryTypographyProps={{ variant: 'body2' }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItem>
          ))}
          {branch.commits.length > 3 && (
            <ListItem sx={{ pl: 0 }}>
              <ListItemText 
                primary={`... and ${branch.commits.length - 3} more commits`}
                primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
              />
            </ListItem>
          )}
        </List>
      </Grid>
    </Grid>
  );
};

// Branch Overview Component
const BranchOverview: React.FC<{ branch: GhostBranch }> = ({ branch }) => {
  const theme = useTheme();

  return (
    <Grid container spacing={3}>
      {/* Status Overview */}
      <Grid item xs={12} md={4}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Status</Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Chip
                label={branch.status.replace('_', ' ')}
                sx={{ 
                  bgcolor: getStatusColor(branch.status),
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 16,
                  height: 40,
                  mb: 2
                }}
              />
              <Typography variant="body2" color="text.secondary">
                Last updated {formatRelativeTime(branch.updatedAt)}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Tests Overview */}
      <Grid item xs={12} md={4}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Tests</Typography>
            {branch.tests.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No tests run yet
              </Typography>
            ) : (
              <Stack spacing={1}>
                {branch.tests.map((test) => (
                  <Box key={test.suite} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {test.status === TestStatus.PASSED && <CheckIcon color="success" fontSize="small" />}
                    {test.status === TestStatus.FAILED && <ErrorIcon color="error" fontSize="small" />}
                    {test.status === TestStatus.RUNNING && <LinearProgress sx={{ flex: 1, height: 8 }} />}
                    <Typography variant="body2">{test.suite}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {test.passed}/{test.passed + test.failed}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Risk Assessment */}
      <Grid item xs={12} md={4}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Risk Assessment</Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: getRiskColor(branch.metadata.riskLevel),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  mb: 1
                }}
              >
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  {branch.metadata.riskLevel}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Risk Level (1-10)
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Pull Request Info */}
      {branch.pullRequest && (
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Pull Request</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {branch.pullRequest.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {branch.pullRequest.description}
                  </Typography>
                  
                  {/* Labels */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {branch.pullRequest.labels.map((label) => (
                      <Chip key={label} label={label} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  {/* Checks */}
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Checks
                  </Typography>
                  <Stack spacing={0.5}>
                    {branch.pullRequest.checks.map((check) => (
                      <Box key={check.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {check.status === CheckStatus.COMPLETED && check.conclusion === 'success' && 
                          <CheckIcon color="success" fontSize="small" />}
                        {check.status === CheckStatus.FAILED && 
                          <ErrorIcon color="error" fontSize="small" />}
                        {check.status === CheckStatus.PENDING && 
                          <LinearProgress sx={{ width: 16, height: 4 }} />}
                        <Typography variant="body2">{check.name}</Typography>
                      </Box>
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
};

// Branch Diff Component
const BranchDiff: React.FC<{ branch: GhostBranch }> = ({ branch }) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const fileChanges = useMemo(() => {
    const files = new Map<string, typeof branch.changes>();
    
    for (const change of branch.changes) {
      if (!files.has(change.file)) {
        files.set(change.file, []);
      }
      files.get(change.file)!.push(change);
    }
    
    return files;
  }, [branch.changes]);

  const renderFileList = () => (
    <List>
      {Array.from(fileChanges.entries()).map(([file, changes]) => {
        const addCount = changes.filter(c => c.type === ChangeType.ADD).length;
        const modifyCount = changes.filter(c => c.type === ChangeType.MODIFY).length;
        const deleteCount = changes.filter(c => c.type === ChangeType.DELETE).length;

        return (
          <ListItem
            key={file}
            button
            selected={selectedFile === file}
            onClick={() => setSelectedFile(file)}
          >
            <ListItemIcon>
              <CodeIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText 
              primary={file}
              secondary={`+${addCount} ~${modifyCount} -${deleteCount}`}
            />
          </ListItem>
        );
      })}
    </List>
  );

  const renderFileDiff = () => {
    if (!selectedFile) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Select a file to view diff
          </Typography>
        </Box>
      );
    }

    const changes = fileChanges.get(selectedFile) || [];

    return (
      <Box>
        <Typography variant="h6" sx={{ mb: 2 }}>
          {selectedFile}
        </Typography>
        {changes.map((change) => (
          <Card key={change.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Chip
                  label={change.type}
                  size="small"
                  color={change.type === ChangeType.ADD ? 'success' : 
                         change.type === ChangeType.DELETE ? 'error' : 'primary'}
                />
                <Typography variant="body2" color="text.secondary">
                  Line {change.line}
                </Typography>
              </Box>
              <Typography variant="body2" paragraph>
                {change.description}
              </Typography>
              <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, fontFamily: 'monospace' }}>
                <pre style={{ margin: 0, fontSize: 12, whiteSpace: 'pre-wrap' }}>
                  {change.newContent}
                </pre>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  };

  return (
    <Grid container spacing={2} sx={{ height: 500 }}>
      {/* File List */}
      <Grid item xs={4}>
        <Paper sx={{ height: '100%', overflow: 'auto' }}>
          <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            Changed Files ({fileChanges.size})
          </Typography>
          {renderFileList()}
        </Paper>
      </Grid>

      {/* Diff View */}
      <Grid item xs={8}>
        <Paper sx={{ height: '100%', overflow: 'auto', p: 2 }}>
          {renderFileDiff()}
        </Paper>
      </Grid>
    </Grid>
  );
};

// Branch Tests Component
const BranchTests: React.FC<{ 
  branch: GhostBranch; 
  onRunTests: (branchId: string) => void;
}> = ({ branch, onRunTests }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Test Results</Typography>
        <Button
          variant="contained"
          startIcon={<TestIcon />}
          onClick={() => onRunTests(branch.id)}
        >
          Run Tests
        </Button>
      </Box>

      {branch.tests.length === 0 ? (
        <Alert severity="info">
          No tests have been run for this branch yet.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {branch.tests.map((test) => (
            <Grid item xs={12} md={6} key={test.suite}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">{test.suite}</Typography>
                    <Chip
                      label={test.status}
                      color={test.status === TestStatus.PASSED ? 'success' : 
                             test.status === TestStatus.FAILED ? 'error' : 'default'}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Passed</Typography>
                      <Typography variant="h6" color="success.main">{test.passed}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Failed</Typography>
                      <Typography variant="h6" color="error.main">{test.failed}</Typography>
                    </Grid>
                  </Grid>

                  {test.coverage && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Coverage: {Math.round(test.coverage * 100)}%
                      </Typography>
                      <LinearProgress 
                        variant="determinate" 
                        value={test.coverage * 100}
                        sx={{ height: 8 }}
                      />
                    </Box>
                  )}

                  {test.failures.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Failures</Typography>
                      {test.failures.map((failure, index) => (
                        <Alert key={index} severity="error" sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            <strong>{failure.test}</strong>: {failure.message}
                          </Typography>
                        </Alert>
                      ))}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Branch Conflicts Component
const BranchConflicts: React.FC<{ 
  branch: GhostBranch;
  onResolveConflict: (branchId: string, fileId: string, resolution: string) => void;
}> = ({ branch, onResolveConflict }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Merge Conflicts ({branch.conflicts.length})
      </Typography>

      {branch.conflicts.length === 0 ? (
        <Alert severity="success">
          <Typography>No merge conflicts detected!</Typography>
        </Alert>
      ) : (
        <Stack spacing={2}>
          {branch.conflicts.map((conflict, index) => (
            <Card key={index}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{conflict.file}</Typography>
                  <Chip
                    label={conflict.type}
                    color={conflict.autoResolvable ? 'warning' : 'error'}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {conflict.description}
                </Typography>

                {conflict.resolutionSuggestions.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Suggested Resolutions
                    </Typography>
                    {conflict.resolutionSuggestions.map((suggestion, suggestionIndex) => (
                      <Card key={suggestionIndex} variant="outlined" sx={{ mb: 1 }}>
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2">{suggestion.description}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              Confidence: {Math.round(suggestion.confidence * 100)}%
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => onResolveConflict(
                              branch.id, 
                              conflict.file, 
                              suggestion.resolution || suggestion.type
                            )}
                          >
                            Apply Resolution
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

// Branch Reviews Component
const BranchReviews: React.FC<{ branch: GhostBranch }> = ({ branch }) => {
  const reviews = branch.pullRequest?.reviews || [];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Code Reviews ({reviews.length})
      </Typography>

      {reviews.length === 0 ? (
        <Alert severity="info">
          No reviews yet. This branch is ready for review.
        </Alert>
      ) : (
        <Stack spacing={2}>
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {review.reviewer.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography variant="subtitle1">{review.reviewer}</Typography>
                  </Box>
                  <Chip
                    label={review.status.replace('_', ' ')}
                    color={review.status === 'approved' ? 'success' : 
                           review.status === 'changes_requested' ? 'error' : 'default'}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Reviewed on {review.submittedAt.toLocaleDateString()}
                </Typography>

                {review.comments.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Comments ({review.comments.length})
                    </Typography>
                    {review.comments.map((comment) => (
                      <Card key={comment.id} variant="outlined" sx={{ mb: 1 }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            <strong>{comment.file}:{comment.line}</strong>
                          </Typography>
                          <Typography variant="body2">{comment.body}</Typography>
                          {comment.suggestion && (
                            <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                Suggestion:
                              </Typography>
                              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                {comment.suggestion}
                              </Typography>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

// Branch Analytics Component
const BranchAnalytics: React.FC<{ branch: GhostBranch }> = ({ branch }) => {
  const metrics = useMemo(() => {
    const totalChanges = branch.changes.length;
    const fileCount = new Set(branch.changes.map(c => c.file)).size;
    const averageRisk = branch.metadata.riskLevel;
    const testCoverage = branch.tests.length > 0 
      ? branch.tests.reduce((sum, test) => sum + (test.coverage || 0), 0) / branch.tests.length
      : 0;

    return {
      totalChanges,
      fileCount,
      averageRisk,
      testCoverage: Math.round(testCoverage * 100)
    };
  }, [branch]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>Branch Analytics</Typography>

      <Grid container spacing={3}>
        {/* Metrics Cards */}
        <Grid item xs={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{metrics.totalChanges}</Typography>
              <Typography variant="body2" color="text.secondary">Total Changes</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">{metrics.fileCount}</Typography>
              <Typography variant="body2" color="text.secondary">Files Modified</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ color: getRiskColor(metrics.averageRisk) }}>
                {metrics.averageRisk}/10
              </Typography>
              <Typography variant="body2" color="text.secondary">Risk Level</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">{metrics.testCoverage}%</Typography>
              <Typography variant="body2" color="text.secondary">Test Coverage</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Timeline */}
        <Grid item xs={12}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>Timeline</Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <BranchIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body2">Branch created</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {branch.createdAt.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                {branch.commits.map((commit) => (
                  <Box key={commit.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <CodeIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{commit.message}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {commit.timestamp.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                ))}

                {branch.pullRequest && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <MergeIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2">Pull request created</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {branch.pullRequest.createdAt.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default GhostBranchPanel; 