import type { CreateReportDto, ReportResponse } from "../types/report.types"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function createReport(
  dto: CreateReportDto,
): Promise<ReportResponse> {
  const response = await fetch(`${API_URL}/api/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  })

  if (!response.ok) {
    const error = (await response.json().catch(() => ({}))) as {
      message?: string
    }
    throw new Error(error.message ?? "Serviço temporariamente indisponível.")
  }

  return response.json() as Promise<ReportResponse>
}
