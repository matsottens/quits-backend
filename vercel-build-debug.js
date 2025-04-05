#!/usr/bin/env node

console.log('Starting Vercel build debug script');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());
console.log('ENV PATH:', process.env.PATH);

const fs = require('fs');
const path = require('path');

// Check if TypeScript exists
try {
  const tscPath = require.resolve('typescript/bin/tsc');
  console.log('TypeScript binary found at:', tscPath);
} catch (error) {
  console.error('Failed to find TypeScript binary:', error.message);
}

// Check if the tsconfig.vercel.json file exists
const tsconfigPath = path.join(process.cwd(), 'tsconfig.vercel.json');
if (fs.existsSync(tsconfigPath)) {
  console.log('tsconfig.vercel.json found');
  try {
    const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
    console.log('tsconfig.vercel.json content:', tsconfigContent);
  } catch (error) {
    console.error('Failed to read tsconfig.vercel.json:', error.message);
  }
} else {
  console.error('tsconfig.vercel.json not found');
}

// Check if vite exists
try {
  const vitePath = require.resolve('vite');
  console.log('Vite found at:', vitePath);
} catch (error) {
  console.error('Failed to find Vite:', error.message);
}

// Try running the TypeScript compiler directly
console.log('\nAttempting to run TypeScript compiler...');
const { spawn } = require('child_process');
const tsc = spawn('node', ['./node_modules/.bin/tsc', '--version']);

tsc.stdout.on('data', (data) => {
  console.log(`TypeScript version: ${data}`);
});

tsc.stderr.on('data', (data) => {
  console.error(`TypeScript error: ${data}`);
});

tsc.on('close', (code) => {
  console.log(`TypeScript process exited with code ${code}`);
  
  // Now try to run the build command
  console.log('\nAttempting to run build command manually...');
  
  // First just the TypeScript part
  const tscBuild = spawn('node', ['./node_modules/.bin/tsc', '--skipLibCheck', '--project', 'tsconfig.vercel.json']);
  
  tscBuild.stdout.on('data', (data) => {
    console.log(`tsc build output: ${data}`);
  });
  
  tscBuild.stderr.on('data', (data) => {
    console.error(`tsc build error: ${data}`);
  });
  
  tscBuild.on('close', (code) => {
    console.log(`tsc build process exited with code ${code}`);
    
    if (code === 0) {
      // If TypeScript succeeds, try Vite build
      console.log('\nAttempting to run Vite build...');
      const viteBuild = spawn('npx', ['vite', 'build']);
      
      viteBuild.stdout.on('data', (data) => {
        console.log(`vite build output: ${data}`);
      });
      
      viteBuild.stderr.on('data', (data) => {
        console.error(`vite build error: ${data}`);
      });
      
      viteBuild.on('close', (code) => {
        console.log(`vite build process exited with code ${code}`);
      });
    }
  });
}); 