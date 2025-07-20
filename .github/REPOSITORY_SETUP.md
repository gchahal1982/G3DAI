# Repository Setup Guide

This document explains how to configure your GitHub repository for the Aura VS Code Fork CI/CD pipeline.

## Required Repository Secrets

To enable marketplace publishing, configure these secrets in your repository settings (`Settings > Secrets and variables > Actions`):

### 📦 Marketplace Publishing Secrets

1. **`VSCODE_MARKETPLACE_TOKEN`** (Required for VS Code Marketplace)
   - Go to [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
   - Create a Personal Access Token with `Marketplace (publish)` scope
   - Add the token as a repository secret

2. **`OPENVSX_TOKEN`** (Required for Open VSX Registry)
   - Go to [Open VSX Registry](https://open-vsx.org/)
   - Create a Personal Access Token
   - Add the token as a repository secret

## Repository Variables

Configure these variables in your repository settings (`Settings > Secrets and variables > Actions > Variables`):

### 🚀 Publishing Control

1. **`ENABLE_MARKETPLACE_PUBLISHING`**
   - Set to `'true'` to enable automatic publishing on main branch pushes
   - Set to `'false'` or leave unset to only publish on releases
   - **Default behavior**: Only publishes on release tags (v*)

## Setup Steps

### 1. Configure VS Code Marketplace Publishing

```bash
# 1. Visit: https://marketplace.visualstudio.com/manage
# 2. Sign in with your Microsoft account
# 3. Create a new publisher or use existing one
# 4. Generate a Personal Access Token:
#    - Organization: All accessible organizations
#    - Scopes: Marketplace (publish)
# 5. Copy the token and add as VSCODE_MARKETPLACE_TOKEN secret
```

### 2. Configure Open VSX Registry Publishing

```bash
# 1. Visit: https://open-vsx.org/
# 2. Sign in with your GitHub account
# 3. Go to User Settings > Access Tokens
# 4. Generate a new token with publish scope
# 5. Copy the token and add as OPENVSX_TOKEN secret
```

### 3. Configure Publishing Behavior

```bash
# Option A: Automatic publishing on main branch (aggressive)
# Add repository variable: ENABLE_MARKETPLACE_PUBLISHING = 'true'

# Option B: Only publish on releases (recommended)
# Don't set ENABLE_MARKETPLACE_PUBLISHING or set to 'false'
```

## Publishing Triggers

The CI/CD pipeline will publish extensions to marketplaces when:

1. **Release Events**: When you create a release with a tag starting with `v` (e.g., `v1.0.0`)
2. **Manual Trigger**: When `ENABLE_MARKETPLACE_PUBLISHING` is set to `'true'` and you push to the main branch

## Security Considerations

- ✅ Secrets are encrypted and only available during workflow execution
- ✅ Token access is logged and auditable
- ✅ Failed publishing attempts don't fail the entire CI/CD pipeline
- ✅ Missing secrets result in graceful skipping with informative messages

## Troubleshooting

### Publishing is being skipped

```bash
# Check if secrets are configured:
# 1. Go to Settings > Secrets and variables > Actions
# 2. Verify VSCODE_MARKETPLACE_TOKEN and OPENVSX_TOKEN are listed
# 3. Check the workflow logs for specific error messages
```

### Token authentication failed

```bash
# For VS Code Marketplace:
# 1. Verify token has 'Marketplace (publish)' scope
# 2. Ensure publisher account is active
# 3. Check token hasn't expired

# For Open VSX Registry:
# 1. Verify token has 'publish' scope
# 2. Ensure account has publishing permissions
```

### Extensions not found for publishing

```bash
# The pipeline expects built extension packages in:
# marketplace-packages/aura-extensions-linux-x64/
# 
# Ensure the build phase completed successfully before publishing
```

## Testing Configuration

You can test your configuration by:

1. **Creating a test release**: Create a release with tag `v0.0.1-test`
2. **Checking workflow logs**: Monitor the "Marketplace Publishing Status" step
3. **Dry run**: Set up secrets but keep `ENABLE_MARKETPLACE_PUBLISHING` unset initially

## Support

If you encounter issues:

1. Check the [GitHub Actions logs](../../actions) for detailed error messages
2. Verify all secrets and variables are configured correctly
3. Ensure your tokens have the required permissions
4. Test with a minimal release first

---

**Note**: This setup is only required if you want to publish extensions to public marketplaces. The CI/CD pipeline will work without these configurations, but publishing steps will be skipped. 