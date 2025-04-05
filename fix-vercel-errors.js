#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files with errors based on the Vercel logs
const filesToFix = [
  'src/App.tsx',
  'src/app/page.tsx',
  'src/components/CorsTest.tsx',
  'src/components/NotificationCenter.tsx'
];

console.log('Starting to fix TypeScript errors for Vercel deployment...');

filesToFix.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  console.log(`Processing file: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let isModified = false;

  // Fix 1: Change 'react' imports for TS2305 errors
  if (content.includes("import React from 'react';")) {
    content = content.replace(
      "import React from 'react';",
      "import * as React from 'react';"
    );
    isModified = true;
    console.log(`  - Fixed React import in ${filePath}`);
  }

  // Fix 2: Add explicit type annotations for binding elements (TS7031)
  // Pattern: implicitly has an 'any' type
  const bindingParamRegex = /\(([^)]*)\)\s*=>/g;
  let match;
  while ((match = bindingParamRegex.exec(content)) !== null) {
    const params = match[1];
    
    // Check for destructured parameters without type annotations
    if (params.includes('{') && !params.includes(':')) {
      const newParams = params.replace(
        /\{\s*([^}:]+)\s*\}/g, 
        (match, p1) => {
          // Only replace if it doesn't already have a type annotation
          if (!match.includes(':')) {
            return `{ ${p1} }: any`;
          }
          return match;
        }
      );
      
      if (newParams !== params) {
        content = content.replace(match[0], `(${newParams}) =>`);
        isModified = true;
        console.log(`  - Added type annotation for destructured parameter in ${filePath}`);
      }
    }
  }

  // Fix 3: Fix Parameter 'e' implicitly has an 'any' type (TS7006)
  content = content.replace(
    /\(\s*e\s*\)\s*=>/g,
    '(e: any) =>'
  );

  // Write the modified file back
  if (isModified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed TypeScript errors in ${filePath}`);
  } else {
    console.log(`No changes needed for ${filePath}`);
  }
});

console.log('Completed fixing TypeScript errors for Vercel deployment.'); 