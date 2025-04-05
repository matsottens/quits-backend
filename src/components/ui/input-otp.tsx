"use client"

import * as React from 'react'; // Fixed import
import { Dot } from "lucide-react"

import { cn } from "@/lib/utils"

// No longer importing the Input component
// // import { Input } from "@/components/ui/input"

export interface InputOTPProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const InputOTP = React.forwardRef<HTMLInputElement, InputOTPProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "text-center",
          className
        )}
        {...props}
      />
    )
  }
)
InputOTP.displayName = "InputOTP"

export interface InputOTPGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const InputOTPGroup = React.forwardRef<HTMLDivElement, InputOTPGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1", className)}
        {...props}
      />
    )
  }
)
InputOTPGroup.displayName = "InputOTPGroup"

export interface InputOTPSlotProps
  extends React.HTMLAttributes<HTMLDivElement> {
  char?: string
  hasFakeCaret?: boolean
}

const InputOTPSlot = React.forwardRef<HTMLDivElement, InputOTPSlotProps>(
  ({ className, char, hasFakeCaret, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-10 w-10 rounded-md border border-input bg-background text-center text-sm shadow-sm transition-all",
          className
        )}
        {...props}
      >
        {char}
        {hasFakeCaret && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
          </div>
        )}
      </div>
    )
  }
)
InputOTPSlot.displayName = "InputOTPSlot"

export interface InputOTPSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const InputOTPSeparator = React.forwardRef<HTMLDivElement, InputOTPSeparatorProps>(
  ({ ...props }, ref) => {
    return (
      <div ref={ref} role="separator" {...props}>
        <Dot className="h-4 w-4" />
      </div>
    )
  }
)
InputOTPSeparator.displayName = "InputOTPSeparator"

export {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} 