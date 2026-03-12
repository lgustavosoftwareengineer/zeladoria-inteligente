"use client"

import { Textarea } from "@/components/ui/Textarea"
import type { ReportFormValues } from "../../../../../../schemas/report.schema"
import type { UseFormRegister } from "react-hook-form"

export type LocationSimpleFieldProps = {
  register: UseFormRegister<ReportFormValues>
  error?: string
}

export function LocationSimpleField({
  register,
  error,
}: LocationSimpleFieldProps) {
  return (
    <div className="space-y-1">
      <Textarea
        id="locationText"
        rows={2}
        placeholder="Ex: Rua das Flores, próximo ao número 900, bairro Centro"
        aria-invalid={!!error}
        aria-describedby={error ? "locationText-error" : undefined}
        {...register("locationText")}
      />
      {error && (
        <p
          id="locationText-error"
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
