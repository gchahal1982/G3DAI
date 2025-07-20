import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

/**
 * Legacy File Cleanup Script for Aura VS Code Fork
 * Removes legacy Electron/React infrastructure while preserving critical VS Code fork components
 */

interface CleanupResult {
    filesDeleted: string[];
    directoriesDeleted: string[];
    filesPreserved: string[];
    errors: string[];
    preservationRate: number;
}

export class LegacyFileCleanup {
    private workspaceRoot: string;
    private dryRun: boolean;
    private backupDir: string;
    private cleanupResults: CleanupResult;

    constructor(workspaceRoot: string, dryRun: boolean = false) {
        this.workspaceRoot = workspaceRoot;
        this.dryRun = dryRun;
        this.backupDir = path.join(workspaceRoot, '.cleanup-backup');
        this.cleanupResults = {
            filesDeleted: [],
            directoriesDeleted: [],
            filesPreserved: [],
            errors: [],
            preservationRate: 0
        };
    }

    /**
     * Run comprehensive legacy file cleanup
     */
    async runCleanup(): Promise<CleanupResult> {
        console.log('🧹 Starting Legacy File Cleanup...');
        
        if (!this.dryRun) {
            this.createBackup();
        }

        await this.identifyAndValidateFiles();
        await this.cleanupBuildConfigurations();
        await this.cleanupPackageLockFiles();
        await this.cleanupTemporaryFiles();
        await this.cleanupLogFiles();
        await this.validatePostCleanup();
        
        this.generateCleanupReport();
        return this.cleanupResults;
    }

    /**
     * Create backup of critical files before cleanup
     */
    private createBackup(): void {
        console.log('📦 Creating backup of critical files...');
        
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }

        const criticalFiles = [
            'package.json',
            'tsconfig.json',
            'README.md',
            'extensions/',
            'src/lib/',
            'tests/',
            'docs/'
        ];

        criticalFiles.forEach(file => {
            const sourcePath = path.join(this.workspaceRoot, file);
            const backupPath = path.join(this.backupDir, file);
            
            if (fs.existsSync(sourcePath)) {
                try {
                    if (fs.statSync(sourcePath).isDirectory()) {
                        execSync(`cp -r "${sourcePath}" "${path.dirname(backupPath)}/"`, { stdio: 'pipe' });
                    } else {
                        execSync(`cp "${sourcePath}" "${backupPath}"`, { stdio: 'pipe' });
                    }
                    console.log(`✅ Backed up: ${file}`);
                } catch (error) {
                    this.cleanupResults.errors.push(`Backup failed for ${file}: ${error}`);
                }
            }
        });
    }

    /**
     * Identify and validate files before cleanup
     */
    private async identifyAndValidateFiles(): Promise<void> {
        console.log('🔍 Identifying files for cleanup...');

        const filesToCheck = [
            'src/App.tsx',
            'src/main.tsx',
            'index.html',
            'vite.config.ts',
            'postcss.config.js',
            'tailwind.config.js',
            'webpack.config.js',
            'src/vite-env.d.ts',
            'src/desktop/',
            'dist-electron/',
            'electron/',
            'src/components/app/',
            '.DS_Store'
        ];

        const preserveFiles = [
            'package.json',
            'tsconfig.json',
            'extensions/',
            'src/lib/',
            'tests/',
            'docs/',
            'scripts/',
            'DELETE_THESE_FILES.md',
            'VSCODE_FORK_SETUP.md'
        ];

        // Check files that should be preserved
        preserveFiles.forEach(file => {
            const filePath = path.join(this.workspaceRoot, file);
            if (fs.existsSync(filePath)) {
                this.cleanupResults.filesPreserved.push(file);
            }
        });

        // Check files that can be safely deleted
        filesToCheck.forEach(file => {
            const filePath = path.join(this.workspaceRoot, file);
            if (fs.existsSync(filePath)) {
                console.log(`🗑️  Found for deletion: ${file}`);
            } else {
                console.log(`✅ Already clean: ${file}`);
            }
        });
    }

    /**
     * Cleanup build configuration files
     */
    private async cleanupBuildConfigurations(): Promise<void> {
        console.log('⚙️  Cleaning up build configurations...');

        const buildConfigs = [
            'webpack.config.js',
            'vite.config.ts',
            'postcss.config.js',
            'tailwind.config.js',
            'rollup.config.js',
            'esbuild.config.js'
        ];

        for (const config of buildConfigs) {
            const configPath = path.join(this.workspaceRoot, config);
            if (fs.existsSync(configPath)) {
                await this.safeDelete(configPath, 'file');
                console.log(`🗑️  Removed build config: ${config}`);
            }
        }

        // Clean up build output directories
        const buildOutputDirs = [
            'dist',
            'build',
            'dist-electron',
            '.vite',
            '.next',
            'out'
        ];

        for (const dir of buildOutputDirs) {
            const dirPath = path.join(this.workspaceRoot, dir);
            if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
                // Check if it's a build output directory (contains generated files)
                if (await this.isBuildOutputDirectory(dirPath)) {
                    await this.safeDelete(dirPath, 'directory');
                    console.log(`🗑️  Removed build output: ${dir}`);
                }
            }
        }
    }

    /**
     * Cleanup package-lock.json files (will be regenerated)
     */
    private async cleanupPackageLockFiles(): Promise<void> {
        console.log('📦 Cleaning up package-lock.json files...');

        // Find all package-lock.json files except in preserved directories
        const command = 'find . -name "package-lock.json" -not -path "./extensions/*" -not -path "./.cleanup-backup/*"';
        
        try {
            const output = execSync(command, { 
                cwd: this.workspaceRoot, 
                encoding: 'utf-8',
                stdio: 'pipe'
            }).trim();
            
            if (output) {
                const lockFiles = output.split('\n');
                for (const lockFile of lockFiles) {
                    if (lockFile.trim()) {
                        const fullPath = path.join(this.workspaceRoot, lockFile.replace('./', ''));
                        await this.safeDelete(fullPath, 'file');
                        console.log(`🗑️  Removed package-lock: ${lockFile}`);
                    }
                }
            }
        } catch (error) {
            this.cleanupResults.errors.push(`Error cleaning package-lock files: ${error}`);
        }
    }

    /**
     * Cleanup temporary and cache files
     */
    private async cleanupTemporaryFiles(): Promise<void> {
        console.log('🧽 Cleaning up temporary files...');

        const tempFiles = [
            '.DS_Store',
            'Thumbs.db',
            '*.tmp',
            '*.temp',
            '.cache/',
            '.vscode/settings.json.bak'
        ];

        const command = 'find . \\( -name ".DS_Store" -o -name "Thumbs.db" -o -name "*.tmp" -o -name "*.temp" \\) -not -path "./.cleanup-backup/*" -not -path "./extensions/*/node_modules/*"';
        
        try {
            const output = execSync(command, { 
                cwd: this.workspaceRoot, 
                encoding: 'utf-8',
                stdio: 'pipe'
            }).trim();
            
            if (output) {
                const tempFilesList = output.split('\n');
                for (const tempFile of tempFilesList) {
                    if (tempFile.trim()) {
                        const fullPath = path.join(this.workspaceRoot, tempFile.replace('./', ''));
                        await this.safeDelete(fullPath, 'file');
                        console.log(`🗑️  Removed temp file: ${tempFile}`);
                    }
                }
            }
        } catch (error) {
            // Ignore errors for temp file cleanup (files might not exist)
        }
    }

    /**
     * Cleanup log files
     */
    private async cleanupLogFiles(): Promise<void> {
        console.log('📝 Cleaning up log files...');

        const logFiles = [
            'logs.txt',
            'npm-debug.log',
            'yarn-debug.log',
            'yarn-error.log',
            '*.log'
        ];

        const command = 'find . -maxdepth 2 \\( -name "*.log" -o -name "logs.txt" \\) -not -path "./.cleanup-backup/*"';
        
        try {
            const output = execSync(command, { 
                cwd: this.workspaceRoot, 
                encoding: 'utf-8',
                stdio: 'pipe'
            }).trim();
            
            if (output) {
                const logFilesList = output.split('\n');
                for (const logFile of logFilesList) {
                    if (logFile.trim() && !logFile.includes('node_modules')) {
                        const fullPath = path.join(this.workspaceRoot, logFile.replace('./', ''));
                        await this.safeDelete(fullPath, 'file');
                        console.log(`🗑️  Removed log file: ${logFile}`);
                    }
                }
            }
        } catch (error) {
            // Ignore errors for log file cleanup
        }
    }

    /**
     * Validate that critical files are preserved after cleanup
     */
    private async validatePostCleanup(): Promise<void> {
        console.log('✅ Validating post-cleanup file integrity...');

        const criticalFiles = [
            'package.json',
            'tsconfig.json',
            'extensions/aura-core/package.json',
            'extensions/aura-ai/package.json',
            'extensions/aura-3d/package.json',
            'extensions/aura-swarm/package.json',
            'extensions/aura-enterprise/package.json',
            'src/lib/',
            'tests/',
            'docs/'
        ];

        let preservedCount = 0;
        let totalCount = criticalFiles.length;

        for (const file of criticalFiles) {
            const filePath = path.join(this.workspaceRoot, file);
            if (fs.existsSync(filePath)) {
                preservedCount++;
                console.log(`✅ Preserved: ${file}`);
            } else {
                console.log(`❌ Missing: ${file}`);
                this.cleanupResults.errors.push(`Critical file missing after cleanup: ${file}`);
            }
        }

        this.cleanupResults.preservationRate = (preservedCount / totalCount) * 100;
        
        if (this.cleanupResults.preservationRate < 94) {
            throw new Error(`File preservation rate (${this.cleanupResults.preservationRate.toFixed(1)}%) below 94% threshold`);
        }
    }

    /**
     * Safely delete a file or directory
     */
    private async safeDelete(path: string, type: 'file' | 'directory'): Promise<void> {
        if (this.dryRun) {
            console.log(`[DRY RUN] Would delete ${type}: ${path}`);
            return;
        }

        try {
            if (type === 'directory') {
                execSync(`rm -rf "${path}"`, { stdio: 'pipe' });
                this.cleanupResults.directoriesDeleted.push(path);
            } else {
                fs.unlinkSync(path);
                this.cleanupResults.filesDeleted.push(path);
            }
        } catch (error) {
            this.cleanupResults.errors.push(`Failed to delete ${path}: ${error}`);
        }
    }

    /**
     * Check if a directory is a build output directory
     */
    private async isBuildOutputDirectory(dirPath: string): Promise<boolean> {
        try {
            const files = fs.readdirSync(dirPath);
            
            // Check for common build output indicators
            const buildIndicators = [
                'index.js',
                'main.js',
                'bundle.js',
                'app.js',
                'assets/',
                'static/',
                'js/',
                'css/',
                'manifest.json'
            ];

            const hasIndicators = buildIndicators.some(indicator => 
                files.some(file => file.includes(indicator.replace('/', '')))
            );

            return hasIndicators;
        } catch (error) {
            return false;
        }
    }

    /**
     * Generate comprehensive cleanup report
     */
    private generateCleanupReport(): void {
        const totalDeleted = this.cleanupResults.filesDeleted.length + this.cleanupResults.directoriesDeleted.length;
        
        console.log('\n📊 LEGACY FILE CLEANUP REPORT');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`🗑️  Files Deleted: ${this.cleanupResults.filesDeleted.length}`);
        console.log(`📁 Directories Deleted: ${this.cleanupResults.directoriesDeleted.length}`);
        console.log(`💾 Files Preserved: ${this.cleanupResults.filesPreserved.length}`);
        console.log(`📈 Preservation Rate: ${this.cleanupResults.preservationRate.toFixed(1)}%`);
        console.log(`❌ Errors: ${this.cleanupResults.errors.length}`);
        
        if (this.cleanupResults.filesDeleted.length > 0) {
            console.log('\n🗑️  DELETED FILES:');
            this.cleanupResults.filesDeleted.forEach(file => {
                console.log(`   • ${file}`);
            });
        }
        
        if (this.cleanupResults.directoriesDeleted.length > 0) {
            console.log('\n📁 DELETED DIRECTORIES:');
            this.cleanupResults.directoriesDeleted.forEach(dir => {
                console.log(`   • ${dir}`);
            });
        }
        
        if (this.cleanupResults.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.cleanupResults.errors.forEach(error => {
                console.log(`   • ${error}`);
            });
        }
        
        // Overall assessment
        if (this.cleanupResults.preservationRate >= 94 && this.cleanupResults.errors.length === 0) {
            console.log('\n🏆 CLEANUP STATUS: SUCCESS! File cleanup completed successfully.');
        } else if (this.cleanupResults.preservationRate >= 94) {
            console.log('\n⚠️  CLEANUP STATUS: SUCCESS WITH WARNINGS. Some non-critical errors occurred.');
        } else {
            console.log('\n🚨 CLEANUP STATUS: FAILED. Critical files may have been lost.');
        }
        
        console.log('═══════════════════════════════════════════════════════\n');
    }
}

/**
 * CLI interface for running cleanup
 */
async function runCleanup() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const workspaceRoot = process.cwd();
    
    console.log(`🧹 Legacy File Cleanup ${dryRun ? '(DRY RUN)' : ''}`);
    console.log(`📂 Workspace: ${workspaceRoot}`);
    
    const cleanup = new LegacyFileCleanup(workspaceRoot, dryRun);
    
    try {
        const results = await cleanup.runCleanup();
        
        if (results.preservationRate >= 94) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    } catch (error) {
        console.error(`❌ Cleanup failed: ${error}`);
        process.exit(1);
    }
}

// Run cleanup when executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runCleanup().catch(console.error);
}

export { runCleanup }; 