"use client"

import { Button } from "@/components/ui/Button"
import type { ReportResponse } from "../../../../types/report.types"
import { PriorityBadge } from "./components"

type ReportFormSuccessProps = {
  report: ReportResponse
  onNewReport: () => void
}

export function ReportFormSuccess({
  report,
  onNewReport,
}: ReportFormSuccessProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
        <p className="font-semibold text-green-700">
          Ocorrência registrada com sucesso!
        </p>
        <p className="text-sm text-green-600 mt-1">
          Protocolo: <span className="font-mono">{report.id}</span>
        </p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-4">
        <h2 className="font-semibold text-gray-800 text-lg">Análise</h2>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-100 text-blue-700 px-3 py-1 text-sm font-medium">
            {report.category}
          </span>
          <PriorityBadge priority={report.priority} />
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">
            Resumo técnico
          </p>
          <p className="text-gray-700 text-sm leading-relaxed">
            {report.technicalSummary}
          </p>
        </div>
      </div>

      <Button type="button" variant="secondary" onClick={onNewReport}>
        Registrar nova ocorrência
      </Button>
    </div>
  )
}
