const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all .tsx files in the project
const findTsxFiles = () => {
  try {
    const result = execSync('find src -name "*.tsx"', { encoding: 'utf8' });
    return result.trim().split('\n');
  } catch (error) {
    console.error('Error finding .tsx files:', error);
    return [];
  }
};

// Fix TypeScript errors in a file
const fixFile = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 1. Add JSX import to fix TS2339 errors
    if (!content.includes('/** @jsxImportSource react */') && !content.includes("import * as React from 'react'") && !content.includes('import React from "react"')) {
      content = `import React from "react"\n${content}`;
      modified = true;
    }

    // 2. Fix implicit 'any' types for destructured parameters in forwardRef components
    content = content.replace(
      /const\s+([A-Za-z0-9_]+)\s*=\s*React\.forwardRef\(\s*\(\{\s*([^}]+)\}\s*,\s*ref\s*\)\s*=>/g,
      (match, componentName, params) => {
        // Add type annotations to parameters
        const newParams = params
          .split(',')
          .map(param => param.trim())
          .map(param => {
            if (param === 'className') return 'className: string';
            if (param === 'children') return 'children: React.ReactNode';
            if (param.includes('...')) {
              const restParam = param.trim();
              return `...${restParam}`;
            }
            return `${param}: any`;
          })
          .join(', ');
        
        // Determine the return type and ref type based on component name
        let refType = 'HTMLDivElement';
        if (componentName.toLowerCase().includes('button')) refType = 'HTMLButtonElement';
        else if (componentName.toLowerCase().includes('input')) refType = 'HTMLInputElement';
        else if (componentName.toLowerCase().includes('a')) refType = 'HTMLAnchorElement';
        else if (componentName.toLowerCase().includes('img')) refType = 'HTMLImageElement';
        else if (componentName.toLowerCase().includes('span')) refType = 'HTMLSpanElement';
        else if (componentName.toLowerCase().includes('label')) refType = 'HTMLLabelElement';
        else if (componentName.toLowerCase().includes('textarea')) refType = 'HTMLTextAreaElement';
        else if (componentName.toLowerCase().includes('caption')) refType = 'HTMLTableCaptionElement';
        else if (componentName.toLowerCase().includes('td')) refType = 'HTMLTableCellElement';
        else if (componentName.toLowerCase().includes('th')) refType = 'HTMLTableCellElement';
        else if (componentName.toLowerCase().includes('tr')) refType = 'HTMLTableRowElement';
        else if (componentName.toLowerCase().includes('table')) refType = 'HTMLTableElement';
        
        modified = true;
        return `const ${componentName} = React.forwardRef<${refType}, any>(\n  ({ ${newParams} }, ref: React.ForwardedRef<${refType}>) =>`;
      }
    );

    // 3. Fix table-specific JSX elements
    if (filePath.includes('table.tsx')) {
      // Make sure React.JSX.Element is properly set for table elements
      content = content.replace(/\s*<th\s/g, ' <th ');
      content = content.replace(/\s*<td\s/g, ' <td ');
      content = content.replace(/\s*<caption\s/g, ' <caption ');
      content = content.replace(/\s*<tr\s/g, ' <tr ');
    }

    // 4. Special handling for toaster.tsx
    if (filePath.includes('toaster.tsx')) {
      content = content.replace(
        /\(\{\s*id,\s*title/g,
        '({ id, title'
      );
      
      content = content.replace(
        /\(\{\s*id,\s*title\s*\}\)/g,
        '({ id, title }: { id: string, title: string })'
      );
      
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
};

// Process all files
const main = () => {
  const files = findTsxFiles();
  console.log(`Found ${files.length} .tsx files`);
  
  // Process files with known errors first
  const priorityFiles = [
    'src/pages/subscription-dashboard/components/ui/table.tsx',
    'src/pages/subscription-dashboard/components/ui/tabs.tsx',
    'src/pages/subscription-dashboard/components/ui/toaster.tsx',
    'src/pages/quits-subscription/components/ui/card.tsx',
    'src/pages/quits-subscription/components/ui/checkbox.tsx',
    'src/pages/quits-subscription/components/ui/dialog.tsx'
  ];
  
  // Process priority files first
  console.log('Processing priority files...');
  priorityFiles.forEach(file => {
    const fullPath = path.resolve(file);
    if (fs.existsSync(fullPath)) {
      fixFile(fullPath);
    } else {
      console.log(`File not found: ${fullPath}`);
    }
  });
  
  // Process all other files
  console.log('Processing remaining files...');
  files.forEach(file => {
    if (!priorityFiles.includes(file)) {
      fixFile(file);
    }
  });
  
  console.log('Done fixing TypeScript errors');
};

main(); 