# TypeScript Fixes Template

This document provides templates for fixing common TypeScript errors in UI component files.

## Fix 1: Replace namespace React imports with default imports

This fixes the TS2497 error: "This module can only be referenced with ECMAScript imports/exports..."

**Before:**
```typescript
import * as React from "react"
```

**After:**
```typescript
import React from "react"
```

## Fix 2: Add explicit type annotations to forwarded refs

This fixes the TS7006 error: "Parameter 'ref' implicitly has an 'any' type."

**Before:**
```typescript
const Component = React.forwardRef<
  React.ElementRef<typeof SomePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SomePrimitive.Root>
>(({ className, ...props }, ref) => (
  // Component implementation
))
```

**After:**
```typescript
const Component = React.forwardRef<
  React.ElementRef<typeof SomePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SomePrimitive.Root>
>(({ className, ...props }: React.ComponentPropsWithoutRef<typeof SomePrimitive.Root>, ref: React.ForwardedRef<React.ElementRef<typeof SomePrimitive.Root>>) => (
  // Component implementation
))
```

## Fix 3: Add explicit type annotations to destructured props

This fixes the TS7031 error: "Binding element 'className' implicitly has an 'any' type."

### Case 1: For components with className only

**Before:**
```typescript
const Component = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  // Component implementation
))
```

**After:**
```typescript
const Component = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }: React.HTMLAttributes<HTMLDivElement>, ref: React.ForwardedRef<HTMLDivElement>) => (
  // Component implementation
))
```

### Case 2: For components with className and children

**Before:**
```typescript
const Component = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  // Component implementation
))
```

**After:**
```typescript
const Component = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>, ref: React.ForwardedRef<HTMLDivElement>) => (
  // Component implementation
))
```

### Case 3: For components with className and variant props from class-variance-authority

**Before:**
```typescript
const Component = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof componentVariants>
>(({ className, variant, ...props }, ref) => (
  // Component implementation
))
```

**After:**
```typescript
const Component = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof componentVariants>
>(({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof componentVariants>, ref: React.ForwardedRef<HTMLDivElement>) => (
  // Component implementation
))
```

## Example Files

Here are examples of fixed component files:

### Example 1: NavigationMenu.tsx

```typescript
import React from "react"
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"
import { cva } from "class-variance-authority"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>, ref: React.ForwardedRef<React.ElementRef<typeof NavigationMenuPrimitive.Root>>) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "relative z-10 flex max-w-max flex-1 items-center justify-center",
      className
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
))
```

### Example 2: Alert.tsx

```typescript
import React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>, ref: React.ForwardedRef<HTMLDivElement>) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
``` 