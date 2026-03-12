export type CreateReportDto = {
  title: string
  description: string
  location: string
}

export type ReportResponse = {
  id: string
  title: string
  description: string
  location: string
  category: string
  priority: "Baixa" | "Média" | "Alta"
  technicalSummary: string
  createdAt: string
}
