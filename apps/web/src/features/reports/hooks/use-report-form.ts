"use client"

import { useMutation } from "@tanstack/react-query"
import { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { fetchAddressByCep } from "@/services/viacep"
import { DEFAULT_VALUES } from "../constants/report-form.constants"
import { createReport } from "../requests/create-report"
import {
  buildReportResolver,
  type LocationMode,
  type ReportFormValues,
} from "../schemas/report.schema"
import { formatLocation } from "../utils/address"

export function useReportForm() {
  const [locationMode, setLocationMode] = useState<LocationMode>("simple")

  const form = useForm<ReportFormValues>({
    resolver: buildReportResolver(locationMode),
    defaultValues: DEFAULT_VALUES,
  })

  const { setValue, setError, clearErrors, reset } = form
  const { errors, dirtyFields } = form.formState

  const toggleLocationMode = useCallback(() => {
    setLocationMode((prev) => {
      const next = prev === "simple" ? "detailed" : "simple"
      clearErrors()
      return next
    })
  }, [clearErrors])

  const cepMutation = useMutation({
    mutationFn: fetchAddressByCep,
    onSuccess: (address) => {
      setValue("street", address.street)
      setValue("neighborhood", address.neighborhood)
      setValue("city", address.city)
      setValue("state", address.state)
      clearErrors("cep")
    },
    onError: (error) => {
      setError("cep", {
        message: error instanceof Error ? error.message : "CEP inválido.",
      })
      setValue("street", "")
      setValue("neighborhood", "")
      setValue("city", "")
      setValue("state", "")
    },
  })

  const reportMutation = useMutation({
    mutationFn: createReport,
  })

  const handleCepBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      const cep = event.target.value.replace(/\D/g, "")
      if (cep.length === 8) {
        cepMutation.mutate(cep)
      }
    },
    [cepMutation],
  )

  const handleNewReport = useCallback(() => {
    reportMutation.reset()
    cepMutation.reset()
    reset()
    setLocationMode("detailed")
  }, [cepMutation, reportMutation, reset])

  const onSubmit = useCallback(
    (values: ReportFormValues) => {
      const location =
        locationMode === "simple"
          ? (values.locationText ?? "")
          : formatLocation(values)

      reportMutation.mutate({
        title: values.title,
        description: values.description,
        location,
      })
    },
    [reportMutation, locationMode],
  )

  return {
    form,
    cepMutation,
    reportMutation,
    handleCepBlur,
    onSubmit,
    handleNewReport,
    errors,
    dirtyFields,
    locationMode,
    toggleLocationMode,
  }
}
