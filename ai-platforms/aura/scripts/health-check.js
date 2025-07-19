#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class HealthChecker {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.passed = [];
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      warning: '\x1b[33m',
      error: '\x1b[31m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async checkNodeVersion() {
    try {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (majorVersion >= 18) {
        this.passed.push(`✓ Node.js version ${nodeVersion} (>= 18.0.0)`);
      } else {
        this.issues.push(`✗ Node.js version ${nodeVersion} is too old. Required: >= 18.0.0`);
      }
    } catch (error) {
      this.issues.push(`✗ Could not check Node.js version: ${error.message}`);
    }
  }

  async checkNpmVersion() {
    try {
      const { stdout } = await execAsync('npm --version');
      const npmVersion = stdout.trim();
      const majorVersion = parseInt(npmVersion.split('.')[0]);
      
      if (majorVersion >= 8) {
        this.passed.push(`✓ npm version ${npmVersion} (>= 8.0.0)`);
      } else {
        this.issues.push(`✗ npm version ${npmVersion} is too old. Required: >= 8.0.0`);
      }
    } catch (error) {
      this.issues.push(`✗ Could not check npm version: ${error.message}`);
    }
  }

  async checkTypeScript() {
    try {
      const { stdout } = await execAsync('npx tsc --version');
      const tsVersion = stdout.trim().replace('Version ', '');
      this.passed.push(`✓ TypeScript ${tsVersion}`);
    } catch (error) {
      this.issues.push(`✗ TypeScript not available: ${error.message}`);
    }
  }

  checkProjectStructure() {
    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'vite.config.ts',
      'tailwind.config.js',
      'src/main.tsx',
      'src/App.tsx',
      'index.html'
    ];

    const requiredDirs = [
      'src',
      'src/lib',
      'src/components',
      'extensions',
      'scripts'
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        this.passed.push(`✓ ${file} exists`);
      } else {
        this.issues.push(`✗ Missing required file: ${file}`);
      }
    }

    for (const dir of requiredDirs) {
      if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
        this.passed.push(`✓ ${dir}/ directory exists`);
      } else {
        this.issues.push(`✗ Missing required directory: ${dir}/`);
      }
    }
  }

  checkPackageJson() {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      // Check essential scripts
      const requiredScripts = ['dev', 'build', 'type-check'];
      for (const script of requiredScripts) {
        if (packageJson.scripts?.[script]) {
          this.passed.push(`✓ Script '${script}' defined`);
        } else {
          this.issues.push(`✗ Missing required script: '${script}'`);
        }
      }

      // Check critical dependencies
      const criticalDeps = ['react', 'typescript', 'vite'];
      for (const dep of criticalDeps) {
        if (packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]) {
          this.passed.push(`✓ Dependency '${dep}' listed`);
        } else {
          this.issues.push(`✗ Missing critical dependency: '${dep}'`);
        }
      }

    } catch (error) {
      this.issues.push(`✗ Could not read package.json: ${error.message}`);
    }
  }

  async checkDependencies() {
    try {
      if (!fs.existsSync('node_modules')) {
        this.warnings.push(`⚠ node_modules not found. Run 'npm install' first.`);
        return;
      }

      // Check if key packages are installed
      const keyPackages = ['react', 'typescript', 'vite', '@types/node'];
      for (const pkg of keyPackages) {
        const pkgPath = path.join('node_modules', pkg);
        if (fs.existsSync(pkgPath)) {
          this.passed.push(`✓ Package '${pkg}' installed`);
        } else {
          this.warnings.push(`⚠ Package '${pkg}' not installed`);
        }
      }
    } catch (error) {
      this.warnings.push(`⚠ Could not check dependencies: ${error.message}`);
    }
  }

  async checkSystemCapabilities() {
    // Check available memory
    const totalMem = Math.round(process.memoryUsage().heapTotal / 1024 / 1024);
    if (totalMem >= 100) {
      this.passed.push(`✓ Sufficient memory available (${totalMem}MB heap)`);
    } else {
      this.warnings.push(`⚠ Low memory detected (${totalMem}MB heap)`);
    }

    // Check disk space (simplified)
    try {
      const stats = fs.statSync('.');
      this.passed.push(`✓ Project directory accessible`);
    } catch (error) {
      this.issues.push(`✗ Project directory not accessible: ${error.message}`);
    }
  }

  printSummary() {
    this.log('\n🔍 Aura Health Check Results\n', 'info');

    if (this.passed.length > 0) {
      this.log('✅ PASSED:', 'success');
      this.passed.forEach(item => this.log(`  ${item}`, 'success'));
      this.log('');
    }

    if (this.warnings.length > 0) {
      this.log('⚠️  WARNINGS:', 'warning');
      this.warnings.forEach(item => this.log(`  ${item}`, 'warning'));
      this.log('');
    }

    if (this.issues.length > 0) {
      this.log('❌ ISSUES:', 'error');
      this.issues.forEach(item => this.log(`  ${item}`, 'error'));
      this.log('');
    }

    // Overall status
    if (this.issues.length === 0) {
      this.log('🎉 Health check passed! Aura is ready for development.', 'success');
      return true;
    } else {
      this.log(`💥 Health check failed with ${this.issues.length} issue(s). Please fix the issues above.`, 'error');
      return false;
    }
  }

  async run() {
    this.log('🚀 Running Aura health check...\n', 'info');

    await this.checkNodeVersion();
    await this.checkNpmVersion();
    await this.checkTypeScript();
    this.checkProjectStructure();
    this.checkPackageJson();
    await this.checkDependencies();
    await this.checkSystemCapabilities();

    return this.printSummary();
  }
}

// Run health check
const checker = new HealthChecker();
const passed = await checker.run();
process.exit(passed ? 0 : 1); 