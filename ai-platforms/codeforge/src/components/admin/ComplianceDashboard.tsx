import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore - External package without types
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  IconButton,
  Tooltip,
  Badge,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress
} from '@mui/material';
// @ts-ignore - External package without types
import {
  Security as SecurityIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  Timeline as TimelineIcon,
  Assessment as AssessmentIcon,
  Notifications as NotificationsIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayArrowIcon,
  Stop as StopIcon
} from '@mui/icons-material';
// @ts-ignore - External package without types
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// @ts-ignore - External package without types
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
// @ts-ignore - External package without types
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
// @ts-ignore - External package without types
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import SOC2Manager, {
  AuditTrail,
  ChangeRecord,
  AccessLog,
  ComplianceReport,
  ComplianceFinding,
  ComplianceControl,
  RemediationWorkflow
} from '../../lib/compliance/SOC2Manager';

interface ComplianceDashboardProps {
  soc2Manager: SOC2Manager;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({ soc2Manager }) => {
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditTrail[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [findings, setFindings] = useState<ComplianceFinding[]>([]);
  const [workflows, setWorkflows] = useState<RemediationWorkflow[]>([]);
  const [reports, setReports] = useState<ComplianceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  
  // Filter states
  const [auditFilter, setAuditFilter] = useState({
    severity: '',
    category: '',
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
    searchQuery: ''
  });
  
  // Dialog states
  const [reportDialog, setReportDialog] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    type: 'soc2_type2' as ComplianceReport['reportType'],
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
    name: ''
  });
  const [evidenceDialog, setEvidenceDialog] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState<any>(null);

  // Color schemes
  const severityColors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
    critical: '#9c27b0'
  };

  const statusColors = {
    passing: '#4caf50',
    failing: '#f44336',
    warning: '#ff9800',
    not_tested: '#9e9e9e'
  };

  useEffect(() => {
    loadDashboardData();
    
    // Setup event listeners
    soc2Manager.on('auditEvent', handleAuditEvent);
    soc2Manager.on('accessEvent', handleAccessEvent);
    soc2Manager.on('complianceViolation', handleComplianceViolation);
    soc2Manager.on('controlExecuted', handleControlExecuted);
    
    return () => {
      soc2Manager.removeAllListeners();
    };
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await soc2Manager.getComplianceDashboard();
      setDashboardData(data);
      setWorkflows(data.activeWorkflows);
      
      // Simulate loading other data (in real implementation, these would be API calls)
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setLoading(false);
    }
  };

  const handleAuditEvent = (event: AuditTrail) => {
    setAuditLogs(prev => [event, ...prev.slice(0, 999)]);
  };

  const handleAccessEvent = (event: AccessLog) => {
    setAccessLogs(prev => [event, ...prev.slice(0, 999)]);
  };

  const handleComplianceViolation = (data: { event: AuditTrail; violations: string[] }) => {
    const alert = {
      id: Date.now(),
      severity: 'error' as const,
      title: 'Compliance Violation Detected',
      message: `${data.violations.join(', ')} - User: ${data.event.userId}`,
      timestamp: new Date().toISOString()
    };
    setAlerts(prev => [alert, ...prev.slice(0, 49)]);
  };

  const handleControlExecuted = (data: { controlId: string; status: string }) => {
    if (data.status === 'failing') {
      const alert = {
        id: Date.now(),
        severity: 'warning' as const,
        title: 'Control Failure',
        message: `Control ${data.controlId} is not operating effectively`,
        timestamp: new Date().toISOString()
      };
      setAlerts(prev => [alert, ...prev.slice(0, 49)]);
    }
  };

  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      if (auditFilter.severity && log.severity !== auditFilter.severity) return false;
      if (auditFilter.category && log.category !== auditFilter.category) return false;
      if (auditFilter.dateFrom && new Date(log.timestamp) < auditFilter.dateFrom) return false;
      if (auditFilter.dateTo && new Date(log.timestamp) > auditFilter.dateTo) return false;
      if (auditFilter.searchQuery) {
        const query = auditFilter.searchQuery.toLowerCase();
        return log.action.toLowerCase().includes(query) || 
               log.resource.toLowerCase().includes(query) ||
               log.userId.toLowerCase().includes(query);
      }
      return true;
    });
  }, [auditLogs, auditFilter]);

  const handleGenerateReport = async () => {
    try {
      const report = await soc2Manager.generateReport(
        reportConfig.type,
        {
          startDate: reportConfig.startDate.toISOString(),
          endDate: reportConfig.endDate.toISOString()
        },
        'compliance-admin' // In real app, get from user context
      );
      
      setReports(prev => [report, ...prev]);
      setReportDialog(false);
      
      // Show success alert
      const alert = {
        id: Date.now(),
        severity: 'success' as const,
        title: 'Report Generated',
        message: `${report.reportType} report generated successfully`,
        timestamp: new Date().toISOString()
      };
      setAlerts(prev => [alert, ...prev.slice(0, 49)]);
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    try {
      const filePath = await soc2Manager.exportAuditData(
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        new Date().toISOString(),
        format
      );
      
      // In a real app, would trigger download
      const alert = {
        id: Date.now(),
        severity: 'info' as const,
        title: 'Export Complete',
        message: `Audit data exported to ${filePath}`,
        timestamp: new Date().toISOString()
      };
      setAlerts(prev => [alert, ...prev.slice(0, 49)]);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const renderOverviewTab = () => (
    <Grid container spacing={3}>
      {/* Compliance Score Card */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" color="primary">
                  {dashboardData?.complianceScore || 0}%
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Compliance Score
                </Typography>
              </Box>
              <CheckCircleIcon color="primary" sx={{ fontSize: 40 }} />
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={dashboardData?.complianceScore || 0}
              sx={{ mt: 2 }}
            />
          </CardContent>
        </Card>
      </Grid>

      {/* Controls Status */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Controls Status</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {Object.entries(dashboardData?.controlsStatus || {}).map(([status, count]) => (
                <Box key={status} display="flex" justifyContent="space-between" alignItems="center">
                  <Chip 
                    label={status.replace('_', ' ')}
                    color={status === 'passing' ? 'success' : status === 'failing' ? 'error' : 'warning'}
                    size="small"
                  />
                  <Typography variant="body2">{count as number}</Typography>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Active Workflows */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" color="secondary">
                  {workflows.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Active Workflows
                </Typography>
              </Box>
              <TimelineIcon color="secondary" sx={{ fontSize: 40 }} />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Alerts */}
      <Grid item xs={12} md={3}>
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="h4" color="error">
                  {alerts.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Recent Alerts
                </Typography>
              </Box>
              <Badge badgeContent={alerts.length} color="error">
                <NotificationsIcon sx={{ fontSize: 40 }} />
              </Badge>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Compliance Trends Chart */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Compliance Trends</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={[
                { month: 'Jan', score: 85 },
                { month: 'Feb', score: 88 },
                { month: 'Mar', score: 92 },
                { month: 'Apr', score: 95 },
                { month: 'May', score: 97 },
                { month: 'Jun', score: dashboardData?.complianceScore || 98 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="score" stroke="#2196f3" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Alerts */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Recent Alerts</Typography>
            <Box maxHeight={300} overflow="auto">
              {alerts.slice(0, 10).map((alert) => (
                <Alert key={alert.id} severity={alert.severity} sx={{ mb: 1 }}>
                  <Typography variant="body2">{alert.message}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(alert.timestamp).toLocaleString()}
                  </Typography>
                </Alert>
              ))}
              {alerts.length === 0 && (
                <Typography variant="body2" color="textSecondary" textAlign="center">
                  No recent alerts
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderAuditLogsTab = () => (
    <Box>
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="end">
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Severity</InputLabel>
                <Select
                  value={auditFilter.severity}
                  onChange={(e: any) => setAuditFilter(prev => ({ ...prev, severity: e.target.value }))}
                  label="Severity"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={auditFilter.category}
                  onChange={(e) => setAuditFilter(prev => ({ ...prev, category: e.target.value }))}
                  label="Category"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="access">Access</MenuItem>
                  <MenuItem value="data">Data</MenuItem>
                  <MenuItem value="system">System</MenuItem>
                  <MenuItem value="security">Security</MenuItem>
                  <MenuItem value="compliance">Compliance</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                value={auditFilter.searchQuery}
                onChange={(e) => setAuditFilter(prev => ({ ...prev, searchQuery: e.target.value }))}
                placeholder="Search actions, resources, users..."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date From"
                  value={auditFilter.dateFrom}
                  onChange={(date) => setAuditFilter(prev => ({ ...prev, dateFrom: date }))}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setAuditFilter({
                  severity: '',
                  category: '',
                  dateFrom: null,
                  dateTo: null,
                  searchQuery: ''
                })}
                fullWidth
              >
                Clear
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="between" alignItems="center" mb={2}>
            <Typography variant="h6">
              Audit Logs ({filteredAuditLogs.length})
            </Typography>
            <Box>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportData('csv')}
                sx={{ mr: 1 }}
              >
                Export CSV
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => handleExportData('json')}
              >
                Export JSON
              </Button>
            </Box>
          </Box>
          
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Resource</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>IP Address</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAuditLogs.slice(0, 100).map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(log.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{log.userId}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.resource}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.severity}
                        size="small"
                        sx={{ backgroundColor: severityColors[log.severity], color: 'white' }}
                      />
                    </TableCell>
                    <TableCell>{log.category}</TableCell>
                    <TableCell>{log.ipAddress}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={() => {
                            setSelectedEvidence(log);
                            setEvidenceDialog(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );

  const renderReportsTab = () => (
    <Box>
      <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
        <Typography variant="h5">Compliance Reports</Typography>
        <Button
          variant="contained"
          startIcon={<AssessmentIcon />}
          onClick={() => setReportDialog(true)}
        >
          Generate Report
        </Button>
      </Box>

      <Grid container spacing={3}>
        {reports.map((report) => (
          <Grid item xs={12} md={6} lg={4} key={report.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {report.reportType.replace('_', ' ').toUpperCase()}
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}
                </Typography>
                <Box display="flex" justifyContent="between" alignItems="center" mt={2}>
                  <Chip
                    label={report.status}
                    color={report.status === 'published' ? 'success' : 'default'}
                    size="small"
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<DownloadIcon />}
                  >
                    Download
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading compliance dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Compliance Dashboard
      </Typography>

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Audit Logs" />
        <Tab label="Access Logs" />
        <Tab label="Findings" />
        <Tab label="Reports" />
        <Tab label="Controls" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        {renderOverviewTab()}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {renderAuditLogsTab()}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography>Access Logs - To be implemented</Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography>Findings - To be implemented</Typography>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        {renderReportsTab()}
      </TabPanel>

      <TabPanel value={tabValue} index={5}>
        <Typography>Controls - To be implemented</Typography>
      </TabPanel>

      {/* Report Generation Dialog */}
      <Dialog open={reportDialog} onClose={() => setReportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Compliance Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportConfig.type}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, type: e.target.value as any }))}
                  label="Report Type"
                >
                  <MenuItem value="soc2_type1">SOC 2 Type I</MenuItem>
                  <MenuItem value="soc2_type2">SOC 2 Type II</MenuItem>
                  <MenuItem value="audit_summary">Audit Summary</MenuItem>
                  <MenuItem value="control_effectiveness">Control Effectiveness</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={reportConfig.startDate}
                  onChange={(date) => setReportConfig(prev => ({ ...prev, startDate: date || new Date() }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={reportConfig.endDate}
                  onChange={(date) => setReportConfig(prev => ({ ...prev, endDate: date || new Date() }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button onClick={handleGenerateReport} variant="contained">
            Generate Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* Evidence Details Dialog */}
      <Dialog open={evidenceDialog} onClose={() => setEvidenceDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Event Details</DialogTitle>
        <DialogContent>
          {selectedEvidence && (
            <Box>
              <Typography variant="h6" gutterBottom>Audit Event Details</Typography>
              <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, overflow: 'auto' }}>
                {JSON.stringify(selectedEvidence, null, 2)}
              </pre>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEvidenceDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ComplianceDashboard; 