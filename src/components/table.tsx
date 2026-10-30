import React, { useMemo, useState } from 'react'
import { Checkbox, Input } from './forms'
import { Pagination } from './navigation'

export type Column<T> = {
  key: keyof T & string
  header: string
  sortable?: boolean
  align?: 'left' | 'right'
  render?: (row: T) => React.ReactNode
}

export type DataTableProps<T> = {
  columns: Column<T>[]
  rows: T[]
  rowKey: (row: T) => string | number
  pageSize?: number
  searchable?: boolean
  selectable?: boolean
  striped?: boolean
  caption?: string
}

export function DataTable<T>({ columns, rows, rowKey, pageSize = 8, searchable, selectable, striped = true, caption }: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(null)
  const [page, setPage] = useState(1)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string | number>>(new Set())

  const processed = useMemo(() => {
    const q = query.trim().toLowerCase()
    let out = q ? rows.filter((r) => columns.some((c) => String(r[c.key]).toLowerCase().includes(q))) : rows
    if (sort) {
      const f = sort.dir === 'asc' ? 1 : -1
      out = [...out].sort((a, b) => {
        const x = a[sort.key as keyof T], y = b[sort.key as keyof T]
        return (typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))) * f
      })
    }
    return out
  }, [rows, columns, query, sort])

  const pageCount = Math.max(1, Math.ceil(processed.length / pageSize))
  const current = Math.min(page, pageCount)
  const visible = processed.slice((current - 1) * pageSize, current * pageSize)
  const allOnPage = visible.length > 0 && visible.every((r) => selected.has(rowKey(r)))
  const someOnPage = visible.some((r) => selected.has(rowKey(r)))

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: 'asc' } : s.dir === 'asc' ? { key, dir: 'desc' } : null))

  const toggleAll = () => setSelected((s) => {
    const n = new Set(s)
    visible.forEach((r) => (allOnPage ? n.delete(rowKey(r)) : n.add(rowKey(r))))
    return n
  })

  return (
    <div>
      {searchable && (
        <div data-component="table-toolbar">
          <div style={{ width: '16rem' }}><Input size="sm" placeholder="Filter rows…" aria-label="Filter rows" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1) }} /></div>
          {selectable && <span>{selected.size} selected</span>}
        </div>
      )}
      <div data-component="table-wrap">
        <table data-component="table" data-striped={striped || undefined}>
          {caption && <caption style={{ textAlign: 'left', padding: 8, fontWeight: 700 }}>{caption}</caption>}
          <thead>
            <tr>
              {selectable && <th style={{ width: 32 }}><Checkbox aria-label="Select all" checked={allOnPage} indeterminate={!allOnPage && someOnPage} onChange={toggleAll} /></th>}
              {columns.map((c) => (
                <th key={c.key} data-align={c.align} aria-sort={sort?.key === c.key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined}>
                  {c.sortable ? <button type="button" onClick={() => toggleSort(c.key)}>{c.header}<span aria-hidden>{sort?.key === c.key ? (sort.dir === 'asc' ? '▲' : '▼') : '↕'}</span></button> : c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && <tr><td colSpan={columns.length + (selectable ? 1 : 0)} style={{ textAlign: 'center', color: 'var(--swiss-color-muted)' }}>No data</td></tr>}
            {visible.map((r) => {
              const k = rowKey(r)
              return (
                <tr key={k} aria-selected={selectable ? selected.has(k) : undefined}>
                  {selectable && <td><Checkbox aria-label="Select row" checked={selected.has(k)} onChange={() => setSelected((s) => { const n = new Set(s); n.has(k) ? n.delete(k) : n.add(k); return n })} /></td>}
                  {columns.map((c) => <td key={c.key} data-align={c.align}>{c.render ? c.render(r) : String(r[c.key])}</td>)}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div data-component="table-footer">
        <span>{processed.length} rows</span>
        {pageCount > 1 && <Pagination page={current} pageCount={pageCount} onChange={setPage} />}
      </div>
    </div>
  )
}
