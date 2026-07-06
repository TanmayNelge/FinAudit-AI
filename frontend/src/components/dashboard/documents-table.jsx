import { useEffect, useState } from 'react'
import axios from 'axios'
import { FileText, CheckCircle2, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DocumentsTable() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/documents')
      setDocuments(response.data)
    } catch (error) {
      console.error('Failed to sync document history:', error)
    } finally {
      setLoading(false)
    }
  }

  // Poll the database every 5 seconds to catch live pipeline updates
  useEffect(() => {
    fetchDocuments()
    const interval = setInterval(fetchDocuments, 5000)
    return () => clearInterval(interval)
  }, [])

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
        >
          <RefreshCw className="size-4" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <th className="p-4">Document</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Compliance Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {documents.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-xs text-muted-foreground">
                  No execution records detected in this channel.
                </td>
              </tr>
            ) : (
              documents.map((doc) => (
                <tr key={doc._id} className="hover:bg-secondary/20 transition-colors">
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}