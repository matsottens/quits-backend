const fs = require('fs');
const path = require('path');

// List of files with known duplicate imports
const filesWithDuplicateImports = [
  'src/pages/google-account-selector/hooks/use-mobile.tsx',
  'src/pages/quits-app (1)/hooks/use-mobile.tsx',
  'src/pages/quits-app/hooks/use-mobile.tsx',
  'src/pages/quits-calendar/hooks/use-mobile.tsx',
  'src/pages/quits-loading-screen/hooks/use-mobile.tsx',
  'src/pages/quits-login/hooks/use-mobile.tsx',
  'src/pages/quits-onboarding/hooks/use-mobile.tsx',
  'src/pages/quits-settings/hooks/use-mobile.tsx',
  'src/pages/quits-settings/settings-page.tsx',
  'src/pages/quits-subscription-tracker/components/bottom-navigation.tsx',
  'src/pages/quits-subscription-tracker/hooks/use-mobile.tsx',
  'src/pages/quits-subscription/add-subscription.tsx',
  'src/pages/quits-subscription/hooks/use-mobile.tsx',
  'src/pages/signup-page/hooks/use-mobile.tsx',
  'src/pages/subscription-dashboard/components/search-bar.tsx',
  'src/pages/subscription-dashboard/hooks/use-mobile.tsx'
];

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
    
    // Remove the default import and keep only the namespace import
    content = content.replace(/^import React from ["']react["'];?\n/gm, '');
    
    // Write the file back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed duplicate React imports in ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
};

// Main function
const main = () => {
  console.log(`Processing ${filesWithDuplicateImports.length} files with duplicate React imports`);
  
  filesWithDuplicateImports.forEach(fixFile);
  
  console.log('Done fixing duplicate React imports');
};

main(); 