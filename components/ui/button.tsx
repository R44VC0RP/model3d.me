import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "appearance-none bg-[#466F80] border border-[rgba(27,31,35,.15)] text-white cursor-pointer font-semibold leading-5 relative text-center no-underline select-none touch-manipulation align-middle whitespace-nowrap shadow-[rgba(27,31,35,.1)_0_1px_0] hover:bg-[#5a7d95] focus:shadow-[rgba(70,111,128,.4)_0_0_0_3px] focus:outline-none disabled:bg-[#a3b5c2] disabled:border-[rgba(27,31,35,.1)] disabled:text-[rgba(255,255,255,.8)] disabled:cursor-default active:bg-[#3a5a6b] active:shadow-[rgba(20,70,32,.2)_0_1px_0_inset]",
        destructive:
          "appearance-none bg-[#dc3545] border border-[rgba(27,31,35,.15)] text-white cursor-pointer font-semibold leading-5 relative text-center no-underline select-none touch-manipulation align-middle whitespace-nowrap shadow-[rgba(27,31,35,.1)_0_1px_0] hover:bg-[#c82333] focus:shadow-[rgba(220,53,69,.4)_0_0_0_3px] focus:outline-none disabled:bg-[#f5c6cb] disabled:border-[rgba(27,31,35,.1)] disabled:text-[rgba(255,255,255,.8)] disabled:cursor-default active:bg-[#bd2130] active:shadow-[rgba(20,70,32,.2)_0_1px_0_inset]",
        outline:
          "appearance-none bg-transparent border border-[#466F80] text-[#466F80] cursor-pointer font-semibold leading-5 relative text-center no-underline select-none touch-manipulation align-middle whitespace-nowrap shadow-[rgba(27,31,35,.1)_0_1px_0] hover:bg-[#466F80] hover:text-white focus:shadow-[rgba(70,111,128,.4)_0_0_0_3px] focus:outline-none disabled:bg-transparent disabled:border-[rgba(70,111,128,.3)] disabled:text-[rgba(70,111,128,.5)] disabled:cursor-default active:bg-[#3a5a6b] active:text-white active:shadow-[rgba(20,70,32,.2)_0_1px_0_inset]",
        secondary:
          "appearance-none bg-[#FAFBFC] border border-[rgba(27,31,35,0.15)] text-[#24292E] cursor-pointer font-medium leading-5 relative transition-[background-color_0.2s_cubic-bezier(0.3,0,0.5,1)] select-none touch-manipulation align-middle whitespace-nowrap break-words shadow-[rgba(27,31,35,0.04)_0_1px_0,rgba(255,255,255,0.25)_0_1px_0_inset] hover:bg-[#F3F4F6] hover:no-underline hover:duration-100 disabled:bg-[#FAFBFC] disabled:border-[rgba(27,31,35,0.15)] disabled:text-[#959DA5] disabled:cursor-default active:bg-[#EDEFF2] active:shadow-[rgba(225,228,232,0.2)_0_1px_0_inset] active:transition-none focus:outline-transparent",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
