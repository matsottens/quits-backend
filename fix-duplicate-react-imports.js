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

// Fix duplicate React imports in a file
const fixFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return;
    }

    console.log(`Processing ${filePath}`);
    
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if there are multiple React imports
    const hasDefaultImport1 = content.includes('import React from "react"');
    const hasDefaultImport2 = content.includes("import React from 'react'");
    const hasNamedImport = /import React,\s*\{[^}]+\}\s*from ['"]react['"]/g.test(content);
    const hasNamespaceImport = content.includes('import * as React from "react"') || content.includes("import * as React from 'react'");
    
    // Count React imports
    const reactImportCount = [hasDefaultImport1, hasDefaultImport2, hasNamedImport, hasNamespaceImport].filter(Boolean).length;
    
    if (reactImportCount > 1) {
      let modified = false;
      
      // If we added a default import and there's another React import, remove our added one
      if (hasDefaultImport1) {
        content = content.replace(/^import React from "react"\n/m, '');
        modified = true;
      }
      
      // If there are still multiple React imports, standardize to default import
      if (hasNamespaceImport && (hasDefaultImport2 || hasNamedImport)) {
        content = content.replace(/import \* as React from ['"]react['"];?\n/g, '');
        modified = true;
      }
      
      // Make sure there's at least one React import
      if (!content.includes('import React')) {
        content = 'import React from "react";\n' + content;
        modified = true;
      }
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Fixed duplicate React imports in ${filePath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
};

// Main function
const main = () => {
  const files = findTsxFiles();
  console.log(`Found ${files.length} .tsx files`);
  
  let fixed = 0;
  files.forEach(file => {
    try {
      fixFile(file);
      fixed++;
    } catch (error) {
      console.error(`Error processing ${file}:`, error);
    }
  });
  
  console.log(`Processed ${fixed} files for duplicate React imports`);
};

main(); 