import { UploadZone } from '@/components/dashboard/upload-zone.jsx'

export function UploadPage({ onRefresh }) {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Upload Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Drag and drop PDFs to run a fresh compliance audit.
        </p>
      </div>
      <UploadZone onUploadComplete={onRefresh} />
    </div>
  )
}
