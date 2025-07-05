import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#007a5a] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#007a5a] text-white shadow hover:bg-[#006644]",
        destructive:
          "bg-[#e01e5a] text-white shadow-sm hover:bg-[#cc1a51]",
        outline:
          "border border-[#d1d1d1] bg-white shadow-sm hover:bg-[#f6f6f6] text-[#1d1c1d]",
        secondary:
          "bg-[#f8f8f8] text-[#1d1c1d] shadow-sm hover:bg-[#eeeeee] border border-[#e1e1e1]",
        ghost: "hover:bg-[#f6f6f6] text-[#1d1c1d]",
        link: "text-[#1264a3] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }