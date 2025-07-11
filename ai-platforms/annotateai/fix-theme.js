const fs = require('fs');
const path = require('path');

// Define the theme replacements
const replacements = [
  // Background gradients
  {
    from: /bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900/g,
    to: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950'
  },
  {
    from: /bg-gradient-to-br from-gray-900 via-annotate-primary-900\/20 to-gray-900/g,
    to: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950'
  },
  {
    from: /bg-gray-900/g,
    to: 'bg-gradient-to-br from-indigo-950 via-purple-950 to-gray-950'
  },
  {
    from: /bg-slate-900/g,
    to: 'bg-white/5 backdrop-blur-xl border border-white/10'
  },
  {
    from: /bg-slate-800/g,
    to: 'bg-white/10 backdrop-blur-sm border border-white/20'
  },
  // Text colors
  {
    from: /text-gray-400/g,
    to: 'text-white/70'
  },
  {
    from: /text-gray-500/g,
    to: 'text-white/60'
  },
  {
    from: /text-gray-300/g,
    to: 'text-white/80'
  },
  // Border colors
  {
    from: /border-gray-700/g,
    to: 'border-white/20'
  },
  {
    from: /border-gray-800/g,
    to: 'border-white/10'
  },
  // Glass effects
  {
    from: /annotate-glass/g,
    to: 'bg-white/5 backdrop-blur-xl border border-white/10'
  }
];

// Function to process a file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    replacements.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Function to recursively find and process files
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);

  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      processDirectory(fullPath);
    } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
      processFile(fullPath);
    }
  });
}

// Start processing from src directory
console.log('🎨 Updating theme to purple glassmorphism...');
processDirectory('./src');
console.log('✨ Theme update complete!'); 