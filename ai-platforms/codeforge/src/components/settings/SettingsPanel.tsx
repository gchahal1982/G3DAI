import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  TextField,
  Button,
  IconButton,
  Chip,
  Stack,
  Divider,
  Alert,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Tooltip,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Psychology as AIIcon,
  Security as SecurityIcon,
  Palette as ThemeIcon,
  Keyboard as KeyboardIcon,
  Extension as ExtensionIcon,
  Backup as BackupIcon,
  CloudDownload as DownloadIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ShowIcon,
  VisibilityOff as HideIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  ExpandMore as ExpandIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  Computer as LocalIcon,
  Cloud as CloudIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as StorageIcon,
  Update as UpdateIcon,
  Restore as RestoreIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

// Types and interfaces
interface SettingsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  apiKey?: string;
  endpoint?: string;
  maxTokens: number;
  temperature: number;
  costPerToken?: number;
  status: 'active' | 'disabled' | 'error';
  isLocal: boolean;
  quantization?: string;
  size?: string;
}

interface APIKeyConfig {
  provider: string;
  key: string;
  endpoint?: string;
  isValid: boolean;
  lastTested: Date;
  usage: {
    tokensThisMonth: number;
    costThisMonth: number;
    limit?: number;
  };
}

interface PrivacySettings {
  telemetryEnabled: boolean;
  crashReportsEnabled: boolean;
  usageAnalyticsEnabled: boolean;
  dataRetentionDays: number;
  encryptLocalData: boolean;
  allowCloudSync: boolean;
  shareAnonymizedData: boolean;
}

interface KeyboardShortcut {
  id: string;
  command: string;
  description: string;
  keys: string[];
  category: string;
  isCustom: boolean;
}

interface ExtensionInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  autoUpdate: boolean;
  permissions: string[];
  size: string;
  status: 'active' | 'disabled' | 'error' | 'updating';
}

// Styled components
const SettingsContainer = styled(Paper)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`
}));

const TabPanel = styled(Box)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  overflow: 'auto'
}));

const SettingsCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
}));

const StatusChip = styled(Chip)<{ status: 'active' | 'disabled' | 'error' | 'updating' }>(({ theme, status }) => ({
  backgroundColor: alpha(
    status === 'active' ? theme.palette.success.main :
    status === 'disabled' ? theme.palette.grey[500] :
    status === 'error' ? theme.palette.error.main :
    theme.palette.warning.main,
    0.1
  ),
  color: status === 'active' ? theme.palette.success.main :
         status === 'disabled' ? theme.palette.grey[500] :
         status === 'error' ? theme.palette.error.main :
         theme.palette.warning.main
}));

// Props interface
interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
  onSave: (settings: any) => void;
  models: ModelConfig[];
  apiKeys: APIKeyConfig[];
  privacy: PrivacySettings;
  shortcuts: KeyboardShortcut[];
  extensions: ExtensionInfo[];
  theme: 'light' | 'dark' | 'auto';
  onThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
  onModelToggle: (modelId: string, enabled: boolean) => void;
  onAPIKeyAdd: (provider: string, key: string, endpoint?: string) => void;
  onAPIKeyRemove: (provider: string) => void;
  onPrivacyChange: (privacy: PrivacySettings) => void;
  onShortcutChange: (shortcutId: string, keys: string[]) => void;
  onExtensionToggle: (extensionId: string, enabled: boolean) => void;
  onBackup: () => Promise<string>;
  onRestore: (data: string) => Promise<void>;
}

// Task 1: Create tabbed settings layout
export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  open,
  onClose,
  onSave,
  models,
  apiKeys,
  privacy,
  shortcuts,
  extensions,
  theme,
  onThemeChange,
  onModelToggle,
  onAPIKeyAdd,
  onAPIKeyRemove,
  onPrivacyChange,
  onShortcutChange,
  onExtensionToggle,
  onBackup,
  onRestore
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const [newApiKey, setNewApiKey] = useState({ provider: '', key: '', endpoint: '' });
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);
  const [backupData, setBackupData] = useState<string>('');
  const [restoreDialog, setRestoreDialog] = useState(false);
  const [shortcutDialog, setShortcutDialog] = useState(false);
  const [apiKeyDialog, setApiKeyDialog] = useState(false);

  // Task 2: Model management UI
  const ModelManagementTab = useMemo(() => (
    <TabPanel>
      <Typography variant="h6" gutterBottom>
        AI Model Configuration
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Configure and manage AI models for different tasks. Local models run on your device, 
        while cloud models require API keys and internet connection.
      </Typography>

      <Stack spacing={2}>
        {models.map((model) => (
          <SettingsCard key={model.id}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap={2}>
                  {model.isLocal ? <LocalIcon /> : <CloudIcon />}
                  <Box>
                    <Typography variant="subtitle1">{model.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {model.provider} • {model.isLocal ? 'Local' : 'Cloud'} 
                      {model.size && ` • ${model.size}`}
                      {model.quantization && ` • ${model.quantization}`}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <StatusChip 
                    label={model.status} 
                    status={model.status}
                    size="small"
                  />
                  <Switch
                    checked={model.enabled}
                    onChange={(e) => onModelToggle(model.id, e.target.checked)}
                  />
                </Box>
              </Box>

              {model.enabled && (
                <Box mt={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Max Tokens"
                        type="number"
                        value={model.maxTokens}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Temperature"
                        type="number"
                        value={model.temperature}
                        inputProps={{ min: 0, max: 1, step: 0.1 }}
                        size="small"
                        fullWidth
                      />
                    </Grid>
                    {!model.isLocal && (
                      <Grid item xs={12}>
                        <TextField
                          label="Custom Endpoint (Optional)"
                          value={model.endpoint || ''}
                          size="small"
                          fullWidth
                        />
                      </Grid>
                    )}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </SettingsCard>
        ))}
      </Stack>
    </TabPanel>
  ), [models, onModelToggle]);

  // Task 3: API key configuration with BYO support
  const APIKeysTab = useMemo(() => (
    <TabPanel>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6">API Keys</Typography>
          <Typography variant="body2" color="text.secondary">
            Bring your own API keys for cloud AI providers. Keys are encrypted and stored locally.
          </Typography>
        </Box>
        <Button
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setApiKeyDialog(true)}
        >
          Add API Key
        </Button>
      </Box>

      <Stack spacing={2}>
        {apiKeys.map((apiKey) => (
          <SettingsCard key={apiKey.provider}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" textTransform="capitalize">
                    {apiKey.provider}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Last tested: {apiKey.lastTested.toLocaleDateString()}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  {apiKey.isValid ? (
                    <Chip icon={<SuccessIcon />} label="Valid" color="success" size="small" />
                  ) : (
                    <Chip icon={<ErrorIcon />} label="Invalid" color="error" size="small" />
                  )}
                  <IconButton
                    size="small"
                    onClick={() => setShowApiKey(prev => ({ ...prev, [apiKey.provider]: !prev[apiKey.provider] }))}
                  >
                    {showApiKey[apiKey.provider] ? <HideIcon /> : <ShowIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onAPIKeyRemove(apiKey.provider)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>

              <Box mt={2}>
                <TextField
                  label="API Key"
                  value={showApiKey[apiKey.provider] ? apiKey.key : '*'.repeat(20)}
                  size="small"
                  fullWidth
                  disabled
                  InputProps={{
                    endAdornment: (
                      <Chip 
                        label={apiKey.isValid ? 'Valid' : 'Invalid'} 
                        size="small"
                        color={apiKey.isValid ? 'success' : 'error'}
                      />
                    )
                  }}
                />
                
                {apiKey.endpoint && (
                  <TextField
                    label="Custom Endpoint"
                    value={apiKey.endpoint}
                    size="small"
                    fullWidth
                    disabled
                    sx={{ mt: 1 }}
                  />
                )}

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="caption">
                    Tokens this month: {apiKey.usage.tokensThisMonth.toLocaleString()}
                  </Typography>
                  <Typography variant="caption">
                    Cost: ${apiKey.usage.costThisMonth.toFixed(2)}
                    {apiKey.usage.limit && ` / $${apiKey.usage.limit}`}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={apiKey.usage.limit ? (apiKey.usage.costThisMonth / apiKey.usage.limit) * 100 : 0}
                  sx={{ mt: 1 }}
                />
              </Box>
            </CardContent>
          </SettingsCard>
        ))}

        {apiKeys.length === 0 && (
          <Alert severity="info" icon={<InfoIcon />}>
            No API keys configured. Add your own API keys to use cloud AI models.
          </Alert>
        )}
      </Stack>

      {/* Add API Key Dialog */}
      <Dialog open={apiKeyDialog} onClose={() => setApiKeyDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add API Key</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Provider</InputLabel>
              <Select
                value={newApiKey.provider}
                onChange={(e) => setNewApiKey(prev => ({ ...prev, provider: e.target.value }))}
                label="Provider"
              >
                <MenuItem value="openai">OpenAI</MenuItem>
                <MenuItem value="anthropic">Anthropic</MenuItem>
                <MenuItem value="google">Google</MenuItem>
                <MenuItem value="deepseek">DeepSeek</MenuItem>
                <MenuItem value="qwen">Qwen</MenuItem>
                <MenuItem value="xai">xAI</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="API Key"
              value={newApiKey.key}
              onChange={(e) => setNewApiKey(prev => ({ ...prev, key: e.target.value }))}
              type="password"
              fullWidth
            />
            <TextField
              label="Custom Endpoint (Optional)"
              value={newApiKey.endpoint}
              onChange={(e) => setNewApiKey(prev => ({ ...prev, endpoint: e.target.value }))}
              fullWidth
              placeholder="https://api.example.com/v1"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApiKeyDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onAPIKeyAdd(newApiKey.provider, newApiKey.key, newApiKey.endpoint);
              setNewApiKey({ provider: '', key: '', endpoint: '' });
              setApiKeyDialog(false);
            }}
            variant="contained"
            disabled={!newApiKey.provider || !newApiKey.key}
          >
            Add Key
          </Button>
        </DialogActions>
      </Dialog>
    </TabPanel>
  ), [apiKeys, showApiKey, apiKeyDialog, newApiKey, onAPIKeyRemove, onAPIKeyAdd]);

  // Task 4: Privacy settings with telemetry opt-out
  const PrivacyTab = useMemo(() => (
    <TabPanel>
      <Typography variant="h6" gutterBottom>
        Privacy & Data
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Control what data is collected and how it's used. All settings respect your privacy preferences.
      </Typography>

      <SettingsCard>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Data Collection
          </Typography>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={privacy.telemetryEnabled}
                  onChange={(e) => onPrivacyChange({ ...privacy, telemetryEnabled: e.target.checked })}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Anonymous Usage Analytics</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Help improve CodeForge by sharing anonymous usage data
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={privacy.crashReportsEnabled}
                  onChange={(e) => onPrivacyChange({ ...privacy, crashReportsEnabled: e.target.checked })}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Crash Reports</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Automatically send crash reports to help fix bugs
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={privacy.usageAnalyticsEnabled}
                  onChange={(e) => onPrivacyChange({ ...privacy, usageAnalyticsEnabled: e.target.checked })}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Feature Usage Analytics</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Track which features are used to improve the product
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </CardContent>
      </SettingsCard>

      <SettingsCard>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Data Security
          </Typography>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={privacy.encryptLocalData}
                  onChange={(e) => onPrivacyChange({ ...privacy, encryptLocalData: e.target.checked })}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Encrypt Local Data</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Encrypt settings and cache data stored locally
                  </Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={privacy.allowCloudSync}
                  onChange={(e) => onPrivacyChange({ ...privacy, allowCloudSync: e.target.checked })}
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Cloud Sync</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Sync settings across devices (encrypted)
                  </Typography>
                </Box>
              }
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Data Retention</InputLabel>
              <Select
                value={privacy.dataRetentionDays}
                onChange={(e) => onPrivacyChange({ ...privacy, dataRetentionDays: e.target.value as number })}
                label="Data Retention"
              >
                <MenuItem value={7}>7 days</MenuItem>
                <MenuItem value={30}>30 days</MenuItem>
                <MenuItem value={90}>90 days</MenuItem>
                <MenuItem value={365}>1 year</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </SettingsCard>
    </TabPanel>
  ), [privacy, onPrivacyChange]);

  // Task 5: Theme customization
  const ThemeTab = useMemo(() => (
    <TabPanel>
      <Typography variant="h6" gutterBottom>
        Appearance
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Customize the look and feel of CodeForge to match your preferences.
      </Typography>

      <SettingsCard>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Theme
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Theme Mode</InputLabel>
            <Select
              value={theme}
              onChange={(e) => onThemeChange(e.target.value as 'light' | 'dark' | 'auto')}
              label="Theme Mode"
            >
              <MenuItem value="light">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: 0.5 }} />
                  Light
                </Box>
              </MenuItem>
              <MenuItem value="dark">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 16, height: 16, backgroundColor: '#121212', borderRadius: 0.5 }} />
                  Dark
                </Box>
              </MenuItem>
              <MenuItem value="auto">
                <Box display="flex" alignItems="center" gap={1}>
                  <Box sx={{ width: 16, height: 16, background: 'linear-gradient(45deg, #fff 50%, #121212 50%)', borderRadius: 0.5 }} />
                  Auto (System)
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </CardContent>
      </SettingsCard>
    </TabPanel>
  ), [theme, onThemeChange]);

  // Task 6: Keyboard shortcuts editor
  const KeyboardTab = useMemo(() => (
    <TabPanel>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6">Keyboard Shortcuts</Typography>
          <Typography variant="body2" color="text.secondary">
            Customize keyboard shortcuts for faster workflow.
          </Typography>
        </Box>
        <Button
          startIcon={<RestoreIcon />}
          variant="outlined"
          onClick={() => console.log('Reset to defaults')}
        >
          Reset to Defaults
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Command</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Shortcut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shortcuts.map((shortcut) => (
              <TableRow key={shortcut.id}>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {shortcut.command}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {shortcut.description}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" gap={0.5}>
                    {shortcut.keys.map((key, index) => (
                      <Chip key={index} label={key} size="small" variant="outlined" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => setEditingShortcut(shortcut.id)}
                  >
                    <EditIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </TabPanel>
  ), [shortcuts]);

  // Task 7: Extension settings
  const ExtensionsTab = useMemo(() => (
    <TabPanel>
      <Typography variant="h6" gutterBottom>
        Extensions
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Manage installed extensions and plugins.
      </Typography>

      <Stack spacing={2}>
        {extensions.map((extension) => (
          <SettingsCard key={extension.id}>
            <CardContent>
              <Box display="flex" justifyContent="between" alignItems="center">
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <Typography variant="subtitle1">{extension.name}</Typography>
                    <Chip label={`v${extension.version}`} size="small" variant="outlined" />
                    <StatusChip label={extension.status} status={extension.status} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {extension.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    By {extension.author} • {extension.size}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Switch
                    checked={extension.enabled}
                    onChange={(e) => onExtensionToggle(extension.id, e.target.checked)}
                  />
                  <IconButton size="small">
                    <SettingsIcon />
                  </IconButton>
                </Box>
              </Box>
              
              {extension.permissions.length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandIcon />}>
                    <Typography variant="caption">
                      Permissions ({extension.permissions.length})
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {extension.permissions.map((permission, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={permission} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              )}
            </CardContent>
          </SettingsCard>
        ))}
      </Stack>
    </TabPanel>
  ), [extensions, onExtensionToggle]);

  // Task 8: Backup/restore functionality
  const BackupTab = useMemo(() => (
    <TabPanel>
      <Typography variant="h6" gutterBottom>
        Backup & Restore
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Back up your settings and restore them on another device.
      </Typography>

      <Stack spacing={3}>
        <SettingsCard>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Export Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Create a backup file containing all your settings, API keys, and preferences.
            </Typography>
            <Button
              startIcon={<DownloadIcon />}
              variant="contained"
              onClick={async () => {
                const data = await onBackup();
                setBackupData(data);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `codeforge-backup-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Export Settings
            </Button>
          </CardContent>
        </SettingsCard>

        <SettingsCard>
          <CardContent>
            <Typography variant="subtitle1" gutterBottom>
              Import Settings
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Restore settings from a backup file. This will overwrite your current settings.
            </Typography>
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              id="restore-file-input"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const data = e.target?.result as string;
                    setBackupData(data);
                    setRestoreDialog(true);
                  };
                  reader.readAsText(file);
                }
              }}
            />
            <label htmlFor="restore-file-input">
              <Button
                startIcon={<UploadIcon />}
                variant="outlined"
                component="span"
              >
                Import Settings
              </Button>
            </label>
          </CardContent>
        </SettingsCard>
      </Stack>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialog} onClose={() => setRestoreDialog(false)}>
        <DialogTitle>Restore Settings</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will overwrite all your current settings. This action cannot be undone.
          </Alert>
          <Typography variant="body2">
            Are you sure you want to restore settings from the backup file?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialog(false)}>Cancel</Button>
          <Button
            onClick={async () => {
              await onRestore(backupData);
              setRestoreDialog(false);
              setBackupData('');
            }}
            variant="contained"
            color="warning"
          >
            Restore
          </Button>
        </DialogActions>
      </Dialog>
    </TabPanel>
  ), [backupData, restoreDialog, onBackup, onRestore]);

  // Tab configuration
  const tabs: SettingsTab[] = useMemo(() => [
    { id: 'models', label: 'AI Models', icon: <AIIcon />, component: ModelManagementTab },
    { id: 'apikeys', label: 'API Keys', icon: <LockIcon />, component: APIKeysTab },
    { id: 'privacy', label: 'Privacy', icon: <SecurityIcon />, component: PrivacyTab },
    { id: 'theme', label: 'Appearance', icon: <ThemeIcon />, component: ThemeTab },
    { id: 'keyboard', label: 'Shortcuts', icon: <KeyboardIcon />, component: KeyboardTab },
    { id: 'extensions', label: 'Extensions', icon: <ExtensionIcon />, component: ExtensionsTab },
    { id: 'backup', label: 'Backup', icon: <BackupIcon />, component: BackupTab }
  ], [ModelManagementTab, APIKeysTab, PrivacyTab, ThemeTab, KeyboardTab, ExtensionsTab, BackupTab]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', maxHeight: 800 }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SettingsIcon />
          Settings
        </Box>
      </DialogTitle>
      
      <SettingsContainer>
        <Tabs
          value={activeTab}
          onChange={(_, newTab) => setActiveTab(newTab)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.id}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              value={index}
            />
          ))}
        </Tabs>

        {tabs[activeTab]?.component}
      </SettingsContainer>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            onSave({
              models,
              apiKeys,
              privacy,
              shortcuts,
              extensions,
              theme
            });
            onClose();
          }}
          variant="contained"
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SettingsPanel; 