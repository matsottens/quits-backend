import * as React from "react"
import { cn } from "@/lib/utils"

const Typography = {
  h1: React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
  >(({ className, ...props }, ref) => (
    <h1
      ref={ref}
      className={cn("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl", className)}
      {...props}
    />
  )),
  h2: React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
  >(({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("scroll-m-20 text-3xl font-semibold tracking-tight", className)}
      {...props}
    />
  )),
  p: React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
  >(({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  )),
  span: React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
  >(({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("", className)}
      {...props}
    />
  )),
}

Typography.h1.displayName = "Typography.h1"
Typography.h2.displayName = "Typography.h2"
Typography.p.displayName = "Typography.p"
Typography.span.displayName = "Typography.span"

export { Typography } 