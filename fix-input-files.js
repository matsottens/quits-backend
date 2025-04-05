const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all input.tsx files
const findInputFiles = () => {
  try {
    const result = execSync('find src -name "input.tsx"', { encoding: 'utf8' });
    return result.trim().split('\n');
  } catch (error) {
    console.error('Error finding input.tsx files:', error);
    return [];
  }
};

// Fix TypeScript errors in input.tsx files
const fixInputFile = (filePath) => {
  console.log(`Processing ${filePath}`);
  
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix the missing comma between type and ...props
    content = content.replace(
      /\(\{\s*className,\s*type\s+\.\.\.props\s*\}:/g,
      '({ className, type, ...props }:'
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
  const files = findInputFiles();
  console.log(`Found ${files.length} input.tsx files`);
  
  files.forEach(fixInputFile);
  
  console.log('Done fixing input.tsx files');
};

main(); 