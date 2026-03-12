"use client"

export function ReportFormLoading() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div
        className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
        aria-hidden
      />
      <p className="text-gray-600 font-medium">
        A IA está analisando sua ocorrência...
      </p>
      <p className="text-sm text-gray-400">Isso pode levar alguns segundos.</p>
    </div>
  )
}
