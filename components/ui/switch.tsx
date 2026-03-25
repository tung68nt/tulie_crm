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
        "peer inline-flex h-[26px] w-[46px] shrink-0 cursor-pointer items-center rounded-full border border-zinc-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900 data-[state=unchecked]:bg-zinc-100",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-[20px] rounded-full shadow-sm transition-transform data-[state=checked]:translate-x-[21px] data-[state=unchecked]:translate-x-[1px] data-[state=checked]:bg-white data-[state=unchecked]:bg-white data-[state=unchecked]:border data-[state=unchecked]:border-zinc-300"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }

