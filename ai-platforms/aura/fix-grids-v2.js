const fs = require('fs');

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

// First, let's restore the original files from git
console.log('🔄 Restoring original files from git...\n');

filesToFix.forEach(file => {
  try {
    const { execSync } = require('child_process');
    execSync(`git checkout HEAD -- ${file}`, { stdio: 'inherit' });
    console.log(`✓ Restored ${file}`);
  } catch (error) {
    console.log(`- ${file} already clean or not in git`);
  }
});

console.log('\n🔧 Starting targeted Grid fixes...\n');

// Map breakpoint numbers to percentages  
const breakpointMap = {
  '1': '8.33%', '2': '16.67%', '3': '25%', '4': '33.33%', '5': '41.67%', '6': '50%',
  '7': '58.33%', '8': '66.67%', '9': '75%', '10': '83.33%', '11': '91.67%', '12': '100%'
};

function createResponsiveSx(xs, sm, md, lg) {
  const xsWidth = breakpointMap[xs] || '100%';
  const smWidth = sm ? breakpointMap[sm] : xsWidth;
  const mdWidth = md ? breakpointMap[md] : smWidth; 
  const lgWidth = lg ? breakpointMap[lg] : mdWidth;
  
  let sx = `{ width: { xs: '${xsWidth}'`;
  if (sm) sx += `, sm: '${smWidth}'`;
  if (md) sx += `, md: '${mdWidth}'`;
  if (lg) sx += `, lg: '${lgWidth}'`;
  sx += ' } }';
  
  return sx;
}

function fixGridInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Only fix Grid components that have breakpoint props (not containers)
    // Pattern: <Grid item xs={...} ...> or <Grid xs={...} ...> (but not container)
    
    // Pattern 1: <Grid item xs={12} sm={6} md={3} lg={2} key={...}>
    content = content.replace(
      /<Grid\s+item\s+xs=\{(\d+)\}(?:\s+sm=\{(\d+)\})?(?:\s+md=\{(\d+)\})?(?:\s+lg=\{(\d+)\})?(?:\s+key=\{[^}]+\})?>/g,
      (match, xs, sm, md, lg) => {
        modified = true;
        return `<Box sx={${createResponsiveSx(xs, sm, md, lg)}}>`;
      }
    );

    // Pattern 2: <Grid xs={12} md={3}> (without item, but with breakpoints)
    content = content.replace(
      /<Grid\s+xs=\{(\d+)\}(?:\s+sm=\{(\d+)\})?(?:\s+md=\{(\d+)\})?(?:\s+lg=\{(\d+)\})?>/g,
      (match, xs, sm, md, lg) => {
        modified = true;
        return `<Box sx={${createResponsiveSx(xs, sm, md, lg)}}>`;
      }
    );

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Fixed Grid breakpoint components in ${filePath}`);
      return true;
    } else {
      console.log(`- No Grid breakpoint fixes needed in ${filePath}`);
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
  if (fixGridInFile(file)) {
    totalFixed++;
  }
});

console.log(`\n✅ Targeted Grid fixes completed! Fixed ${totalFixed} files.`);
console.log('\n📝 Note: Grid containers are preserved. Only breakpoint Grids converted to Box.');
console.log('Run "npx tsc --noEmit" to check for remaining errors.'); 