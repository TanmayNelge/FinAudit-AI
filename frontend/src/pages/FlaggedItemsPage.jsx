import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api.js'
import { cn } from '@/lib/utils'
import { ErrorState, EmptyState } from '@/components/ui/state.jsx'
import { SortHeader } from '@/components/ui/sort-header.jsx'
import {
  Search,
  SearchX,
  Inbox,
  RefreshCw,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'

const PAGE_SIZE = 8

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'All severity' },
  { value: 'High', label: 'High' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Low', label: 'Low' },
]

const STATUS_RANK = { pending: 0, processing: 1, completed: 2, failed: 3 }

function formatDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function severityMeta(severity) {
  if (severity === 'High') {
    return { badge: 'border-destructive/20 bg-destructive/10 text-destructive', dot: 'bg-destructive' }
  }
  if (severity === 'Medium') {
    return { badge: 'border-amber-500/20 bg-amber-500/10 text-amber-400', dot: 'bg-amber-400' }
  }
  return { badge: 'border-sky-500/20 bg-sky-500/10 text-sky-400', dot: 'bg-sky-400' }
}

// Issues only ever exist on completed documents, so the status reflects the
// review state of the document that carried the finding.
function statusMeta(status) {
  if (status === 'failed') {
    return { label: 'Rejected', badge: 'border-destructive/20 bg-destructive/10 text-destructive' }
  }
  if (status === 'processing') {
    return { label: 'Auditing', badge: 'border-blue-500/20 bg-blue-500/10 text-blue-400' }
  }
  if (status === 'pending') {
    return { label: 'Pending', badge: 'border-border bg-secondary text-muted-foreground' }
  }
  return { label: 'Completed', badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' }
}

function SkeletonRows({ rows = PAGE_SIZE }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-border">
          <td className="p-4">
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          </td>
          <td className="p-4">
            <div className="h-4 w-36 animate-pulse rounded bg-muted" />
          </td>
          <td className="p-4">
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
          </td>
          <td className="p-4">
            <div className="h-4 w-16 animate-pulse rounded-full bg-muted" />
          </td>
          <td className="p-4">
            <div className="ml-auto h-4 w-24 animate-pulse rounded bg-muted" />
          </td>
        </tr>
      ))}
    </>
  )
}

export function FlaggedItemsPage() {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [sortKey, setSortKey] = useState('severity')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  const fetchFlagged = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/documents')
      setDocuments(response.data)
      setError('')
    } catch (err) {
      console.error('Failed to load flagged items:', err)
      setError('Unable to load flagged items right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let cancelled = false
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
        console.error('Failed to load flagged items:', err)
        setError('Unable to load flagged items right now.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // Flatten every document's flaggedIssues into a single aggregated list,
  // carrying a reference to the source document.
  const flagged = useMemo(() => {
    const items = []
    documents.forEach((doc) => {
      if (!doc.flaggedIssues?.length) return
      doc.flaggedIssues.forEach((issue, index) => {
        items.push({
          key: `${doc._id}-${index}`,
          docId: doc._id,
          fileName: doc.fileName,
          docStatus: doc.status,
          createdAt: doc.createdAt,
          clause: issue.clause || 'Untitled issue',
          reason: issue.reason || '',
          severity: issue.severity || 'Low',
        })
      })
    })
    return items
  }, [documents])

  const filtered = useMemo(() => {
    let result = flagged
    if (severityFilter !== 'all') {
      result = result.filter((item) => item.severity === severityFilter)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (item) =>
          item.clause.toLowerCase().includes(q) ||
          item.reason.toLowerCase().includes(q) ||
          item.fileName?.toLowerCase().includes(q),
      )
    }
    return result
  }, [flagged, severityFilter, query])

  const sorted = useMemo(() => {
    const severityRank = { High: 3, Medium: 2, Low: 1 }
    const arr = [...filtered]
    arr.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'clause') cmp = a.clause.localeCompare(b.clause)
      else if (sortKey === 'fileName') cmp = (a.fileName || '').localeCompare(b.fileName || '')
      else if (sortKey === 'severity') cmp = (severityRank[a.severity] || 0) - (severityRank[b.severity] || 0)
      else if (sortKey === 'docStatus') cmp = STATUS_RANK[a.docStatus] - STATUS_RANK[b.docStatus]
      else if (sortKey === 'createdAt') cmp = (a.createdAt || '').localeCompare(b.createdAt || '')
      return sortDir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [filtered, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)

  const pageItems = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const start = sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const end = Math.min(safePage * PAGE_SIZE, sorted.length)

  const hasFilters = query.trim() !== '' || severityFilter !== 'all'

  const clearFilters = () => {
    setQuery('')
    setSeverityFilter('all')
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Flagged Items</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every compliance risk detected across your documents, aggregated by severity.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search by clause, reason or document…"
              aria-label="Search flagged items"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="severity-filter">
              Filter by severity
            </label>
            <select
              id="severity-filter"
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              {SEVERITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchFlagged}
              aria-label="Refresh flagged items"
              className="flex size-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <ErrorState
            icon={SearchX}
            title="Unable to load flagged items."
            message={error}
            onRetry={fetchFlagged}
          />
        )}

        {/* Loading */}
        {!error && loading && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Issue</th>
                  <th className="p-4">Document</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">
                    <SortHeader label="Date" sortKey="createdAt" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <SkeletonRows />
              </tbody>
            </table>
          </div>
        )}

        {/* Empty (no issues at all) */}
        {!error && !loading && flagged.length === 0 && (
          <EmptyState
            icon={Inbox}
            title="No flagged items"
            description="No compliance risks have been detected yet. Upload a document to begin auditing."
          />
        )}

        {/* Table */}
        {!error && !loading && flagged.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 text-left">
                    <SortHeader label="Issue" sortKey="clause" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="p-4 text-left">
                    <SortHeader label="Document" sortKey="fileName" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="p-4 text-left">
                    <SortHeader label="Severity" sortKey="severity" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="p-4 text-left">
                    <SortHeader label="Status" sortKey="docStatus" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th className="p-4 text-right">
                    <SortHeader label="Date" sortKey="createdAt" activeKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                          <SearchX className="size-6" aria-hidden="true" />
                        </div>
                        <p className="text-sm font-medium text-foreground">No flagged items match your filters</p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your search or severity filter.
                        </p>
                        {hasFilters && (
                          <button
                            type="button"
                            onClick={clearFilters}
                            className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageItems.map((item) => {
                    const meta = severityMeta(item.severity)
                    const status = statusMeta(item.docStatus)
                    return (
                      <tr key={item.key} className="group transition-colors hover:bg-secondary/20">
                        <td className="p-4">
                          <Link
                            to={`/documents/${item.docId}`}
                            className="block max-w-64 font-medium text-foreground transition-colors hover:text-primary"
                            title={item.reason}
                          >
                            {item.clause}
                          </Link>
                          {item.reason && (
                            <p className="mt-0.5 line-clamp-1 max-w-md text-xs text-muted-foreground" title={item.reason}>
                              {item.reason}
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <Link
                            to={`/documents/${item.docId}`}
                            className="inline-flex max-w-52 items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-primary"
                            title={item.fileName}
                          >
                            <FileText className="size-3.5 shrink-0" aria-hidden="true" />
                            <span className="truncate">{item.fileName}</span>
                          </Link>
                        </td>
                        <td className="p-4">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
                              meta.badge,
                            )}
                          >
                            <span className={cn('size-1.5 rounded-full', meta.dot)} aria-hidden="true" />
                            {item.severity}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium', status.badge)}>
                            {item.docStatus === 'processing' && (
                              <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                            )}
                            {status.label}
                          </span>
                        </td>
                        <td className="p-4 text-right text-xs text-muted-foreground">
                          {formatDate(item.createdAt)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!error && !loading && flagged.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{start}–{end}</span> of{' '}
              <span className="font-medium text-foreground">{sorted.length}</span> flagged items
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                aria-label="Previous page"
                className="flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <span className="px-2 font-mono text-xs text-muted-foreground">
                {safePage} / {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={safePage >= pageCount}
                aria-label="Next page"
                className="flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}