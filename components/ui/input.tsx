import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 text-base shadow-sm transition-all duration-300 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-400 focus:border-[#0a4a68] focus:bg-white focus:ring-4 focus:ring-[#0a4a68]/10 focus:shadow-lg focus:shadow-[#0a4a68]/5 focus:-translate-y-0.5 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 hover:border-[#0a4a68]/40 hover:bg-white md:text-base",
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
