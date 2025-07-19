import React, { useState, useEffect, useMemo } from 'react';
// @ts-ignore - External package without types
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Rating,
  Avatar,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
// @ts-ignore - External package without types
import {
  Search as SearchIcon,
  GetApp as InstallIcon,
  Update as UpdateIcon,
  Delete as UninstallIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  Security as SecurityIcon,
  Code as CodeIcon,
  Palette as ThemeIcon,
  Extension as ExtensionIcon,
  Language as LanguageIcon,
  BugReport as BugReportIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  MonetizationOn as PaidIcon,
  Lock as PrivateIcon
} from '@mui/icons-material';

import { PluginManifest, PluginCategory } from '../../sdk/PluginAPI';

export interface MarketplacePlugin extends PluginManifest {
  // Marketplace-specific fields
  downloads: number;
  rating: number;
  reviewCount: number;
  screenshots: string[];
  changelog: string;
  publisher: {
    id: string;
    name: string;
    avatar?: string;
    verified: boolean;
    website?: string;
  };
  tags: string[];
  featured: boolean;
  trending: boolean;
  lastUpdated: string;
  publishedDate: string;
  size: number; // in bytes
  status: 'active' | 'deprecated' | 'suspended';
  security: {
    scanned: boolean;
    vulnerabilities: number;
    lastScanDate: string;
  };
}

export interface InstalledPlugin extends MarketplacePlugin {
  installed: boolean;
  installedVersion: string;
  updateAvailable: boolean;
  enabled: boolean;
}

interface MarketplaceStoreProps {
  onInstallPlugin: (plugin: MarketplacePlugin) => Promise<void>;
  onUninstallPlugin: (pluginId: string) => Promise<void>;
  onUpdatePlugin: (pluginId: string) => Promise<void>;
  onTogglePlugin: (pluginId: string, enabled: boolean) => Promise<void>;
  installedPlugins: InstalledPlugin[];
}

const MarketplaceStore: React.FC<MarketplaceStoreProps> = ({
  onInstallPlugin,
  onUninstallPlugin,
  onUpdatePlugin,
  onTogglePlugin,
  installedPlugins
}) => {
  const [plugins, setPlugins] = useState<MarketplacePlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PluginCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'downloads' | 'rating' | 'updated' | 'name'>('downloads');
  const [filterBy, setFilterBy] = useState<'all' | 'free' | 'paid' | 'verified'>('all');
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedPlugin, setSelectedPlugin] = useState<MarketplacePlugin | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const categories: { value: PluginCategory | 'all'; label: string; icon: React.ReactNode }[] = [
    { value: 'all', label: 'All Categories', icon: <ExtensionIcon /> },
    { value: 'productivity', label: 'Productivity', icon: <CodeIcon /> },
    { value: 'language-support', label: 'Languages', icon: <LanguageIcon /> },
    { value: 'themes', label: 'Themes', icon: <ThemeIcon /> },
    { value: 'debuggers', label: 'Debuggers', icon: <BugReportIcon /> },
    { value: 'linters', label: 'Linters', icon: <SecurityIcon /> },
    { value: 'ai-models', label: 'AI Models', icon: <ExtensionIcon /> }
  ];

  useEffect(() => {
    loadPlugins();
    loadFavorites();
  }, []);

  const loadPlugins = async () => {
    setLoading(true);
    try {
      // Simulate API call to marketplace
      const mockPlugins: MarketplacePlugin[] = [
        {
          id: 'theme-dark-plus',
          name: 'Dark+ Theme',
          version: '1.2.0',
          description: 'Beautiful dark theme with syntax highlighting',
          author: { name: 'VS Code Team', email: 'vscode@microsoft.com' },
          license: 'MIT',
          keywords: ['theme', 'dark', 'syntax'],
          categories: ['themes'],
          engines: { aura: '^1.0.0' },
          main: 'extension.js',
          permissions: ['editor:read'],
          hooks: ['onThemeChange'],
          extensionPoints: [],
          compatibility: {
            platforms: ['windows', 'macos', 'linux'],
            architectures: ['x64', 'arm64'],
            minAuraVersion: '1.0.0'
          },
          checksum: 'abc123',
          publishedAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-20T15:30:00Z',
          downloads: 25000,
          rating: 4.8,
          reviewCount: 120,
          screenshots: ['/screenshots/theme1.png'],
          changelog: 'Added new color schemes for better readability',
          publisher: {
            id: 'microsoft',
            name: 'Microsoft',
            verified: true,
            website: 'https://microsoft.com'
          },
          tags: ['popular', 'recommended'],
          featured: true,
          trending: false,
          lastUpdated: '2024-01-20T15:30:00Z',
          publishedDate: '2024-01-15T10:00:00Z',
          size: 2048000,
          status: 'active',
          security: {
            scanned: true,
            vulnerabilities: 0,
            lastScanDate: '2024-01-20T00:00:00Z'
          },
          pricing: { model: 'free' }
        },
        {
          id: 'ai-copilot-pro',
          name: 'AI Copilot Pro',
          version: '2.1.0',
          description: 'Advanced AI-powered code completion and generation',
          author: { name: 'Aura Inc', email: 'support@aura.dev' },
          license: 'Commercial',
          keywords: ['ai', 'completion', 'copilot'],
          categories: ['ai-models', 'productivity'],
          engines: { aura: '^1.0.0' },
          main: 'extension.js',
          permissions: ['ai:inference', 'editor:write', 'network:http'],
          hooks: ['onCompletion', 'onSave'],
          extensionPoints: [],
          compatibility: {
            platforms: ['windows', 'macos', 'linux'],
            architectures: ['x64', 'arm64'],
            minAuraVersion: '1.0.0'
          },
          checksum: 'def456',
          publishedAt: '2024-01-10T08:00:00Z',
          updatedAt: '2024-01-25T12:00:00Z',
          downloads: 15000,
          rating: 4.6,
          reviewCount: 89,
          screenshots: ['/screenshots/copilot1.png', '/screenshots/copilot2.png'],
          changelog: 'Improved completion accuracy and added new models',
          publisher: {
            id: 'aura',
            name: 'Aura Inc',
            verified: true,
            website: 'https://aura.dev'
          },
          tags: ['premium', 'ai'],
          featured: true,
          trending: true,
          lastUpdated: '2024-01-25T12:00:00Z',
          publishedDate: '2024-01-10T08:00:00Z',
          size: 15728640,
          status: 'active',
          security: {
            scanned: true,
            vulnerabilities: 0,
            lastScanDate: '2024-01-25T00:00:00Z'
          },
          pricing: { model: 'paid', price: 19.99, currency: 'USD' }
        }
        // Add more mock plugins...
      ];

      setPlugins(mockPlugins);
    } catch (error) {
      console.error('Failed to load plugins:', error);
      setSnackbar({ open: true, message: 'Failed to load plugins', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    // Load from localStorage
    const saved = localStorage.getItem('marketplace-favorites');
    if (saved) {
      setFavorites(new Set(JSON.parse(saved)));
    }
  };

  const saveFavorites = (newFavorites: Set<string>) => {
    localStorage.setItem('marketplace-favorites', JSON.stringify(Array.from(newFavorites)));
    setFavorites(newFavorites);
  };

  const toggleFavorite = (pluginId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(pluginId)) {
      newFavorites.delete(pluginId);
    } else {
      newFavorites.add(pluginId);
    }
    saveFavorites(newFavorites);
  };

  const filteredPlugins = useMemo(() => {
    let filtered = plugins;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(plugin =>
        plugin.name.toLowerCase().includes(query) ||
        plugin.description.toLowerCase().includes(query) ||
        plugin.tags.some(tag => tag.toLowerCase().includes(query)) ||
        plugin.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(plugin => plugin.categories.includes(selectedCategory));
    }

    // Apply pricing filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(plugin => {
        switch (filterBy) {
          case 'free':
            return plugin.pricing?.model === 'free';
          case 'paid':
            return plugin.pricing?.model !== 'free';
          case 'verified':
            return plugin.publisher.verified;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'downloads':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'updated':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [plugins, searchQuery, selectedCategory, filterBy, sortBy]);

  const getTabPlugins = (tab: number) => {
    switch (tab) {
      case 0: // Browse
        return filteredPlugins;
      case 1: // Installed
        return installedPlugins;
      case 2: // Favorites
        return plugins.filter(plugin => favorites.has(plugin.id));
      case 3: // Updates
        return installedPlugins.filter(plugin => plugin.updateAvailable);
      default:
        return [];
    }
  };

  const handleInstall = async (plugin: MarketplacePlugin) => {
    try {
      await onInstallPlugin(plugin);
      setSnackbar({ open: true, message: `${plugin.name} installed successfully`, severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: `Failed to install ${plugin.name}`, severity: 'error' });
    }
  };

  const handleUninstall = async (pluginId: string) => {
    try {
      await onUninstallPlugin(pluginId);
      setSnackbar({ open: true, message: 'Plugin uninstalled successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to uninstall plugin', severity: 'error' });
    }
  };

  const handleUpdate = async (pluginId: string) => {
    try {
      await onUpdatePlugin(pluginId);
      setSnackbar({ open: true, message: 'Plugin updated successfully', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update plugin', severity: 'error' });
    }
  };

  const isInstalled = (pluginId: string) => {
    return installedPlugins.some(p => p.id === pluginId);
  };

  const getInstalledPlugin = (pluginId: string) => {
    return installedPlugins.find(p => p.id === pluginId);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getCategoryIcon = (category: PluginCategory) => {
    const categoryInfo = categories.find(c => c.value === category);
    return categoryInfo?.icon || <ExtensionIcon />;
  };

  const renderPluginCard = (plugin: MarketplacePlugin) => {
    const installed = isInstalled(plugin.id);
    const installedPlugin = getInstalledPlugin(plugin.id);

    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={plugin.id}>
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
              <Box display="flex" alignItems="center" gap={1}>
                {getCategoryIcon(plugin.categories[0])}
                <Typography variant="h6" component="h3" noWrap>
                  {plugin.name}
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => toggleFavorite(plugin.id)}
                color={favorites.has(plugin.id) ? 'error' : 'default'}
              >
                {favorites.has(plugin.id) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
            </Box>

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Avatar src={plugin.publisher.avatar} sx={{ width: 24, height: 24 }}>
                {plugin.publisher.name[0]}
              </Avatar>
              <Typography variant="body2" color="textSecondary">
                {plugin.publisher.name}
              </Typography>
              {plugin.publisher.verified && (
                <VerifiedIcon color="primary" sx={{ fontSize: 16 }} />
              )}
            </Box>

            <Typography variant="body2" color="textSecondary" sx={{ mb: 2, minHeight: 40 }}>
              {plugin.description}
            </Typography>

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Rating value={plugin.rating} precision={0.1} size="small" readOnly />
              <Typography variant="caption">
                ({plugin.reviewCount})
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <DownloadIcon fontSize="small" color="action" />
              <Typography variant="caption">
                {plugin.downloads.toLocaleString()} downloads
              </Typography>
            </Box>

            <Box display="flex" gap={0.5} mb={2} flexWrap="wrap">
              {plugin.categories.slice(0, 2).map((category) => (
                <Chip
                  key={category}
                  label={category.replace('-', ' ')}
                  size="small"
                  variant="outlined"
                />
              ))}
              {plugin.pricing?.model !== 'free' && (
                <Chip
                  icon={<PaidIcon />}
                  label={`$${plugin.pricing?.price}`}
                  size="small"
                  color="warning"
                />
              )}
              {plugin.featured && (
                <Chip
                  label="Featured"
                  size="small"
                  color="primary"
                />
              )}
            </Box>

            {plugin.security.vulnerabilities > 0 && (
              <Alert severity="warning" sx={{ mb: 1 }}>
                {plugin.security.vulnerabilities} security issue(s) found
              </Alert>
            )}
          </CardContent>

          <CardActions>
            <Box display="flex" justifyContent="space-between" width="100%">
              {installed ? (
                <Box display="flex" gap={1}>
                  {installedPlugin?.updateAvailable && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<UpdateIcon />}
                      onClick={() => handleUpdate(plugin.id)}
                    >
                      Update
                    </Button>
                  )}
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<UninstallIcon />}
                    onClick={() => handleUninstall(plugin.id)}
                  >
                    Uninstall
                  </Button>
                </Box>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<InstallIcon />}
                  onClick={() => handleInstall(plugin)}
                  disabled={plugin.status !== 'active'}
                >
                  Install
                </Button>
              )}

              <Button
                size="small"
                variant="outlined"
                startIcon={<InfoIcon />}
                onClick={() => setSelectedPlugin(plugin)}
              >
                Details
              </Button>
            </Box>
          </CardActions>
        </Card>
      </Grid>
    );
  };

  const renderFilters = () => (
    <Box display="flex" gap={2} mb={3} flexWrap="wrap" alignItems="center">
      <TextField
        placeholder="Search plugins..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
        sx={{ minWidth: 300 }}
      />

      <FormControl sx={{ minWidth: 150 }}>
        <InputLabel>Category</InputLabel>
        <Select
          value={selectedCategory}
          onChange={(e: any) => setSelectedCategory(e.target.value)}
          label="Category"
        >
          {categories.map(category => (
            <MenuItem key={category.value} value={category.value}>
              <Box display="flex" alignItems="center" gap={1}>
                {category.icon}
                {category.label}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Sort by</InputLabel>
        <Select
          value={sortBy}
          onChange={(e: any) => setSortBy(e.target.value)}
          label="Sort by"
        >
          <MenuItem value="downloads">Downloads</MenuItem>
          <MenuItem value="rating">Rating</MenuItem>
          <MenuItem value="updated">Updated</MenuItem>
          <MenuItem value="name">Name</MenuItem>
        </Select>
      </FormControl>

      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Filter</InputLabel>
        <Select
          value={filterBy}
          onChange={(e: any) => setFilterBy(e.target.value)}
          label="Filter"
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="free">Free</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
          <MenuItem value="verified">Verified</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading marketplace...
        </Typography>
      </Box>
    );
  }

  const tabPlugins = getTabPlugins(currentTab);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Aura Marketplace
      </Typography>

      <Tabs value={currentTab} onChange={(_, newValue) => setCurrentTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Browse" />
        <Tab 
          label={
            <Badge badgeContent={installedPlugins.length} color="primary">
              Installed
            </Badge>
          }
        />
        <Tab 
          label={
            <Badge badgeContent={favorites.size} color="secondary">
              Favorites
            </Badge>
          }
        />
        <Tab 
          label={
            <Badge badgeContent={installedPlugins.filter(p => p.updateAvailable).length} color="error">
              Updates
            </Badge>
          }
        />
      </Tabs>

      {currentTab === 0 && renderFilters()}

      <Typography variant="h6" gutterBottom>
        {currentTab === 0 && `${tabPlugins.length} plugins found`}
        {currentTab === 1 && `${tabPlugins.length} installed plugins`}
        {currentTab === 2 && `${tabPlugins.length} favorite plugins`}
        {currentTab === 3 && `${tabPlugins.length} updates available`}
      </Typography>

      <Grid container spacing={3}>
        {tabPlugins.map(plugin => renderPluginCard(plugin))}
      </Grid>

      {tabPlugins.length === 0 && (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="textSecondary">
            No plugins found
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Try adjusting your search criteria or browse different categories
          </Typography>
        </Box>
      )}

      {/* Plugin Details Dialog */}
      <Dialog
        open={!!selectedPlugin}
        onClose={() => setSelectedPlugin(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedPlugin && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" gap={2}>
                {getCategoryIcon(selectedPlugin.categories[0])}
                <Box>
                  <Typography variant="h6">{selectedPlugin.name}</Typography>
                  <Typography variant="subtitle2" color="textSecondary">
                    by {selectedPlugin.publisher.name}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box display="flex" gap={2} mb={2}>
                <Chip label={`v${selectedPlugin.version}`} />
                <Chip label={formatFileSize(selectedPlugin.size)} />
                <Chip 
                  label={selectedPlugin.pricing?.model === 'free' ? 'Free' : `$${selectedPlugin.pricing?.price}`}
                  color={selectedPlugin.pricing?.model === 'free' ? 'success' : 'warning'}
                />
              </Box>

              <Typography variant="body1" paragraph>
                {selectedPlugin.description}
              </Typography>

              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Rating value={selectedPlugin.rating} precision={0.1} readOnly />
                <Typography variant="body2">
                  {selectedPlugin.rating} ({selectedPlugin.reviewCount} reviews)
                </Typography>
                <Typography variant="body2">
                  {selectedPlugin.downloads.toLocaleString()} downloads
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Permissions</Typography>
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                {selectedPlugin.permissions.map(permission => (
                  <Chip key={permission} label={permission} size="small" variant="outlined" />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>Categories</Typography>
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                {selectedPlugin.categories.map(category => (
                  <Chip 
                    key={category} 
                    label={category.replace('-', ' ')} 
                    size="small" 
                    icon={getCategoryIcon(category)}
                  />
                ))}
              </Box>

              <Typography variant="h6" gutterBottom>Security</Typography>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <SecurityIcon color={selectedPlugin.security.vulnerabilities === 0 ? 'success' : 'error'} />
                <Typography variant="body2">
                  {selectedPlugin.security.vulnerabilities === 0 
                    ? 'No known vulnerabilities' 
                    : `${selectedPlugin.security.vulnerabilities} vulnerabilities found`}
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>Recent Changes</Typography>
              <Typography variant="body2">{selectedPlugin.changelog}</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedPlugin(null)}>Close</Button>
              {!isInstalled(selectedPlugin.id) ? (
                <Button
                  variant="contained"
                  startIcon={<InstallIcon />}
                  onClick={() => {
                    handleInstall(selectedPlugin);
                    setSelectedPlugin(null);
                  }}
                >
                  Install
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<UninstallIcon />}
                  onClick={() => {
                    handleUninstall(selectedPlugin.id);
                    setSelectedPlugin(null);
                  }}
                >
                  Uninstall
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MarketplaceStore; 