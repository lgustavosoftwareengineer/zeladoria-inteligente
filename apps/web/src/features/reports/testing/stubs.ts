import type { ViaCepAddress } from "@/services/viacep"
import type { CreateReportDto, ReportResponse } from "../types/report.types"

export const STUB_REPORT: ReportResponse = {
  id: "abc-123",
  title: "Buraco na rua",
  description: "Há um buraco enorme na calçada.",
  location: "Praça da Sé, 1, Sé, São Paulo - SP, CEP 01001-000",
  category: "Via Pública",
  priority: "Alta",
  technicalSummary:
    "Irregularidade no pavimento que representa risco à segurança.",
  createdAt: "2026-03-12T00:00:00.000Z",
}

export const STUB_DTO: CreateReportDto = {
  title: "Buraco na rua",
  description: "Há um buraco enorme na calçada.",
  location: "Praça da Sé, 1, Sé, São Paulo - SP, CEP 01001-000",
}

export const STUB_RESPONSE: ReportResponse = STUB_REPORT

export const STUB_ADDRESS: ViaCepAddress = {
  street: "Praça da Sé",
  neighborhood: "Sé",
  city: "São Paulo",
  state: "SP",
}
