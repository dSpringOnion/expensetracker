import * as React from "react"
import { cn } from "@/lib/utils"

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "text-sm font-semibold leading-none text-[#1d1c1d] peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block",
          className
        )}
        {...props}
      />
    )
  }
)
Label.displayName = "Label"

export { Label }