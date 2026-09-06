import { StatCards } from '@/components/dashboard/stat-cards.jsx'
import { UploadZone } from '@/components/dashboard/upload-zone.jsx'
import { DocumentsTable } from '@/components/dashboard/documents-table.jsx'

export function DashboardPage({ searchTerm, refreshSignal, onRefresh }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <StatCards />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="xl:col-span-2">
          <UploadZone onUploadComplete={onRefresh} />
        </div>
        <div className="xl:col-span-3">
          <DocumentsTable searchTerm={searchTerm} refreshSignal={refreshSignal} />
        </div>
      </div>
    </div>
  )
}
