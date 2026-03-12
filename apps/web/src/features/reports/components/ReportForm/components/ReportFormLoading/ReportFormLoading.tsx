"use client"

export function ReportFormLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
        aria-hidden
      />
      <p className="text-gray-600 font-medium">
        Espera só um momento que estamos analisando a sua ocorrência
        <span className="inline-flex" aria-hidden>
          <span
            className="animate-loading-dot"
            style={{ animationDelay: "0s" }}
          >
            .
          </span>
          <span
            className="animate-loading-dot"
            style={{ animationDelay: "0.4s" }}
          >
            .
          </span>
          <span
            className="animate-loading-dot"
            style={{ animationDelay: "0.8s" }}
          >
            .
          </span>
        </span>
      </p>
      <p className="text-sm text-gray-400">Isso pode levar alguns segundos.</p>
    </div>
  )
}
