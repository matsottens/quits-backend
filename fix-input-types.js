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
    
    // Fix HTMLAttributes to InputHTMLAttributes for input elements
    content = content.replace(
      /React\.HTMLAttributes<HTMLInputElement>/g,
      'React.InputHTMLAttributes<HTMLInputElement>'
    );
    
    // Make sure there's a comma between type and ...props
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

// Fix input-otp.tsx files
const fixInputOtpFile = (filePath) => {
  if (filePath.endsWith('input-otp.tsx')) {
    console.log(`Processing OTP file: ${filePath}`);
    
    try {
      // Read the file
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Fix the div vs input element issue
      content = content.replace(
        /HTMLInputElement/g,
        'HTMLDivElement'
      );
      
      // Write the file back
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed OTP file: ${filePath}`);
      
    } catch (error) {
      console.error(`Error processing OTP file: ${filePath}:`, error);
    }
  }
};

// Main function
const main = () => {
  const files = findInputFiles();
  console.log(`Found ${files.length} input.tsx files`);
  
  files.forEach(fixInputFile);
  
  // Special handling for input-otp.tsx files
  const otpFiles = execSync('find src -name "input-otp.tsx"', { encoding: 'utf8' }).trim().split('\n');
  console.log(`Found ${otpFiles.length} input-otp.tsx files`);
  otpFiles.forEach(fixInputOtpFile);
  
  console.log('Done fixing input files');
};

main(); 