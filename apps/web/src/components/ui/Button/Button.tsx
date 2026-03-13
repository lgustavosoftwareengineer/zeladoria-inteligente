"use client"

import { cva, type VariantProps } from "class-variance-authority"
import type { ComponentPropsWithoutRef } from "react"
import { cn } from "@/shared/cn"

const buttonVariants = cva("w-full rounded-lg text-sm transition", {
  variants: {
    variant: {
      primary:
        "bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700 active:scale-95",
      secondary: "border border-gray-300 py-2 text-gray-600 hover:bg-gray-50",
    },
  },
  defaultVariants: { variant: "primary" },
})

export type ButtonProps = ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants>

export function Button({ variant, className, ...props }: ButtonProps) {
  return (
    <button className={cn(buttonVariants({ variant }), className)} {...props} />
  )
}
