#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Starting styled-component fix script...');

// Find files with potential styled-component issues
const findTsFiles = () => {
  try {
    const output = execSync('grep -r "Styled\\|SocialButton" --include="*.tsx" src/', { encoding: 'utf8' });
    return [...new Set(output.split('\n')
      .filter(Boolean)
      .map(line => line.split(':')[0]))];
  } catch (error) {
    console.error('Error finding styled component files:', error);
    return [];
  }
};

const styledFiles = findTsFiles();
console.log(`Found ${styledFiles.length} files with styled components to fix`);

let fixedFilesCount = 0;

styledFiles.forEach(filePath => {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let isModified = false;

  // Fix 1: Remove any incorrect 'as="div"' attributes already added
  if (content.includes('as="div"')) {
    content = content.replace(/\s*=\s*as="div">/g, '>');
    content = content.replace(/ = as="div">/g, '>');
    isModified = true;
  }

  // Fix 2: Fix event handlers that got mangled
  const eventHandlerRegex = /(on\w+)=\{\s*\(\s*(\w+)(?::\s*\w+)?\s*\)\s*=\s*(?:as="div">)?\s*([^}]+)\}/g;
  content = content.replace(eventHandlerRegex, (match, event, param, body) => {
    return `${event}={(${param}: any) => ${body}}`;
  });
  isModified = true;

  // Fix 3: Add forwardRef with component type to styled components
  // This is a more correct way to handle styled components with TypeScript
  if (content.includes('import styled from')) {
    // Add this near imports to fix styled component types
    const styledComponentsFix = `
// Fix styled component TypeScript issues
import { ElementType, ComponentPropsWithRef } from 'react';
declare module 'styled-components' {
  export interface StyledComponentProps<T extends ElementType> {
    as?: T;
    forwardedAs?: T;
  }
}
`;
    
    // Insert after imports
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex !== -1) {
      const afterImports = content.indexOf(';', lastImportIndex) + 1;
      if (afterImports > 0) {
        content = content.slice(0, afterImports) + styledComponentsFix + content.slice(afterImports);
        isModified = true;
      }
    }
  }

  // Write the modified file back
  if (isModified) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixedFilesCount++;
    console.log(`Fixed styled component issues in ${filePath}`);
  }
});

console.log(`Fixed styled component issues in ${fixedFilesCount} files.`);
console.log('Completed styled component fix script.'); 