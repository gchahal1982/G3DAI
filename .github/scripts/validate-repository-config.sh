#!/bin/bash

# ==============================================================================
# Aura Repository Configuration Validator
# ==============================================================================
# 
# This script helps validate that your repository is properly configured
# for the Aura VS Code Fork CI/CD pipeline and marketplace publishing.
#
# Usage: ./.github/scripts/validate-repository-config.sh
#
# Requirements: gh CLI tool (https://cli.github.com/)
# ==============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Emojis for better UX
SUCCESS="✅"
WARNING="⚠️"
ERROR="❌"
INFO="ℹ️"

echo "🔍 Aura Repository Configuration Validator"
echo "=========================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${ERROR} ${RED}GitHub CLI (gh) is not installed${NC}"
    echo -e "${INFO} Install it from: https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${ERROR} ${RED}Not authenticated with GitHub CLI${NC}"
    echo -e "${INFO} Run: gh auth login"
    exit 1
fi

# Get repository information
REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "unknown")
if [[ "$REPO" == "unknown" ]]; then
    echo -e "${ERROR} ${RED}Not in a GitHub repository${NC}"
    exit 1
fi

echo -e "${INFO} Checking repository: ${BLUE}$REPO${NC}"
echo ""

# Validation results
WARNINGS=0
ERRORS=0
CHECKS=0

# Function to check secret
check_secret() {
    local secret_name=$1
    local description=$2
    local required=$3
    
    CHECKS=$((CHECKS + 1))
    
    if gh secret list | grep -q "^$secret_name"; then
        echo -e "${SUCCESS} ${GREEN}$secret_name${NC} - $description"
    else
        if [[ "$required" == "true" ]]; then
            echo -e "${ERROR} ${RED}$secret_name${NC} - $description (MISSING - Required for publishing)"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${WARNING} ${YELLOW}$secret_name${NC} - $description (Optional)"
            WARNINGS=$((WARNINGS + 1))
        fi
    fi
}

# Function to check variable
check_variable() {
    local var_name=$1
    local description=$2
    local required=$3
    
    CHECKS=$((CHECKS + 1))
    
    if gh variable list | grep -q "^$var_name"; then
        local value=$(gh variable list | grep "^$var_name" | awk '{print $2}')
        echo -e "${SUCCESS} ${GREEN}$var_name${NC} - $description (Value: $value)"
    else
        if [[ "$required" == "true" ]]; then
            echo -e "${ERROR} ${RED}$var_name${NC} - $description (MISSING)"
            ERRORS=$((ERRORS + 1))
        else
            echo -e "${INFO} ${BLUE}$var_name${NC} - $description (Not set - will use default behavior)"
        fi
    fi
}

# Check repository secrets
echo "📦 Checking Repository Secrets:"
check_secret "VSCODE_MARKETPLACE_TOKEN" "VS Code Marketplace Personal Access Token" false
check_secret "OPENVSX_TOKEN" "Open VSX Registry Personal Access Token" false
echo ""

# Check repository variables  
echo "🔧 Checking Repository Variables:"
check_variable "ENABLE_MARKETPLACE_PUBLISHING" "Enable automatic publishing on main branch" false
echo ""

# Check workflow file
echo "📄 Checking Workflow Configuration:"
CHECKS=$((CHECKS + 1))
if [[ -f ".github/workflows/aura-ci-cd.yml" ]]; then
    echo -e "${SUCCESS} ${GREEN}.github/workflows/aura-ci-cd.yml${NC} - CI/CD workflow exists"
else
    echo -e "${ERROR} ${RED}.github/workflows/aura-ci-cd.yml${NC} - Workflow file missing"
    ERRORS=$((ERRORS + 1))
fi

# Check setup documentation
CHECKS=$((CHECKS + 1))
if [[ -f ".github/REPOSITORY_SETUP.md" ]]; then
    echo -e "${SUCCESS} ${GREEN}.github/REPOSITORY_SETUP.md${NC} - Setup documentation available"
else
    echo -e "${WARNING} ${YELLOW}.github/REPOSITORY_SETUP.md${NC} - Setup documentation missing"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check Actions permissions
echo "🔐 Checking Actions Permissions:"
CHECKS=$((CHECKS + 1))
if gh api repos/:owner/:repo | jq -r '.permissions.admin' | grep -q true; then
    echo -e "${SUCCESS} ${GREEN}Repository permissions${NC} - You have admin access"
else
    echo -e "${WARNING} ${YELLOW}Repository permissions${NC} - Limited access (may not be able to configure secrets)"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Summary
echo "📊 Validation Summary:"
echo "====================="
echo -e "Total checks: ${BLUE}$CHECKS${NC}"
echo -e "Errors: ${RED}$ERRORS${NC}"
echo -e "Warnings: ${YELLOW}$WARNINGS${NC}"
echo ""

# Provide recommendations
if [[ $ERRORS -gt 0 ]]; then
    echo -e "${ERROR} ${RED}Configuration Issues Found${NC}"
    echo ""
    echo "🛠️ Next Steps:"
    echo "1. Review the setup guide: .github/REPOSITORY_SETUP.md"
    echo "2. Configure missing secrets in repository settings:"
    echo "   https://github.com/$REPO/settings/secrets/actions"
    echo "3. Configure variables if needed:"
    echo "   https://github.com/$REPO/settings/variables/actions"
    echo ""
    exit 1
elif [[ $WARNINGS -gt 0 ]]; then
    echo -e "${WARNING} ${YELLOW}Configuration Warnings${NC}"
    echo ""
    echo "ℹ️ Your repository will work, but marketplace publishing may be disabled."
    echo "See .github/REPOSITORY_SETUP.md for complete setup instructions."
    echo ""
    exit 0
else
    echo -e "${SUCCESS} ${GREEN}Repository Fully Configured!${NC}"
    echo ""
    echo "🎉 Your repository is ready for:"
    echo "• Automated CI/CD pipeline"
    echo "• Marketplace publishing" 
    echo "• Release automation"
    echo ""
    exit 0
fi 