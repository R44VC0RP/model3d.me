import * as React from "react"
import { cn } from "@/lib/utils"

interface M3DLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function M3DLogo({ className, width = 24, height = 27 }: M3DLogoProps) {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 179 200" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={cn("inline-block", className)}
    >
      <path 
        fillRule="evenodd" 
        clipRule="evenodd" 
        d="M178.942 60.706C178.942 53.0562 174.861 45.9876 168.236 42.1627L100.177 2.86865C93.5523 -0.956216 85.3901 -0.956218 78.7652 2.86865L10.706 42.1627C4.08109 45.9876 0 53.0562 0 60.7059V139.294C0 146.944 4.08108 154.012 10.7059 157.837L78.7652 197.131C85.3901 200.956 93.5523 200.956 100.177 197.131L168.236 157.837C174.861 154.012 178.942 146.944 178.942 139.294V60.706ZM19.2707 93.31C19.2707 88.3396 24.6735 85.2523 28.9556 87.7759L84.0357 120.235C87.3898 122.212 91.5526 122.212 94.9067 120.235L149.987 87.7759C154.269 85.2524 159.672 88.3396 159.672 93.3099V134.349C159.672 138.174 157.631 141.708 154.319 143.621L94.8242 177.97C91.5117 179.882 87.4306 179.882 84.1182 177.97L24.6237 143.621C21.3113 141.708 19.2707 138.174 19.2707 134.349V93.31Z" 
        fill="currentColor"
      />
    </svg>
  )
}

