import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api.js'
import { cn } from '@/lib/utils'
import {
  FileText,
  Search,
  SearchX,
  Inbox,
  RefreshCw,
  Eye,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Plus,
} from 'lucide-react'

const PAGE_SIZE = 8

const STATUS_RANK = { pending: 0, processing: 1, completed: 2, failed: 3 }

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
]

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

function StatusBadge({ doc }) {
  if (doc.status === 'processing') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
        <Loader2 className="size-3 animate-spin" aria-hidden="true" />
        Auditing
      </span>
    )
  }
  if (doc.status === 'completed') {
    const ok = doc.complianceScore >= 80
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
          ok
            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
            : 'border-amber-500/20 bg-amber-500/10 text-amber-400',
        )}
      >
        {ok ? (
          <CheckCircle2 className="size-3" aria-hidden="true" />
        ) : (
          <AlertTriangle className="size-3" aria-hidden="true" />
        )}
        {ok ? 'Verified' : 'Needs review'}
      </span>
    )
  }
  if (doc.status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
        Rejected
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      Pending
    </span>
  )
}

function Score({ doc }) {
  if (doc.status !== 'completed' || doc.complianceScore == null) {
    return <span className="font-mono text-xs text-muted-foreground">--</span>
  }
  const ok = doc.complianceScore >= 80
  return (
    <span className={cn('font-mono text-sm font-semibold', ok ? 'text-emerald-400' : 'text-amber-400')}>
      {doc.complianceScore}%
    </span>
  )
}

function SortHeader({ label, sortKey, activeKey, sortDir, onSort }) {
  const isActive = activeKey === sortKey
  const Icon = isActive ? (sortDir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown
  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        'inline-flex items-center gap-1 transition-colors',
        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
      <Icon className={cn('size-3.5', !isActive && 'opacity-60')} aria-hidden="true" />
    </button>
  )
}

function SkeletonRows({ rows = PAGE_SIZE }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-b border-border">
          <td className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-9 animate-pulse rounded-md bg-muted" />
              <div className="flex flex-col gap-1.5">
                <div className="h-3 w-40 animate-pulse rounded bg-muted" />
                <div className="h-2.5 w-24 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </td>
          <td className="p-4">
            <div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
          </td>
          <td className="p-4">
            <div className="ml-auto h-4 w-12 animate-pulse rounded bg-muted" />
          </td>
          <td className="p-4">
            <div className="h-4 w-8 animate-pulse rounded bg-muted" />
          </td>
          <td className="p-4">
            <div className="ml-auto h-4 w-24 animate-pulse rounded bg-muted" />
          </td>
          <td className="p-4">
            <div className="ml-auto size-7 animate-pulse rounded bg-muted" />
          </td>
        </tr>
      ))}
    </>
  )
}

export function DocumentsPage({ refreshSignal = 0 }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortKey, setSortKey] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await api.get('/api/documents')
      setDocuments(response.data)
      setError('')
    } catch (err) {
      console.error('Failed to load documents:', err)
      setError('Unable to load documents right now.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch on mount and whenever a new upload finishes elsewhere in the app.
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
        console.error('Failed to load documents:', err)
        setError('Unable to load documents right now.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [refreshSignal])

  const handleSort = (key) => {
    if (key === sortKey) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const filtered = useMemo(() => {
    let result = documents
    if (statusFilter !== 'all') {
      result = result.filter((doc) => doc.status === statusFilter)
    }
    const q = query.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (doc) =>
          doc.fileName?.toLowerCase().includes(q) ||
          doc.flaggedIssues?.some(
            (issue) =>
              issue.clause?.toLowerCase().includes(q) ||
              issue.reason?.toLowerCase().includes(q),
          ),
      )
    }
    return result
  }, [documents, statusFilter, query])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      let cmp = 0
      if (sortKey === 'name') {
        cmp = (a.fileName || '').localeCompare(b.fileName || '')
      } else if (sortKey === 'createdAt') {
        cmp = (a.createdAt || '').localeCompare(b.createdAt || '')
      } else if (sortKey === 'status') {
        cmp = STATUS_RANK[a.status] - STATUS_RANK[b.status]
      } else if (sortKey === 'score') {
        cmp = (a.complianceScore ?? -1) - (b.complianceScore ?? -1)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
    return arr
  }, [filtered, sortKey, sortDir])

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)

  const pageDocs = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const start = sorted.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const end = Math.min(safePage * PAGE_SIZE, sorted.length)

  const clearFilters = () => {
    setQuery('')
    setStatusFilter('all')
  }

  const hasFilters = query.trim() !== '' || statusFilter !== 'all'

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Documents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review every uploaded document, its compliance score and flagged risks.
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
        >
          <Plus className="size-4" aria-hidden="true" />
          Upload document
        </Link>
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
              placeholder="Search by file name or issue…"
              aria-label="Search documents"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="sr-only" htmlFor="status-filter">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(1)
              }}
              className="h-9 rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={fetchDocuments}
              aria-label="Refresh document list"
              className="flex size-9 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Body */}
        {error && (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <SearchX className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Unable to load documents.</p>
              <p className="mt-1 text-xs text-muted-foreground">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchDocuments}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Try again
            </button>
          </div>
        )}

        {!error && loading && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="p-4">Document</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Score</th>
                  <th className="p-4">Issues</th>
                  <th className="p-4 text-right">Uploaded</th>
                  <th className="p-4 w-10" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <SkeletonRows />
              </tbody>
            </table>
          </div>
        )}

        {!error && !loading && documents.length === 0 && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Inbox className="size-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">No documents yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Upload your first document to begin your compliance audit.
              </p>
            </div>
            <Link
              to="/upload"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80"
            >
              <Plus className="size-4" aria-hidden="true" />
              Upload document
            </Link>
          </div>
        )}

        {!error && !loading && documents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="p-4 text-left">
                    <SortHeader
                      label="Document"
                      sortKey="name"
                      activeKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="p-4 text-left">
                    <SortHeader
                      label="Status"
                      sortKey="status"
                      activeKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="p-4 text-right">
                    <SortHeader
                      label="Score"
                      sortKey="score"
                      activeKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="p-4">Issues</th>
                  <th className="p-4 text-right">
                    <SortHeader
                      label="Uploaded"
                      sortKey="createdAt"
                      activeKey={sortKey}
                      sortDir={sortDir}
                      onSort={handleSort}
                    />
                  </th>
                  <th className="w-10 p-4" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                          <SearchX className="size-6" aria-hidden="true" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          No documents match your filters
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Try adjusting your search or status filter.
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
                  pageDocs.map((doc) => {
                    const issueCount = doc.flaggedIssues?.length || 0
                    return (
                      <tr
                        key={doc._id}
                        className="group transition-colors hover:bg-secondary/20"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
                              <FileText className="size-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <Link
                                to={`/documents/${doc._id}`}
                                className="block max-w-60 truncate font-medium text-foreground transition-colors hover:text-primary xl:max-w-80"
                                title={doc.fileName}
                              >
                                {doc.fileName}
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <StatusBadge doc={doc} />
                        </td>
                        <td className="p-4 text-right">
                          <Score doc={doc} />
                        </td>
                        <td className="p-4">
                          {doc.status === 'completed' ? (
                            <span className={cn('font-mono text-xs', issueCount > 0 ? 'text-amber-400' : 'text-muted-foreground')}>
                              {issueCount} {issueCount === 1 ? 'issue' : 'issues'}
                            </span>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="p-4 text-right text-xs text-muted-foreground">
                          {formatDate(doc.createdAt)}
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            to={`/documents/${doc._id}`}
                            aria-label={`View analysis for ${doc.fileName}`}
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                          >
                            <Eye className="size-4" aria-hidden="true" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer / pagination */}
        {!error && !loading && documents.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-foreground">{start}–{end}</span> of{' '}
              <span className="font-medium text-foreground">{sorted.length}</span> documents
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