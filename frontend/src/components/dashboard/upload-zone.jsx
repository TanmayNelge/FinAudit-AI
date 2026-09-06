import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  Lock,
  AlertCircle,
  Loader2,
  Check,
  RotateCw,
  ArrowRight,
} from 'lucide-react'
import { api } from '@/lib/api.js'
import { cn } from '@/lib/utils'

const MAX_FILE_SIZE = 25 * 1024 * 1024

// Stages shown while a document moves through the compliance pipeline.
const PIPELINE_STAGES = ['Processing', 'Extracting text', 'Analyzing compliance', 'Generating report']
const STAGE_TICK_MS = 2200

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isPdf(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

export function UploadZone({ onUploadComplete }) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploads, setUploads] = useState([])
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Keep the latest callback without re-creating the upload handlers.
  const onUploadCompleteRef = useRef(onUploadComplete)
  useEffect(() => {
    onUploadCompleteRef.current = onUploadComplete
  }, [onUploadComplete])

  const updateItem = (id, patch) =>
    setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)))

  const runUpload = useCallback((file, itemId) => {
    const formData = new FormData()
    formData.append('file', file)

    api
      .post('/api/upload', formData, {
        // Track actual HTTP progress for the raw transfer.
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return
          const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          if (percentage >= 100) {
            // Transfer finished — the backend is now running the analysis.
            updateItem(itemId, { phase: 'analyzing', stageIndex: 0 })
          } else {
            updateItem(itemId, { progress: percentage })
          }
        },
      })
      .then((response) => {
        const doc = response.data.document
        updateItem(itemId, {
          phase: 'done',
          progress: 100,
          documentId: doc?._id || null,
          error: null,
        })
        onUploadCompleteRef.current?.()
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.error || 'Upload failed. Please try again.'
        updateItem(itemId, { phase: 'error', error: errorMessage })
      })
  }, [])

  const startUpload = useCallback(
    (files) => {
      Array.from(files).forEach((file) => {
        const id = `${file.name}-${Date.now()}-${Math.random()}`
        const base = {
          id,
          name: file.name,
          size: formatSize(file.size),
          file,
          phase: 'uploading',
          progress: 0,
          stageIndex: 0,
          error: null,
          documentId: null,
        }

        if (!isPdf(file)) {
          setUploads((prev) => [
            { ...base, file: null, phase: 'error', error: 'Only PDF files are supported.' },
            ...prev,
          ])
          return
        }
        if (file.size > MAX_FILE_SIZE) {
          setUploads((prev) => [
            { ...base, file: null, phase: 'error', error: 'File exceeds the 25 MB size limit.' },
            ...prev,
          ])
          return
        }

        setUploads((prev) => [base, ...prev])
        runUpload(file, id)
      })
    },
    [runUpload],
  )

  // Advance the "in analysis" stage indicator while the backend is working.
  useEffect(() => {
    if (!uploads.some((u) => u.phase === 'analyzing')) return
    const interval = setInterval(() => {
      setUploads((prev) =>
        prev.map((u) =>
          u.phase === 'analyzing' && u.stageIndex < PIPELINE_STAGES.length - 1
            ? { ...u, stageIndex: u.stageIndex + 1 }
            : u,
        ),
      )
    }, STAGE_TICK_MS)
    return () => clearInterval(interval)
  }, [uploads])

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

  const retryUpload = (id, file) => {
    updateItem(id, {
      phase: 'uploading',
      progress: 0,
      stageIndex: 0,
      error: null,
      documentId: null,
    })
    runUpload(file, id)
  }

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
            · PDF only · Max 25 MB per file
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
                  'rounded-md border bg-background px-3 py-2.5',
                  u.phase === 'error'
                    ? 'border-destructive/30 bg-destructive/5'
                    : u.phase === 'done'
                      ? 'border-emerald-500/20'
                      : 'border-border',
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                    {u.phase === 'done' ? (
                      <CheckCircle2 className="size-4 text-emerald-500" aria-hidden="true" />
                    ) : u.phase === 'error' ? (
                      <AlertCircle className="size-4 text-destructive" aria-hidden="true" />
                    ) : (
                      <FileText className="size-4" aria-hidden="true" />
                    )}
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

                    {u.phase === 'uploading' && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${u.progress}%` }}
                          />
                        </div>
                        <span className="w-16 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
                          Uploading {Math.round(u.progress)}%
                        </span>
                      </div>
                    )}

                    {u.phase === 'analyzing' && (
                      <div className="mt-2 flex flex-col gap-1">
                        {PIPELINE_STAGES.map((stage, index) => {
                          const isCurrent = index === u.stageIndex
                          const isDone = index < u.stageIndex
                          return (
                            <span
                              key={stage}
                              className={cn(
                                'flex items-center gap-1.5 text-[11px]',
                                isCurrent
                                  ? 'text-foreground'
                                  : isDone
                                    ? 'text-primary'
                                    : 'text-muted-foreground/60',
                              )}
                            >
                              {isCurrent ? (
                                <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                              ) : isDone ? (
                                <Check className="size-3" aria-hidden="true" />
                              ) : (
                                <span className="size-3 rounded-full border border-muted-foreground/40" />
                              )}
                              {stage}
                            </span>
                          )
                        })}
                      </div>
                    )}

                    {u.phase === 'done' && (
                      <p className="mt-1 text-xs text-emerald-500">
                        Analysis complete
                      </p>
                    )}

                    {u.phase === 'error' && (
                      <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3" aria-hidden="true" />
                        {u.error}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {u.phase === 'done' && u.documentId && (
                      <button
                        type="button"
                        onClick={() => navigate(`/documents/${u.documentId}`)}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                      >
                        View analysis
                        <ArrowRight className="size-3" aria-hidden="true" />
                      </button>
                    )}
                    {u.phase === 'error' && u.file && (
                      <button
                        type="button"
                        onClick={() => retryUpload(u.id, u.file)}
                        aria-label={`Retry upload of ${u.name}`}
                        className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <RotateCw className="size-3.5" aria-hidden="true" />
                      </button>
                    )}
                    {u.phase !== 'done' && (
                      <button
                        type="button"
                        onClick={() => removeUpload(u.id)}
                        aria-label={`Remove ${u.name} from the list`}
                        className="flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}