#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting AURA AI IDE...');

// Path to our custom Aura electron
const electronPath = path.join(__dirname, '.build', 'electron', 'Aura AI IDE.app', 'Contents', 'MacOS', 'Electron');

// VS Code entry point
const vscodeEntry = path.join(__dirname, 'src', 'main.js');

// Launch arguments
const args = [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--user-data-dir=' + path.join(__dirname, '.aura-data'),
    '--enable-logging',
    '--'
];

console.log('📂 Electron path:', electronPath);
console.log('📂 VS Code entry:', vscodeEntry);

// Set environment variables
const env = {
    ...process.env,
    VSCODE_DEV: '1',
    VSCODE_CLI: '1',
    ELECTRON_RUN_AS_NODE: undefined,
    AURA_IDE: '1'
};

// Launch Aura
const child = spawn(electronPath, args, {
    stdio: 'inherit',
    env: env,
    cwd: __dirname
});

child.on('error', (err) => {
    console.error('❌ Failed to start AURA:', err.message);
    process.exit(1);
});

child.on('exit', (code) => {
    console.log(`🔄 AURA exited with code ${code}`);
});

// Handle interrupts
process.on('SIGINT', () => {
    console.log('\n🛑 Stopping AURA...');
    child.kill('SIGINT');
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Terminating AURA...');
    child.kill('SIGTERM');
}); 