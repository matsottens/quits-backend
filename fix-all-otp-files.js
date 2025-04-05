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
    
    // Remove Input import
    content = content.replace(/import { Input } from ["']@\/components\/ui\/input["']/, 
                          '// import { Input } from "@/components/ui/input"');
    
    // Fix InputOTP interface to use HTMLInputElement
    content = content.replace(/extends React\.InputHTMLAttributes<HTMLDivElement>/g, 
                          'extends React.InputHTMLAttributes<HTMLInputElement>');
    
    // Fix forwardRef to use HTMLInputElement
    content = content.replace(/React\.forwardRef<HTMLDivElement, InputOTPProps>/g, 
                          'React.forwardRef<HTMLInputElement, InputOTPProps>');
    
    // Replace Input component with native input
    content = content.replace(/<Input[\s\S]*?className={cn\([^)]*\)}[\s\S]*?{\.\.\.props}[\s\S]*?\/>/g, 
                         `<input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "text-center",
          className
        )}
        {...props}
      />`);
    
    // Fix typing in the parameter destructuring
    content = content.replace(/\(\{ className, \.\.\.props \}: React\.InputHTMLAttributes<HTMLDivElement>, ref: React\.ForwardedRef<HTMLDivElement>\)/g,
                         '({ className, ...props }, ref)');
    
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