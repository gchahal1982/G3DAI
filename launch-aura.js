const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Launching AURA VS Code Fork...');

// Get the electron path
const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron');

// Launch with minimal setup
const child = spawn(electronPath, [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--enable-logging',
    '--enable-features=UseOzonePlatform',
    '--'
], {
    stdio: 'inherit',
    env: {
        ...process.env,
        VSCODE_DEV: '1',
        ELECTRON_RUN_AS_NODE: undefined
    }
});

child.on('error', (err) => {
    console.error('❌ Failed to start AURA:', err);
});

child.on('exit', (code) => {
    console.log(`🔄 AURA exited with code ${code}`);
}); 