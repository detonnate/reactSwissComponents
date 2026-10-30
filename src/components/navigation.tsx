import React, { useMemo, useRef, useState } from 'react'
import { Button } from './forms'
import { cx, useClickOutside, useControllable, useStableId } from './utils'

export type NavLink = { label: string; href: string; current?: boolean }
export type MegaGroup = { title: string; links: NavLink[] }

/* ---------- Navbar (with hamburger on small screens) ---------- */
export type NavbarProps = {
  brand: string
  links: NavLink[]
  actions?: React.ReactNode
  /** Optional megamenu rendered under the first link when hovered/clicked. */
  mega?: { label: string; groups: MegaGroup[] }
}

export function Navbar({ brand, links, actions, mega }: NavbarProps) {
  const [open, setOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const ref = useRef<HTMLElement>(null)
  useClickOutside(ref as React.RefObject<HTMLElement>, () => setMegaOpen(false), megaOpen)
  return (
    <header data-component="navbar" data-open={open || undefined} ref={ref}>
      <div data-slot="brand"><span aria-hidden />{brand}</div>
      <nav data-slot="links" aria-label="Primary">
        {mega && (
          <button type="button" aria-expanded={megaOpen} onClick={() => setMegaOpen(!megaOpen)} style={{ all: 'unset', cursor: 'pointer' }}>
            {mega.label} ▾
          </button>
        )}
        {links.map((l) => <a key={l.href + l.label} href={l.href} aria-current={l.current ? 'page' : undefined}>{l.label}</a>)}
      </nav>
      <div data-slot="actions">{actions}</div>
      <Button data-slot="burger" variant="ghost" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>☰</Button>
      {mega && megaOpen && (
        <div data-component="megamenu">
          {mega.groups.map((g) => (
            <div key={g.title}>
              <h4>{g.title}</h4>
              <ul>{g.links.map((l) => <li key={l.label}><a href={l.href}>{l.label}</a></li>)}</ul>
            </div>
          ))}
        </div>
      )}
    </header>
  )
}

/* ---------- Breadcrumbs ---------- */
export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav data-component="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((it, i) => (
          <li key={it.label}>
            {it.href && i < items.length - 1 ? <a href={it.href}>{it.label}</a> : <span aria-current={i === items.length - 1 ? 'page' : undefined}>{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

/* ---------- Sidebar ---------- */
export type SidebarProps = {
  sections: Array<{ title?: string; links: NavLink[] }>
  footer?: React.ReactNode
}

export function Sidebar({ sections, footer }: SidebarProps) {
  return (
    <aside data-component="sidebar">
      {sections.map((s, i) => (
        <nav key={i} aria-label={s.title}>
          {s.title && <h5>{s.title}</h5>}
          <ul>{s.links.map((l) => <li key={l.label}><a href={l.href} aria-current={l.current ? 'page' : undefined}>{l.label}</a></li>)}</ul>
        </nav>
      ))}
      {footer}
    </aside>
  )
}

/* ---------- Pagination ---------- */
export type PaginationProps = {
  page: number
  pageCount: number
  onChange: (p: number) => void
  siblings?: number
}

export function Pagination({ page, pageCount, onChange, siblings = 1 }: PaginationProps) {
  const pages = useMemo(() => {
    const set = new Set([1, pageCount, page])
    for (let i = 1; i <= siblings; i++) { set.add(page - i); set.add(page + i) }
    const sorted = [...set].filter((p) => p >= 1 && p <= pageCount).sort((a, b) => a - b)
    const out: Array<number | 'gap'> = []
    sorted.forEach((p, i) => {
      if (i && p - sorted[i - 1] > 1) out.push('gap')
      out.push(p)
    })
    return out
  }, [page, pageCount, siblings])

  return (
    <nav data-component="pagination" aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>‹ Prev</button>
      {pages.map((p, i) => p === 'gap'
        ? <span key={`g${i}`} aria-hidden>…</span>
        : <button key={p} type="button" aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>{p}</button>)}
      <button type="button" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>Next ›</button>
    </nav>
  )
}

/* ---------- Tabs ---------- */
export type TabItem = { id: string; label: string; content: React.ReactNode }

export type TabsProps = {
  items: TabItem[]
  value?: string
  defaultValue?: string
  onChange?: (id: string) => void
  orientation?: 'horizontal' | 'vertical'
}

export function Tabs({ items, value, defaultValue, onChange, orientation = 'horizontal' }: TabsProps) {
  const [current, setCurrent] = useControllable(value, defaultValue ?? items[0]?.id, onChange)
  const base = useStableId()
  const onKey = (e: React.KeyboardEvent) => {
    const idx = items.findIndex((i) => i.id === current)
    const next = (d: number) => setCurrent(items[(idx + d + items.length) % items.length].id)
    const fwd = orientation === 'horizontal' ? 'ArrowRight' : 'ArrowDown'
    const back = orientation === 'horizontal' ? 'ArrowLeft' : 'ArrowUp'
    if (e.key === fwd) { e.preventDefault(); next(1) } else if (e.key === back) { e.preventDefault(); next(-1) }
  }
  const active = items.find((i) => i.id === current)
  return (
    <div data-component="tabs" data-orientation={orientation}>
      <div role="tablist" aria-orientation={orientation} onKeyDown={onKey}>
        {items.map((i) => (
          <button key={i.id} role="tab" id={`${base}-t-${i.id}`} aria-selected={i.id === current} aria-controls={`${base}-p-${i.id}`} tabIndex={i.id === current ? 0 : -1} onClick={() => setCurrent(i.id)}>
            {i.label}
          </button>
        ))}
      </div>
      {active && <div role="tabpanel" id={`${base}-p-${active.id}`} aria-labelledby={`${base}-t-${active.id}`}>{active.content}</div>}
    </div>
  )
}

/* ---------- Footer sitemap ---------- */
export type FooterProps = {
  columns: Array<{ title: string; links: NavLink[] }>
  legal: React.ReactNode
}

export function Footer({ columns, legal }: FooterProps) {
  return (
    <footer data-component="footer">
      <div data-slot="cols">
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <h5>{c.title}</h5>
            <ul>{c.links.map((l) => <li key={l.label}><a href={l.href}>{l.label}</a></li>)}</ul>
          </nav>
        ))}
      </div>
      <div data-slot="legal" className={cx()}>{legal}</div>
    </footer>
  )
}
