import { DocumentsTable } from '@/components/dashboard/documents-table.jsx'

export function DocumentsPage({ searchTerm, refreshSignal }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="mb-1">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Documents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review every uploaded document, its compliance score and flagged risks.
        </p>
      </div>
      <DocumentsTable searchTerm={searchTerm} refreshSignal={refreshSignal} />
    </div>
  )
}
