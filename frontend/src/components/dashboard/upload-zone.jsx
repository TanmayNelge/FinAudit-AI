import { useCallback, useRef, useState } from 'react'
import { UploadCloud, FileText, X, CheckCircle2, Lock, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { cn } from '@/lib/utils'

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState([])
  const inputRef = useRef(null)

  const startUpload = useCallback((files) => {
    const pdfs = Array.from(files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
    )

    pdfs.forEach((file) => {
      const id = `${file.name}-${Date.now()}-${Math.random()}`
      
      // 1. Insert file into active tracking array
      setUploads((prev) => [
        {
          id,
          name: file.name,
          size: formatSize(file.size),
          progress: 0,
          done: false,
          error: null,
        },
        ...prev,
      ])

      // 2. Prepare multipart data payload
      const formData = new FormData()
      formData.append('file', file)

      // 3. Fire real Axios request to Express server
      axios.post('http://localhost:5000/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Track actual HTTP progress
        onUploadProgress: (progressEvent) => {
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploads((prev) =>
            prev.map((u) => (u.id === id ? { ...u, progress: percentage } : u))
          )
        },
      })
      .then((response) => {
        // Handle successful API response
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, done: true, progress: 100 } : u))
        )
      })
      .catch((err) => {
        // Capture specific error responses or connection drops
        const errorMessage = err.response?.data?.error || 'Upload failed'
        setUploads((prev) =>
          prev.map((u) => (u.id === id ? { ...u, error: errorMessage } : u))
        )
      })
    })
  }, [])

  const onDrop = useCallback(
    (e) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files?.length) startUpload(e.dataTransfer.files)
    },
    [startUpload],
  )

  const removeUpload = (id) =>
    setUploads((prev) => prev.filter((u) => u.id !== id))

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Upload Documents
          </h2>
          <p className="text-xs text-muted-foreground">
            PDF files are scanned for compliance on upload
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <Lock className="size-3" aria-hidden="true" />
          Encrypted
        </span>
      </div>

      <div className="p-5">
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-background hover:border-primary/50 hover:bg-secondary/40',
          )}
          aria-label="Upload PDF documents by clicking or dragging files here"
        >
          <div
            className={cn(
              'flex size-12 items-center justify-center rounded-full border transition-colors',
              isDragging
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground',
            )}
          >
            <UploadCloud className="size-6" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            {isDragging ? 'Drop files to upload' : 'Drag & drop PDF files here'}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            or{' '}
            <span className="text-primary underline underline-offset-2">
              browse from your device
            </span>{' '}
            · Max 25 MB per file
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) startUpload(e.target.files)
              e.target.value = ''
            }}
          />
        </div>

        {uploads.length > 0 && (
          <ul className="mt-4 flex flex-col gap-2">
            {uploads.map((u) => (
              <li
                key={u.id}
                className={cn(
                  "flex items-center gap-3 rounded-md border bg-background px-3 py-2.5",
                  u.error ? "border-destructive/30 bg-destructive/5" : "border-border"
                )}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                  <FileText className="size-4" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm text-foreground">
                      {u.name}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground">
                      {u.size}
                    </span>
                  </div>
                  
                  {u.error ? (
                    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="size-3" /> {u.error}
                    </p>
                  ) : (
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-300',
                            u.done ? 'bg-emerald-500' : 'bg-primary',
                          )}
                          style={{ width: `${u.progress}%` }}
                        />
                      </div>
                      <span className="w-10 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                        {Math.round(u.progress)}%
                      </span>
                    </div>
                  )}
                </div>
                
                {u.done ? (
                  <CheckCircle2
                    className="size-4 shrink-0 text-emerald-500"
                    aria-label="Upload complete"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => removeUpload(u.id)}
                    aria-label={`Cancel upload of ${u.name}`}
                    className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}