/**
 * Aura VS Code Fork - Extension Build Configuration
 * Builds all Aura extensions: core, ai, 3d, swarm, enterprise
 */

const gulp = require('gulp');
const typescript = require('gulp-typescript');
const webpack = require('webpack');
const path = require('path');
const del = require('del');
const through2 = require('through2');

// Extension directories
const EXTENSIONS = {
  'aura-core': '../extensions/aura-core',
  'aura-ai': '../extensions/aura-ai', 
  'aura-3d': '../extensions/aura-3d',
  'aura-swarm': '../extensions/aura-swarm',
  'aura-enterprise': '../extensions/aura-enterprise'
};

// Build output directory
const BUILD_ROOT = '../build/extensions';

/**
 * Clean all extension build artifacts
 */
function cleanExtensions() {
  return del([`${BUILD_ROOT}/**/*`]);
}

/**
 * TypeScript project configurations for each extension
 */
const createTsProject = (extensionPath) => {
  return typescript.createProject(path.join(extensionPath, 'tsconfig.json'));
};

/**
 * Build individual extension
 */
function buildExtension(name, extensionPath) {
  const tsProject = createTsProject(extensionPath);
  
  return gulp.src([
    `${extensionPath}/src/**/*.ts`,
    `${extensionPath}/src/**/*.tsx`,
    '!**/node_modules/**'
  ])
  .pipe(tsProject())
  .pipe(gulp.dest(`${BUILD_ROOT}/${name}/out`));
}

/**
 * Copy extension manifests and assets
 */
function copyExtensionAssets(name, extensionPath) {
  return gulp.src([
    `${extensionPath}/package.json`,
    `${extensionPath}/README.md`,
    `${extensionPath}/CHANGELOG.md`,
    `${extensionPath}/resources/**/*`,
    `${extensionPath}/media/**/*`,
    `${extensionPath}/webviews/**/*`,
    '!**/node_modules/**'
  ], { base: extensionPath })
  .pipe(gulp.dest(`${BUILD_ROOT}/${name}`));
}

/**
 * Webpack configuration for extension bundling
 */
const createWebpackConfig = (name, extensionPath) => ({
  mode: 'production',
  target: 'node',
  entry: path.join(extensionPath, 'src/extension.ts'),
  output: {
    path: path.join(__dirname, BUILD_ROOT, name),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: path.join(extensionPath, 'tsconfig.json')
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimize: true
  },
  devtool: 'source-map'
});

/**
 * Bundle extension with webpack
 */
function bundleExtension(name, extensionPath) {
  return new Promise((resolve, reject) => {
    const config = createWebpackConfig(name, extensionPath);
    webpack(config, (err, stats) => {
      if (err || stats.hasErrors()) {
        console.error(`❌ Webpack build failed for ${name}:`, err || stats.compilation.errors);
        reject(err || new Error('Webpack build failed'));
      } else {
        console.log(`✅ Successfully bundled ${name}`);
        resolve();
      }
    });
  });
}

/**
 * Build tasks for each extension
 */
const buildTasks = {};
const copyTasks = {};
const bundleTasks = {};

Object.entries(EXTENSIONS).forEach(([name, extensionPath]) => {
  // TypeScript compilation task
  buildTasks[name] = () => buildExtension(name, extensionPath);
  buildTasks[name].displayName = `build:${name}`;
  
  // Asset copying task
  copyTasks[name] = () => copyExtensionAssets(name, extensionPath);
  copyTasks[name].displayName = `copy:${name}`;
  
  // Webpack bundling task
  bundleTasks[name] = () => bundleExtension(name, extensionPath);
  bundleTasks[name].displayName = `bundle:${name}`;
});

/**
 * Extension validation
 */
function validateExtensions() {
  return gulp.src(`${BUILD_ROOT}/*/package.json`)
    .pipe(through2.obj(function(file, enc, callback) {
      try {
        const manifest = JSON.parse(file.contents.toString());
        console.log(`✅ Validated ${manifest.name} v${manifest.version}`);
        
        // Validate required fields
        if (!manifest.main) {
          throw new Error(`Missing 'main' field in ${manifest.name}`);
        }
        if (!manifest.engines || !manifest.engines.vscode) {
          throw new Error(`Missing VS Code engine requirement in ${manifest.name}`);
        }
        
        callback(null, file);
      } catch (error) {
        console.error(`❌ Validation failed for ${file.path}:`, error.message);
        callback(error);
      }
    }));
}

/**
 * Development watch tasks
 */
function watchExtensions() {
  Object.entries(EXTENSIONS).forEach(([name, extensionPath]) => {
    gulp.watch([
      `${extensionPath}/src/**/*.ts`,
      `${extensionPath}/src/**/*.tsx`
    ], gulp.series(buildTasks[name], bundleTasks[name]));
    
    gulp.watch([
      `${extensionPath}/package.json`,
      `${extensionPath}/resources/**/*`,
      `${extensionPath}/media/**/*`
    ], copyTasks[name]);
  });
  
  console.log('👀 Watching extensions for changes...');
}

/**
 * Main build tasks
 */
const buildAll = gulp.parallel(...Object.values(buildTasks));
const copyAll = gulp.parallel(...Object.values(copyTasks));
const bundleAll = gulp.series(...Object.values(bundleTasks));

// Export tasks
exports.clean = cleanExtensions;
exports.build = buildAll;
exports.copy = copyAll;
exports.bundle = bundleAll;
exports.validate = validateExtensions;
exports.watch = watchExtensions;

// Default task: full build pipeline
exports.default = gulp.series(
  cleanExtensions,
  gulp.parallel(buildAll, copyAll),
  bundleAll,
  validateExtensions
);

// Development task: build + watch
exports.dev = gulp.series(
  cleanExtensions,
  gulp.parallel(buildAll, copyAll),
  bundleAll,
  watchExtensions
);

// Individual extension tasks
Object.entries(EXTENSIONS).forEach(([name]) => {
  exports[`build:${name}`] = buildTasks[name];
  exports[`copy:${name}`] = copyTasks[name];
  exports[`bundle:${name}`] = bundleTasks[name];
  exports[name] = gulp.series(buildTasks[name], copyTasks[name], bundleTasks[name]);
});

console.log(`
🚀 Aura Extension Build System Initialized
📦 Extensions: ${Object.keys(EXTENSIONS).join(', ')}
🎯 Build Target: ${BUILD_ROOT}

Available tasks:
• npm run build:extensions     - Build all extensions
• npm run build:aura-ai        - Build AI extension only
• npm run build:aura-3d        - Build 3D extension only
• npm run build:aura-swarm     - Build Swarm extension only
• npm run build:aura-enterprise - Build Enterprise extension only
• npm run dev:extensions       - Build + watch mode
`); 