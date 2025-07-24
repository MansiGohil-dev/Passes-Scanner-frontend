const fs = require('fs');
const path = require('path');

// Read package-lock.json
const packageLockPath = path.join(__dirname, 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
    console.log('Removing package-lock.json to clean up dependency conflicts...');
    fs.unlinkSync(packageLockPath);
    console.log('package-lock.json removed successfully');
} else {
    console.log('package-lock.json not found');
}

// Also remove node_modules if it exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log('node_modules directory exists - recommend removing it manually');
}

console.log('Cleanup complete. Run "npm install --legacy-peer-deps" to reinstall dependencies.');
