"use client"

import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/shared/cn"

export type InputProps = ComponentPropsWithoutRef<"input">

export function Input({ className, readOnly, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition",
        "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-gray-50 disabled:text-gray-400",
        readOnly &&
          "bg-gray-50 border-gray-200 text-gray-500 cursor-default focus:border-gray-200 focus:ring-0",
        className,
      )}
      readOnly={readOnly}
      {...props}
    />
  )
}
