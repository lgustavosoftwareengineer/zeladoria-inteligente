"use client"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/shared/cn"
import type { ComponentPropsWithoutRef } from "react"

const badgeVariants = cva("rounded-full px-3 py-1 text-sm font-medium", {
  variants: {
    type: {
      danger: "bg-red-100 text-red-700",
      warn: "bg-yellow-100 text-yellow-700",
      success: "bg-green-100 text-green-700",
    },
  },
})

export type BadgeType = NonNullable<VariantProps<typeof badgeVariants>["type"]>

export type BadgeProps = ComponentPropsWithoutRef<"span"> & { type: BadgeType }

export function Badge({ type, className, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ type }), className)} {...props} />
}
