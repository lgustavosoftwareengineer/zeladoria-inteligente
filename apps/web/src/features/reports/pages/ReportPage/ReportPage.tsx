import { ReportForm } from "../../components/ReportForm"

export function ReportPage() {
  return (
    <main className="flex min-h-screen items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Zeladoria Inteligente
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Viu algum problema na sua rua ou bairro? Conta aqui que a gente
            classifica e encaminha pra quem pode resolver.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <ReportForm />
        </div>
      </div>
    </main>
  )
}
