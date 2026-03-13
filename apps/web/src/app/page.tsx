import { ReportForm } from "@/features/reports"

export default function Home() {
  return (
    <main className="flex min-h-screen items-start justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            📞 Zeladoria Inteligente
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Mande aqui o problema urbano que está acontecendo pertinho de você e
            vamos lhe ajudar a classificá-lo melhor!
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <ReportForm />
        </div>
      </div>
    </main>
  )
}
