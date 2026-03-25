"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=unchecked]:bg-zinc-200",
        // Mobile: 52×28 track
        "h-[28px] w-[52px]",
        // Desktop: 44×24 track
        "sm:h-[24px] sm:w-[44px]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-sm transition-transform",
          // Mobile: 18px thumb — 5px gap from edges
          "size-[18px] data-[state=checked]:translate-x-[29px] data-[state=unchecked]:translate-x-[5px]",
          // Desktop: 16px thumb — 4px gap
          "sm:size-[16px] sm:data-[state=checked]:translate-x-[24px] sm:data-[state=unchecked]:translate-x-[4px]"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
