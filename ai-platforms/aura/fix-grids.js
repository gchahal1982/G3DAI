const fs = require('fs');
const path = require('path');

// Files that need Grid fixes based on the error logs
const filesToFix = [
  'src/components/admin/ComplianceDashboard.tsx',
  'src/components/analytics/AnalyticsDashboard.tsx', 
  'src/components/analytics/CostOptimizerDashboard.tsx',
  'src/components/analytics/PerformanceDashboard.tsx',
  'src/components/marketplace/MarketplaceStore.tsx',
  'src/components/onboarding/BetaOnboarding.tsx',
  'src/components/setup/InstallationWizard.tsx'
];

// Map breakpoint numbers to percentages
const breakpointMap = {
  '1': '8.33%',
  '2': '16.67%', 
  '3': '25%',
  '4': '33.33%',
  '5': '41.67%',
  '6': '50%',
  '7': '58.33%',
  '8': '66.67%',
  '9': '75%',
  '10': '83.33%',
  '11': '91.67%',
  '12': '100%'
};

function fixGridInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Pattern 1: <Grid item xs={...} md={...} lg={...}>
    content = content.replace(
      /<Grid\s+item\s+xs=\{(\d+)\}\s+(?:sm=\{(\d+)\}\s+)?(?:md=\{(\d+)\}\s+)?(?:lg=\{(\d+)\}\s+)?>(?:\s*key=\{[^}]+\})?>/g,
      (match, xs, sm, md, lg) => {
        modified = true;
        const xsWidth = breakpointMap[xs] || '100%';
        const smWidth = sm ? breakpointMap[sm] : xsWidth;
        const mdWidth = md ? breakpointMap[md] : smWidth;
        const lgWidth = lg ? breakpointMap[lg] : mdWidth;
        
        let sx = `{ width: { xs: '${xsWidth}'`;
        if (sm) sx += `, sm: '${smWidth}'`;
        if (md) sx += `, md: '${mdWidth}'`;
        if (lg) sx += `, lg: '${lgWidth}'`;
        sx += ' } }';
        
        return `<Box sx={${sx}}>`;
      }
    );

    // Pattern 2: <Grid xs={...} md={...} lg={...}> (without item)
    content = content.replace(
      /<Grid\s+xs=\{(\d+)\}\s+(?:sm=\{(\d+)\}\s+)?(?:md=\{(\d+)\}\s+)?(?:lg=\{(\d+)\}\s+)?>/g,
      (match, xs, sm, md, lg) => {
        modified = true;
        const xsWidth = breakpointMap[xs] || '100%';
        const smWidth = sm ? breakpointMap[sm] : xsWidth;
        const mdWidth = md ? breakpointMap[md] : smWidth;
        const lgWidth = lg ? breakpointMap[lg] : mdWidth;
        
        let sx = `{ width: { xs: '${xsWidth}'`;
        if (sm) sx += `, sm: '${smWidth}'`;
        if (md) sx += `, md: '${mdWidth}'`;
        if (lg) sx += `, lg: '${lgWidth}'`;
        sx += ' } }';
        
        return `<Box sx={${sx}}>`;
      }
    );

    // Pattern 3: <Grid item xs={...}> (only xs)
    content = content.replace(
      /<Grid\s+item\s+xs=\{(\d+)\}>/g,
      (match, xs) => {
        modified = true;
        const xsWidth = breakpointMap[xs] || '100%';
        return `<Box sx={{ width: { xs: '${xsWidth}' } }}>`;
      }
    );

    // Pattern 4: <Grid xs={...}> (only xs, no item)
    content = content.replace(
      /<Grid\s+xs=\{(\d+)\}>/g,
      (match, xs) => {
        modified = true;
        const xsWidth = breakpointMap[xs] || '100%';
        return `<Box sx={{ width: { xs: '${xsWidth}' } }}>`;
      }
    );

    // Replace closing Grid tags with Box
    content = content.replace(/<\/Grid>/g, '</Box>');

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed Grid components in ${filePath}`);
      return true;
    } else {
      console.log(`- No Grid fixes needed in ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`✗ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Run the fixes
console.log('🔧 Starting Grid component fixes...\n');

let totalFixed = 0;
filesToFix.forEach(file => {
  if (fixGridInFile(file)) {
    totalFixed++;
  }
});

console.log(`\n✅ Grid fixes completed! Fixed ${totalFixed} files.`);
console.log('\n📝 Note: You may need to add Box to imports where missing.');
console.log('Run "npx tsc --noEmit" to check for remaining errors.'); 