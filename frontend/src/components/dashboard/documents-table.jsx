import { Fragment, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api.js'
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  ChevronDown,
  Eye,
  Trash2,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/ui/confirm-dialog.jsx'
import { useToast } from '@/components/ui/use-toast.js'

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function DocumentsTable({ searchTerm = '', refreshSignal = 0 }) {
  const { toast } = useToast()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  // Poll the database every 5 seconds to catch live pipeline updates, and
  // refetch immediately whenever a new upload finishes.
  useEffect(() => {
    let cancelled = false
    const load = () =>
      api
        .get('/api/documents')
        .then((response) => {
          if (!cancelled) {
            setDocuments(response.data)
            setError('')
          }
        })
        .catch((err) => {
          if (cancelled) return
          console.error('Failed to sync document history:', err)
          setError('Unable to load documents right now.')
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })

    load()
    const interval = setInterval(load, 5000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [refreshSignal])

  const filteredDocuments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return documents
    return documents.filter(
      (doc) =>
        doc.fileName?.toLowerCase().includes(query) ||
        doc.flaggedIssues?.some(
          (issue) =>
            issue.clause?.toLowerCase().includes(query) ||
            issue.reason?.toLowerCase().includes(query),
        ),
    )
  }, [documents, searchTerm])

  const refresh = () => {
    api
      .get('/api/documents')
      .then((response) => {
        setDocuments(response.data)
        setError('')
      })
      .catch((err) => {
        console.error('Failed to sync document history:', err)
        setError('Unable to load documents right now.')
      })
  }

  const requestDelete = (doc) => {
    setDeleteTarget(doc)
    setDeleteError('')
  }

  const closeDelete = () => {
    if (deleting) return
    setDeleteTarget(null)
    setDeleteError('')
  }

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return
    setDeleting(true)
    setDeleteError('')
    try {
      await api.delete(`/api/documents/${deleteTarget._id}`)
      setDocuments((prev) => prev.filter((doc) => doc._id !== deleteTarget._id))
      setExpandedId(null)
      setDeleteTarget(null)
      toast.success(`"${deleteTarget.fileName}" was deleted.`)
    } catch (err) {
      console.error('Failed to delete document:', err)
      const status = err.response?.status
      if (status === 404) {
        setDeleteError('This document no longer exists. It may have already been deleted.')
      } else if (status === 401) {
        setDeleteError('Your session has expired. Please log in again.')
      } else {
        setDeleteError('Unable to delete this document. Please try again.')
      }
      toast.error('Unable to delete this document.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Synchronizing audit logs...
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Audit Registry</h2>
            <p className="text-xs text-muted-foreground">Historical ledger of analyzed pipelines</p>
          </div>
          <button
            onClick={refresh}
            className="rounded-md p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Refresh document list"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>

        {error && <p className="px-5 pt-3 text-xs text-destructive">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <th className="p-4">Document</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Compliance Score</th>
                <th className="w-20 p-4" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-xs text-muted-foreground">
                    {documents.length === 0
                      ? 'No execution records detected in this channel.'
                      : 'No documents match your search.'}
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => {
                  const hasIssues = doc.status === 'completed' && doc.flaggedIssues?.length > 0
                  const isExpanded = expandedId === doc._id
                  return (
                    <Fragment key={doc._id}>
                      <tr className="transition-colors hover:bg-secondary/20">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="rounded-md bg-secondary p-2 text-muted-foreground">
                              <FileText className="size-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-foreground truncate max-w-40 xl:max-w-56">
                                {doc.fileName}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {formatDate(doc.createdAt)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {doc.status === 'processing' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 border border-blue-500/20">
                              <Loader2 className="size-3 animate-spin" />
                              Auditing
                            </span>
                          )}
                          {doc.status === 'pending' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                              <Clock className="size-3" />
                              Pending
                            </span>
                          )}
                          {doc.status === 'completed' && (
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border',
                                doc.complianceScore >= 80
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                              )}
                            >
                              {doc.complianceScore >= 80 ? (
                                <CheckCircle2 className="size-3" />
                              ) : (
                                <AlertTriangle className="size-3" />
                              )}
                              Verified
                            </span>
                          )}
                          {doc.status === 'failed' && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive border border-destructive/20">
                              Rejected
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right font-mono font-semibold">
                          {doc.status === 'completed' ? (
                            <span
                              className={
                                doc.complianceScore >= 80 ? 'text-emerald-400' : 'text-amber-400'
                              }
                            >
                              {doc.complianceScore}%
                            </span>
                          ) : (
                            <span className="text-muted-foreground">--</span>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1">
                            {hasIssues && (
                              <button
                                type="button"
                                onClick={() => setExpandedId(isExpanded ? null : doc._id)}
                                aria-label={isExpanded ? 'Collapse flagged issues' : 'Expand flagged issues'}
                                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                              >
                                <ChevronDown
                                  className={cn(
                                    'size-4 transition-transform',
                                    isExpanded && 'rotate-180',
                                  )}
                                />
                              </button>
                            )}
                            <Link
                              to={`/documents/${doc._id}`}
                              aria-label={`View analysis for ${doc.fileName}`}
                              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                              <Eye className="size-4" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => requestDelete(doc)}
                              aria-label={`Delete ${doc.fileName}`}
                              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && hasIssues && (
                        <tr className="bg-secondary/10">
                          <td colSpan={4} className="p-4">
                            <div className="space-y-2 rounded-lg border border-border/60 bg-background p-4">
                              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                                AI Flagged Risks
                              </h4>
                              {doc.flaggedIssues.map((issue, idx) => (
                                <div key={idx} className="flex items-start gap-2 text-sm">
                                  <AlertTriangle
                                    className={cn(
                                      'size-4 shrink-0 mt-0.5',
                                      issue.severity === 'High'
                                        ? 'text-destructive'
                                        : issue.severity === 'Medium'
                                          ? 'text-amber-400'
                                          : 'text-blue-400',
                                    )}
                                  />
                                  <div>
                                    <span className="font-medium text-foreground">
                                      {issue.clause}:{' '}
                                    </span>
                                    <span className="text-muted-foreground">{issue.reason}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={deleteTarget !== null}
        onClose={closeDelete}
        title="Delete document?"
        description={
          deleteTarget
            ? `This will permanently remove "${deleteTarget.fileName}" and its associated compliance analysis. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete document"
        variant="danger"
        confirming={deleting}
        error={deleteError}
        onConfirm={confirmDelete}
      />
    </>
  )
}
