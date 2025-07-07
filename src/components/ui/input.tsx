import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-[#d1d1d1] bg-white px-3 py-2 text-sm text-[#1d1c1d] font-medium transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#616061] placeholder:font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007a5a] focus-visible:border-[#007a5a] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }