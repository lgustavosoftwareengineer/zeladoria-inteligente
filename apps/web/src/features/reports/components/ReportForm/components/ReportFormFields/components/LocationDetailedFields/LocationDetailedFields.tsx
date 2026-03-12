"use client"

import { Field } from "@/components/ui/Field"
import { Input } from "@/components/ui/Input"
import { fetchAddressByCep } from "@/services/viacep"
import type { ReportFormValues } from "../../../../../../schemas/report.schema"
import type { UseMutationResult } from "@tanstack/react-query"
import type { FieldErrors, UseFormRegister } from "react-hook-form"

export type LocationDetailedFieldsProps = {
  register: UseFormRegister<ReportFormValues>
  errors: FieldErrors<ReportFormValues>
  cepMutation: UseMutationResult<
    Awaited<ReturnType<typeof fetchAddressByCep>>,
    Error,
    string
  >
  dirtyFields: Partial<Record<keyof ReportFormValues, boolean>>
  onCepBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  onCepChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function LocationDetailedFields({
  register,
  errors,
  cepMutation,
  dirtyFields,
  onCepBlur,
  onCepChange,
}: LocationDetailedFieldsProps) {
  const shouldAddressFieldBeReadonly =
    cepMutation.isSuccess && !!dirtyFields.cep

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field
          id="cep"
          label="CEP"
          required
          error={errors.cep?.message}
          className="col-span-1"
        >
          <div className="relative">
            <Input
              id="cep"
              type="text"
              placeholder="00000-000"
              maxLength={9}
              aria-invalid={!!errors.cep}
              aria-describedby={errors.cep ? "cep-error" : undefined}
              {...register("cep", {
                onBlur: onCepBlur,
                onChange: onCepChange,
              })}
            />
            {cepMutation.isPending && (
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-4 w-4 items-center justify-center"
                aria-hidden
              >
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            )}
          </div>
        </Field>

        <Field
          id="number"
          label="Número"
          error={errors.number?.message}
          className="col-span-1"
        >
          <Input
            id="number"
            type="text"
            placeholder="Ex: 123 (opcional)"
            aria-invalid={!!errors.number}
            aria-describedby={errors.number ? "number-error" : undefined}
            {...register("number")}
          />
        </Field>
      </div>

      <Field id="street" label="Rua" required error={errors.street?.message}>
        <Input
          id="street"
          type="text"
          placeholder="Preenchido automaticamente pelo CEP"
          readOnly={shouldAddressFieldBeReadonly}
          aria-invalid={!!errors.street}
          aria-describedby={errors.street ? "street-error" : undefined}
          {...register("street")}
        />
      </Field>

      <Field
        id="complement"
        label="Complemento"
        error={errors.complement?.message}
      >
        <Input
          id="complement"
          type="text"
          placeholder="Apto, bloco, referência... (opcional)"
          aria-invalid={!!errors.complement}
          aria-describedby={errors.complement ? "complement-error" : undefined}
          {...register("complement")}
        />
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field
          id="neighborhood"
          label="Bairro"
          required
          error={errors.neighborhood?.message}
          className="col-span-3 sm:col-span-1"
        >
          <Input
            id="neighborhood"
            type="text"
            placeholder="Bairro"
            readOnly={shouldAddressFieldBeReadonly}
            aria-invalid={!!errors.neighborhood}
            aria-describedby={
              errors.neighborhood ? "neighborhood-error" : undefined
            }
            {...register("neighborhood")}
          />
        </Field>

        <Field
          id="city"
          label="Cidade"
          required
          error={errors.city?.message}
          className="col-span-2 sm:col-span-1"
        >
          <Input
            id="city"
            type="text"
            placeholder="Cidade"
            readOnly={shouldAddressFieldBeReadonly}
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? "city-error" : undefined}
            {...register("city")}
          />
        </Field>

        <Field
          id="state"
          label="UF"
          required
          error={errors.state?.message}
          className="col-span-1"
        >
          <Input
            id="state"
            type="text"
            placeholder="UF"
            maxLength={2}
            readOnly={shouldAddressFieldBeReadonly}
            aria-invalid={!!errors.state}
            aria-describedby={errors.state ? "state-error" : undefined}
            {...register("state")}
          />
        </Field>
      </div>
    </div>
  )
}
