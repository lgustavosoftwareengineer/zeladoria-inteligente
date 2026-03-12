"use client"

import { cn } from "@/shared/cn"
import type { ReactNode } from "react"

export type FieldProps = {
  id: string
  label: string
  required?: boolean
  error?: string
  children: ReactNode
  className?: string
}

export function Field({
  id,
  label,
  required,
  error,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
      {error && (
        <p
          id={`${id}-error`}
          className="text-xs text-red-600"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  )
}
