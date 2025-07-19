const fs = require('fs');

// Files that need closing tag fixes
const filesToFix = [
  'src/components/admin/ComplianceDashboard.tsx',
  'src/components/analytics/AnalyticsDashboard.tsx', 
  'src/components/analytics/CostOptimizerDashboard.tsx',
  'src/components/analytics/PerformanceDashboard.tsx',
  'src/components/marketplace/MarketplaceStore.tsx',
  'src/components/onboarding/BetaOnboarding.tsx',
  'src/components/setup/InstallationWizard.tsx'
];

console.log('🔧 Fixing remaining JSX closing tag mismatches...\n');

function fixClosingTags(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Split content into lines for processing
    const lines = content.split('\n');
    const openTags = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Track opening Box tags (converted from Grid)
      if (line.includes('<Box sx={{ width:')) {
        openTags.push({ type: 'Box', line: i });
      }
      // Track Grid container tags (should remain Grid)
      else if (line.includes('<Grid container')) {
        openTags.push({ type: 'GridContainer', line: i });
      }
      // Handle closing tags
      else if (line.includes('</Grid>')) {
        // Find the most recent unmatched opening tag
        let lastOpenTag = null;
        for (let j = openTags.length - 1; j >= 0; j--) {
          if (openTags[j] && !openTags[j].matched) {
            lastOpenTag = openTags[j];
            lastOpenTag.matched = true;
            break;
          }
        }
        
        // If the last open tag was a Box (converted Grid), change closing to Box
        if (lastOpenTag && lastOpenTag.type === 'Box') {
          lines[i] = line.replace('</Grid>', '</Box>');
          modified = true;
        }
        // GridContainer closing tags remain as Grid
      }
    }
    
    if (modified) {
      const newContent = lines.join('\n');
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✓ Fixed closing tags in ${filePath}`);
      return true;
    } else {
      console.log(`- No closing tag fixes needed in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Run the fixes
let totalFixed = 0;
filesToFix.forEach(file => {
  if (fixClosingTags(file)) {
    totalFixed++;
  }
});

console.log(`\n✅ Closing tag fixes completed! Fixed ${totalFixed} files.`);
console.log('Run "npx tsc --noEmit" to check for remaining errors.'); 