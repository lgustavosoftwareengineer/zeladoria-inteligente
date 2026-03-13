import { screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { renderWithProviders as renderWithQueryClient } from "@/features/reports/testing/mocks"
import { ReportPage } from "./ReportPage"

export function renderWithProviders() {
  return renderWithQueryClient(<ReportPage />)
}

export function getSubmitForm() {
  return screen.getByRole("button", { name: /enviar/i }).closest("form")!
}

export function switchToDetailedLocation() {
  fireEvent.click(
    screen.getByRole("button", { name: /usar endereço detalhado/i }),
  )
}

export async function fillRequiredFields() {
  await userEvent.type(screen.getByLabelText(/título/i), "Buraco na calçada")
  await userEvent.type(
    screen.getByLabelText(/descrição do problema/i),
    "Há um buraco enorme e perigoso na calçada principal.",
  )
  switchToDetailedLocation()
  // fireEvent.change bypasses the CEP mask handler and directly updates RHF state
  fireEvent.change(screen.getByLabelText(/cep/i), {
    target: { value: "01001-000" },
  })
  await userEvent.type(screen.getByLabelText(/número/i), "10")
  await userEvent.type(screen.getByLabelText(/rua/i), "Praça da Sé")
  await userEvent.type(screen.getByLabelText(/bairro/i), "Sé")
  await userEvent.type(screen.getByLabelText(/cidade/i), "São Paulo")
  await userEvent.type(screen.getByLabelText(/uf/i), "SP")
}
