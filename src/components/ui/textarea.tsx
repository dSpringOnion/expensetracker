import * as React from "react"
import { cn } from "@/lib/utils"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-[#d1d1d1] bg-white px-3 py-2 text-sm text-[#1d1c1d] font-medium shadow-sm placeholder:text-[#616061] placeholder:font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a5a] focus-visible:border-[#007a5a] disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }