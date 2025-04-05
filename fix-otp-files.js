const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all input-otp.tsx files
const findOtpFiles = () => {
  try {
    const result = execSync('find src -name "input-otp.tsx"', { encoding: 'utf8' });
    return result.trim().split('\n');
  } catch (error) {
    console.error('Error finding input-otp.tsx files:', error);
    return [];
  }
};

// Fix input-otp.tsx files
const fixOtpFile = (filePath) => {
  console.log(`Processing ${filePath}`);
  
  try {
    // Read the file
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update InputOTP implementation to wrap Input in a div
    // This prevents forwarding the div ref to the Input component
    if (content.includes('ref={ref}') && content.includes('<Input')) {
      content = content.replace(
        /<Input\s+ref={ref}\s+className={cn\("text-center", className\)}\s+{\.\.\.props}\s+\/>/g,
        '<div ref={ref} className={cn("relative", className)}>\n' +
        '        <Input\n' +
        '          className={cn("text-center", className)}\n' +
        '          {...props}\n' +
        '        />\n' +
        '      </div>'
      );
      
      // Make sure the type is InputHTMLAttributes instead of HTMLAttributes
      content = content.replace(
        /React\.HTMLAttributes<HTMLDivElement>/g,
        'React.InputHTMLAttributes<HTMLDivElement>'
      );
    }
    
    // Write the file back
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filePath}`);
    
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
};

// Main function
const main = () => {
  const files = findOtpFiles();
  console.log(`Found ${files.length} input-otp.tsx files`);
  
  files.forEach(fixOtpFile);
  
  console.log('Done fixing input-otp.tsx files');
};

main(); 