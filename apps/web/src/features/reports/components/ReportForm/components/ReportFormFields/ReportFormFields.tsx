"use client"

import { Button } from "@/components/ui/Button"
import { Field } from "@/components/ui/Field"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { fetchAddressByCep } from "@/services/viacep"
import { LocationDetailedFields } from "./components/LocationDetailedFields"
import { LocationSimpleField } from "./components/LocationSimpleField"
import type {
  LocationMode,
  ReportFormValues,
} from "../../../../schemas/report.schema"
import type {
  CreateReportDto,
  ReportResponse,
} from "../../../../types/report.types"
import type { UseMutationResult } from "@tanstack/react-query"
import type {
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form"

export type ReportFormFieldsProps = {
  register: UseFormRegister<ReportFormValues>
  handleSubmit: UseFormHandleSubmit<ReportFormValues>
  onSubmit: (values: ReportFormValues) => void
  errors: FieldErrors<ReportFormValues>
  dirtyFields: Partial<Record<keyof ReportFormValues, boolean>>
  setValue: UseFormSetValue<ReportFormValues>
  cepMutation: UseMutationResult<
    Awaited<ReturnType<typeof fetchAddressByCep>>,
    Error,
    string
  >
  reportMutation: UseMutationResult<ReportResponse, Error, CreateReportDto>
  handleCepBlur: (event: React.FocusEvent<HTMLInputElement>) => void
  locationMode: LocationMode
  onToggleLocationMode: () => void
}

export function ReportFormFields({
  register,
  handleSubmit,
  onSubmit,
  errors,
  dirtyFields,
  setValue,
  cepMutation,
  reportMutation,
  handleCepBlur,
  locationMode,
  onToggleLocationMode,
}: ReportFormFieldsProps) {
  const { isError: hasError, error: errorData } = reportMutation

  const handleOnChangeCEP = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value.replace(/\D/g, "")
    event.target.value =
      raw.length > 5 ? `${raw.slice(0, 5)}-${raw.slice(5, 8)}` : raw

    if (raw.length === 0) {
      cepMutation.reset()
      setValue("street", "")
      setValue("neighborhood", "")
      setValue("city", "")
      setValue("state", "")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {hasError && (
        <div
          role="alert"
          aria-live="polite"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {errorData instanceof Error
            ? errorData.message
            : "Ocorreu um erro inesperado."}
        </div>
      )}

      <Field id="title" label="Título" required error={errors.title?.message}>
        <Input
          id="title"
          type="text"
          placeholder="Ex: Buraco na calçada"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          {...register("title")}
        />
      </Field>

      <Field
        id="description"
        label="Descrição do problema"
        required
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          rows={4}
          placeholder="Descreva o problema com detalhes..."
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? "description-error" : undefined
          }
          {...register("description")}
        />
      </Field>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {locationMode === "simple" ? (
            <label
              htmlFor="locationText"
              className="text-sm font-medium text-gray-700"
            >
              Localização <span className="text-red-500">*</span>
            </label>
          ) : (
            <p className="text-sm font-medium text-gray-700">
              Localização <span className="text-red-500">*</span>
            </p>
          )}
          <button
            type="button"
            onClick={onToggleLocationMode}
            className="text-xs text-blue-600 underline hover:text-blue-800"
          >
            {locationMode === "simple"
              ? "Usar endereço detalhado"
              : "Usar texto livre"}
          </button>
        </div>

        {locationMode === "simple" ? (
          <LocationSimpleField
            register={register}
            error={errors.locationText?.message}
          />
        ) : (
          <LocationDetailedFields
            register={register}
            errors={errors}
            cepMutation={cepMutation}
            dirtyFields={dirtyFields}
            onCepBlur={handleCepBlur}
            onCepChange={handleOnChangeCEP}
          />
        )}
      </div>

      <Button type="submit" variant="primary">
        Enviar Ocorrência
      </Button>
    </form>
  )
}
