"use client"

import { useReportForm } from "../../hooks/use-report-form"
import { ReportFormFields } from "./components/ReportFormFields"
import { ReportFormLoading } from "./components/ReportFormLoading"
import { ReportFormSuccess } from "./components/ReportFormSuccess"

export function ReportForm() {
  const {
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
  } = useReportForm()
  const { isPending: isLoading, isSuccess, data: reportData } = reportMutation

  if (isLoading) {
    return <ReportFormLoading />
  }

  if (isSuccess && reportData) {
    return (
      <ReportFormSuccess
        report={reportMutation.data}
        onNewReport={handleNewReport}
      />
    )
  }

  return (
    <ReportFormFields
      register={form.register}
      handleSubmit={form.handleSubmit}
      onSubmit={onSubmit}
      errors={errors}
      dirtyFields={dirtyFields}
      setValue={form.setValue}
      cepMutation={cepMutation}
      reportMutation={reportMutation}
      handleCepBlur={handleCepBlur}
      locationMode={locationMode}
      onToggleLocationMode={toggleLocationMode}
    />
  )
}
