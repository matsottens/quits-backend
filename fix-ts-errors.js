const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all UI component files
const findUIComponents = () => {
  try {
    const result = execSync('find src -name "*.tsx" | grep -E "components/ui/"', { encoding: 'utf8' });
    return result.trim().split('\n');
  } catch (error) {
    console.error('Error finding UI components:', error);
    return [];
  }
};

// Fix TypeScript errors in a file
const fixFile = (filePath) => {
  console.log(`Processing ${filePath}`);
  
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix 1: Replace namespace React imports with default imports
    content = content.replace(/import \* as React from ["']react["']/g, 'import React from "react"');
    
    // Fix 2: Add explicit type annotations to refs in forwardRef
    content = content.replace(
      /(\(\{\s*([^,]+),\s*(?:([^,]+),\s*)?(?:(children),\s*)?(?:\.\.\.([^}]+))\s*\}\s*,\s*ref\s*\)\s*=>)/g,
      (match, fullMatch, param1, param2, param3, param4) => {
        // Extract the component type from the forwardRef declaration
        const prevLines = content.substring(0, content.indexOf(match));
        const forwardRefLine = prevLines.split('\n').reverse().find(line => line.includes('React.forwardRef'));
        
        if (!forwardRefLine) {
          return match; // Can't determine the type, leave unchanged
        }
        
        const typeMatch = forwardRefLine.match(/React\.ComponentPropsWithoutRef<typeof ([^>]+)>/);
        
        if (typeMatch) {
          const componentType = typeMatch[1];
          return `({ ${param1}, ${param2 || ''} ${param3 ? `, ${param3}` : ''} ...${param4} }: React.ComponentPropsWithoutRef<typeof ${componentType}>, ref: React.ForwardedRef<React.ElementRef<typeof ${componentType}>>) =>`;
        }
        
        // If it's a basic HTML element
        const htmlMatch = forwardRefLine.match(/HTMLDivElement|HTMLButtonElement|HTMLInputElement|HTML([A-Za-z]+)Element/);
        
        if (htmlMatch) {
          const elementType = htmlMatch[0];
          return `({ ${param1}, ${param2 || ''} ${param3 ? `, ${param3}` : ''} ...${param4} }: React.HTMLAttributes<${elementType}>, ref: React.ForwardedRef<${elementType}>) =>`;
        }
        
        return match; // Can't determine the type, leave unchanged
      }
    );
    
    // Write the file back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
};

// Main function
const main = () => {
  const files = findUIComponents();
  console.log(`Found ${files.length} UI component files`);
  
  files.forEach(fixFile);
  
  console.log('Done fixing TypeScript errors');
};

main(); 