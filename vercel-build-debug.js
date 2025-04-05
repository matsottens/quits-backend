#!/usr/bin/env node

console.log('Starting Vercel build debug script');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());
console.log('ENV PATH:', process.env.PATH);

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

// Ensure TypeScript and Vite are properly installed
console.log('Making sure dependencies are installed...');
try {
  execSync('npm install typescript vite @vitejs/plugin-react vite-plugin-svgr vite-tsconfig-paths --no-save', { stdio: 'inherit' });
  console.log('Dependencies installed successfully');
} catch (error) {
  console.error('Failed to install dependencies:', error.message);
}

// Check if the tsconfig.vercel.json file exists
const tsconfigPath = path.join(process.cwd(), 'tsconfig.vercel.json');
if (fs.existsSync(tsconfigPath)) {
  console.log('tsconfig.vercel.json found');
} else {
  console.error('tsconfig.vercel.json not found');
}

// Skip TypeScript type checking and just run Vite build
console.log('\nRunning Vite build directly...');
const viteBuild = spawn('npx', ['vite', 'build'], { stdio: 'inherit' });

viteBuild.on('error', (error) => {
  console.error('Failed to start Vite build:', error.message);
  process.exit(1);
});

viteBuild.on('close', (code) => {
  console.log(`Vite build process exited with code ${code}`);
  process.exit(code);
}); 