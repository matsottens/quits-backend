#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting React hooks fix script...');

// Files with React hook issues
const findHookFiles = () => {
  try {
    const output = execSync('find src -type f -name "*.tsx" -o -name "*.ts" | xargs grep -l "\\(use[A-Z]\\|useState\\|useEffect\\)" 2>/dev/null', { encoding: 'utf8' });
    return output.split('\n').filter(Boolean);
  } catch (error) {
    console.error('Error finding files with React hooks:', error);
    return [];
  }
};

const hookFiles = findHookFiles();
console.log(`Found ${hookFiles.length} files with React hooks to fix`);

let fixedFilesCount = 0;

hookFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let isModified = false;

  // Fix 1: Ensure React is imported properly with hooks
  if (!content.includes("import * as React from 'react';") && 
      (content.includes('useState') || 
       content.includes('useEffect') || 
       content.includes('useRef') || 
       content.includes('useCallback') || 
       content.includes('useMemo') || 
       content.includes('useContext') || 
       content.includes('useReducer') || 
       content.includes('useLayoutEffect'))) {
    
    // Add proper React import if it doesn't exist
    if (!content.includes("import") || !content.includes("from 'react'")) {
      content = "import * as React from 'react';\n" + content;
      isModified = true;
    }
    // Otherwise convert existing import to include hooks
    else if (content.includes("import React from 'react';")) {
      content = content.replace(
        "import React from 'react';",
        "import * as React from 'react';"
      );
      isModified = true;
    }
  }

  // Fix 2: Add destructuring for React hooks
  if ((content.includes('useState(') || 
       content.includes('useEffect(') || 
       content.includes('useRef(') || 
       content.includes('useCallback(') || 
       content.includes('useMemo(') || 
       content.includes('useContext(') || 
       content.includes('useReducer(') || 
       content.includes('useLayoutEffect('))) {
    
    // Add hooks destructuring if React is imported
    if (content.includes("import * as React from 'react';") && 
        !content.includes("{") && 
        !content.match(/\{[^}]*useState[^}]*\}/)) {
      content = content.replace(
        "import * as React from 'react';",
        "import * as React from 'react';\nconst { useState, useEffect, useRef, useCallback, useMemo, useContext, useReducer, useLayoutEffect } = React;"
      );
      isModified = true;
    }
  }

  // Fix 3: Remove any "as="div"" from SVG elements
  if (content.includes('<svg') && content.includes('as="div"')) {
    content = content.replace(/<svg([^>]*)as="div"([^>]*)>/g, '<svg$1$2>');
    isModified = true;
  }

  // Write the modified file back
  if (isModified) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixedFilesCount++;
    console.log(`Fixed React hooks in ${filePath}`);
  }
});

console.log(`Fixed React hooks in ${fixedFilesCount} files.`);

// Add global.d.ts file with JSX declarations for SVG elements
const globalDts = `/// <reference types="react" />
/// <reference types="react/jsx-runtime" />

// Global TypeScript declarations for SVG elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      svg: React.SVGProps<SVGSVGElement>;
      path: React.SVGProps<SVGPathElement>;
      circle: React.SVGProps<SVGCircleElement>;
      rect: React.SVGProps<SVGRectElement>;
      g: React.SVGProps<SVGGElement>;
      polygon: React.SVGProps<SVGPolygonElement>;
      line: React.SVGProps<SVGLineElement>;
    }
  }
}

export {};
`;

fs.writeFileSync('src/svg.d.ts', globalDts, 'utf8');
console.log('Created src/svg.d.ts with JSX declarations for SVG elements.');

console.log('Completed React hooks fix script.'); 