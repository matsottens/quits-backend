"use client"

import * as React from 'react'; // Fixed import
import { GripVertical } from "lucide-react"

import { cn } from "@/lib/utils"

const ResizablePanel = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("relative flex h-full w-full", className)}
      {...props}
    >
      {children}
    </div>
  )
}

const ResizableHandle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        className
      )}
      {...props}
    >
      <GripVertical className="h-4 w-4 text-muted-foreground" />
    </div>
  )
}

const ResizablePanelGroup = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("flex h-full w-full data-[panel-group-direction=vertical]:flex-col", className)}
      {...props}
    />
  )
}

const ResizablePanelResizeHandle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 cursor-col-resize bg-border opacity-0 transition-opacity hover:opacity-100",
        className
      )}
      {...props}
    />
  )
}

export {
  ResizablePanel,
  ResizableHandle,
  ResizablePanelGroup,
  ResizablePanelResizeHandle,
} 