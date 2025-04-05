#!/bin/bash

# Find all UI component files
UI_COMPONENTS=$(find src -name "*.tsx" | grep -E "components/ui/")

# Process each file
for file in $UI_COMPONENTS; do
  echo "Processing $file..."
  
  # Create a temporary file
  tempfile=$(mktemp)
  
  # 1. Replace namespace React imports with default imports
  # This fixes the TS2497 error
  sed 's/import \* as React from "react"/import React from "react"/' "$file" > "$tempfile"
  
  # 2. Add temporary markers for forwardRef patterns to make sed replacements easier
  sed -i '' -E 's/\(\(\{ ([^,]*), ([^\.]*)(, \.\.\.props)? \}, ref\) =>/(\(\{ \1, \2\3 \}: React.ComponentPropsWithoutRef<typeof \1Primitive.\1>, ref: React.ForwardedRef<React.ElementRef<typeof \1Primitive.\1>>) =>/' "$tempfile"
  
  # 3. Fix common patterns where className and/or children are destructured with no type
  sed -i '' -E 's/\(\(\{ className, \.\.\.(props|rest) \}, ref\) =>/(\(\{ className, ...\1 \}: React.HTMLAttributes<HTMLDivElement>, ref: React.ForwardedRef<HTMLDivElement>) =>/' "$tempfile"
  sed -i '' -E 's/\(\(\{ className, children, \.\.\.(props|rest) \}, ref\) =>/(\(\{ className, children, ...\1 \}: React.HTMLAttributes<HTMLDivElement>, ref: React.ForwardedRef<HTMLDivElement>) =>/' "$tempfile"
  
  # 4. Copy the temp file back to the original
  cp "$tempfile" "$file"
  
  # 5. Clean up
  rm "$tempfile"
done

echo "Fixes applied to UI component files" 