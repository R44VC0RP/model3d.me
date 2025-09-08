import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full appearance-none bg-[#FAFBFC] border border-[rgba(27,31,35,0.15)] text-[#24292E] cursor-text font-medium leading-5 relative transition-[background-color_0.2s_cubic-bezier(0.3,0,0.5,1)] select-text touch-manipulation break-words shadow-[rgba(27,31,35,0.04)_0_1px_0,rgba(255,255,255,0.25)_0_1px_0_inset] hover:bg-[#F3F4F6] hover:duration-100 disabled:bg-[#FAFBFC] disabled:border-[rgba(27,31,35,0.15)] disabled:text-[#959DA5] disabled:cursor-not-allowed focus:outline-none focus:bg-white focus:border-[#0969da] focus:shadow-[0_0_0_3px_rgba(9,105,218,0.3)] px-3 py-2 rounded-md text-sm placeholder:text-[#959DA5]",
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
