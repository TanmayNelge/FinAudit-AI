import { Fragment, useEffect, useMemo, useState } from 'react'
import { api } from '@/lib/api.js'
import { FileText, CheckCircle2, AlertTriangle, Loader2, RefreshCw, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DocumentsTable({ searchTerm = '', refreshSignal = 0 }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedId, setExpandedId] = useState(null)

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/api/documents')
      setDocuments(response.data)
      setError('')
    } catch (err) {
      console.error('Failed to sync document history:', err)
      setError('Unable to load documents right now.')
    } finally {
      setLoading(false)
    }
  }

  // Poll the database every 5 seconds to catch live pipeline updates,
  // and refetch immediately whenever a new upload finishes.
  useEffect(() => {
    fetchDocuments()
    const interval = setInterval(fetchDocuments, 5000)
    return () => clearInterval(interval)
  }, [refreshSignal])

  const filteredDocuments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return documents
    return documents.filter((doc) => doc.fileName?.toLowerCase().includes(query))
  }, [documents, searchTerm])

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        Synchronizing audit logs...
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Audit Registry</h2>
          <p className="text-xs text-muted-foreground">Historical ledger of analyzed pipelines</p>
        </div>
        <button 
          onClick={fetchDocuments}
          className="rounded-md p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Refresh document list"
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      {error && (
        <p className="px-5 pt-3 text-xs text-destructive">{error}</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <th className="p-4">Document</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Compliance Score</th>
              <th className="p-4 w-10"></th>
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
                <tr
                  className={cn(
                    'transition-colors',
                    hasIssues ? 'cursor-pointer hover:bg-secondary/20' : 'hover:bg-secondary/20',
                  )}
                  onClick={() => hasIssues && setExpandedId(isExpanded ? null : doc._id)}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-md bg-secondary p-2 text-muted-foreground">
                        <FileText className="size-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-medium text-foreground truncate max-w-[200px] xl:max-w-[300px]">
                          {doc.fileName}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
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
                    {doc.status === 'completed' && (
                      <span className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border",
                        doc.complianceScore >= 80 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      )}>
                        {doc.complianceScore >= 80 ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
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
                      <span className={doc.complianceScore >= 80 ? "text-emerald-400" : "text-amber-400"}>
                        {doc.complianceScore}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {hasIssues && (
                      <ChevronDown
                        className={cn(
                          'size-4 text-muted-foreground transition-transform ml-auto',
                          isExpanded && 'rotate-180',
                        )}
                      />
                    )}
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
                              <span className="font-medium text-foreground">{issue.clause}: </span>
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
  )
}