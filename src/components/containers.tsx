import React, { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Heading } from './layout'
import { Button } from './forms'
import { useClickOutside, useControllable, useStableId } from './utils'

/* ---------- Modal ---------- */
export type ModalProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'

function useOverlayBehaviour(isOpen: boolean, close: () => void, panel: React.RefObject<HTMLElement>) {
  const closeRef = useRef(close)
  closeRef.current = close
  useEffect(() => {
    if (!isOpen) return
    const prevFocus = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return closeRef.current()
      if (e.key !== 'Tab' || !panel.current) return
      const els = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
      if (!els.length) return
      const first = els[0], last = els[els.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      prevFocus?.focus()
    }
  }, [isOpen, panel])
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const ref = useRef<HTMLDivElement>(null)
  const titleId = useStableId()
  useOverlayBehaviour(isOpen, onClose, ref)
  if (!isOpen || typeof document === 'undefined') return null
  return createPortal(
    <div data-component="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div data-component="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref}>
        <header>
          <Heading level={3} id={titleId}>{title}</Heading>
          <Button variant="ghost" size="sm" aria-label="Close" onClick={onClose}>✕</Button>
        </header>
        <div data-slot="body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </div>
    </div>,
    document.body,
  )
}

/* ---------- Drawer ---------- */
export type DrawerProps = {
  isOpen: boolean
  onClose: () => void
  title: string
  side?: 'left' | 'right'
  children: React.ReactNode
}

export function Drawer({ isOpen, onClose, title, side = 'right', children }: DrawerProps) {
  const ref = useRef<HTMLDivElement>(null)
  useOverlayBehaviour(isOpen, onClose, ref)
  if (!isOpen || typeof document === 'undefined') return null
  return createPortal(
    <div data-component="drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside data-component="drawer" data-side={side} role="dialog" aria-modal="true" aria-label={title} ref={ref}>
        <header>
          <Heading level={3}>{title}</Heading>
          <Button variant="ghost" size="sm" aria-label="Close" onClick={onClose}>✕</Button>
        </header>
        <div data-slot="body">{children}</div>
      </aside>
    </div>,
    document.body,
  )
}

/* ---------- Accordion ---------- */
export type AccordionProps = {
  items: Array<{ id: string; title: string; content: React.ReactNode }>
  multiple?: boolean
  defaultOpen?: string[]
}

export function Accordion({ items, multiple = false, defaultOpen = [] }: AccordionProps) {
  const [open, setOpen] = useState<string[]>(defaultOpen)
  const base = useStableId()
  const toggle = (id: string) =>
    setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : multiple ? [...o, id] : [id]))
  return (
    <div data-component="accordion">
      {items.map((it) => {
        const isOpen = open.includes(it.id)
        return (
          <div key={it.id} data-slot="item">
            <h3 style={{ margin: 0 }}>
              <button type="button" aria-expanded={isOpen} aria-controls={`${base}-${it.id}`} onClick={() => toggle(it.id)}>
                {it.title}<span aria-hidden>{isOpen ? '−' : '+'}</span>
              </button>
            </h3>
            {isOpen && <div role="region" id={`${base}-${it.id}`}>{it.content}</div>}
          </div>
        )
      })}
    </div>
  )
}

/* ---------- Carousel ---------- */
export type CarouselProps = {
  slides: React.ReactNode[]
  autoPlayMs?: number
  label?: string
}

export function Carousel({ slides, autoPlayMs, label = 'Carousel' }: CarouselProps) {
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  const go = useCallback((n: number) => setI((n + slides.length) % slides.length), [slides.length])
  useEffect(() => {
    if (!autoPlayMs || paused) return
    const t = setInterval(() => setI((x) => (x + 1) % slides.length), autoPlayMs)
    return () => clearInterval(t)
  }, [autoPlayMs, paused, slides.length])
  const touch = useRef<number | null>(null)
  return (
    <div
      data-component="carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touch.current === null) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1))
        touch.current = null
      }}
    >
      <div data-slot="track" style={{ transform: `translateX(-${i * 100}%)` }}>
        {slides.map((s, n) => (
          <div key={n} data-slot="slide" role="group" aria-roledescription="slide" aria-label={`${n + 1} of ${slides.length}`} aria-hidden={n !== i}>{s}</div>
        ))}
      </div>
      <button data-slot="nav" style={{ left: 8 }} aria-label="Previous slide" onClick={() => go(i - 1)}>‹</button>
      <button data-slot="nav" style={{ right: 8 }} aria-label="Next slide" onClick={() => go(i + 1)}>›</button>
      <div data-slot="dots">
        {slides.map((_, n) => <button key={n} data-slot="dot" aria-label={`Go to slide ${n + 1}`} aria-current={n === i} onClick={() => go(n)} />)}
      </div>
    </div>
  )
}

/* ---------- Tooltip ---------- */
export type TooltipProps = {
  content: string
  children: React.ReactElement
  delay?: number
}

export function Tooltip({ content, children, delay = 200 }: TooltipProps) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const id = useStableId()
  const show = (el: HTMLElement) => {
    timer.current = setTimeout(() => {
      const r = el.getBoundingClientRect()
      setPos({ x: r.left + r.width / 2 + window.scrollX, y: r.top - 6 + window.scrollY })
    }, delay)
  }
  const hide = () => { clearTimeout(timer.current); setPos(null) }
  return (
    <>
      {React.cloneElement(children, {
        'aria-describedby': pos ? id : undefined,
        onMouseEnter: (e: React.MouseEvent<HTMLElement>) => show(e.currentTarget),
        onFocus: (e: React.FocusEvent<HTMLElement>) => show(e.currentTarget),
        onMouseLeave: hide,
        onBlur: hide,
      })}
      {pos && typeof document !== 'undefined' &&
        createPortal(<div id={id} role="tooltip" data-component="tooltip" style={{ left: pos.x, top: pos.y }}>{content}</div>, document.body)}
    </>
  )
}

/* ---------- Dropdown (menu button) ---------- */
export type DropdownEntry =
  | { type?: 'item'; label: string; onSelect?: () => void; disabled?: boolean }
  | { type: 'separator' }
  | { type: 'label'; label: string }

export type DropdownProps = {
  label: React.ReactNode
  entries: DropdownEntry[]
  onOpenChange?: (open: boolean) => void
}

export function Dropdown({ label, entries, onOpenChange }: DropdownProps) {
  const [open, setOpen] = useControllable<boolean>(undefined, false, onOpenChange)
  const ref = useRef<HTMLDivElement>(null)
  const menuId = useStableId()
  useClickOutside(ref, () => setOpen(false), open)
  const onKey = (e: React.KeyboardEvent) => {
    const items = [...(ref.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? [])]
    const idx = items.indexOf(document.activeElement as HTMLElement)
    if (e.key === 'ArrowDown') { e.preventDefault(); items[(idx + 1) % items.length]?.focus() }
    else if (e.key === 'ArrowUp') { e.preventDefault(); items[(idx - 1 + items.length) % items.length]?.focus() }
    else if (e.key === 'Home') { e.preventDefault(); items[0]?.focus() }
    else if (e.key === 'End') { e.preventDefault(); items[items.length - 1]?.focus() }
    else if (e.key === 'Escape') { setOpen(false) }
  }
  return (
    <div data-component="popover" ref={ref} onKeyDown={onKey}>
      <Button variant="outline" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} rightIcon="▾" onClick={() => setOpen(!open)}>{label}</Button>
      {open && (
        <div id={menuId} role="menu" data-component="listbox">
          {entries.map((e, i) =>
            e.type === 'separator' ? <div key={i} role="separator" data-slot="separator" />
            : e.type === 'label' ? <div key={i} data-slot="label">{e.label}</div>
            : <button key={i} role="menuitem" disabled={e.disabled} onClick={() => { e.onSelect?.(); setOpen(false) }}>{e.label}</button>)}
        </div>
      )}
    </div>
  )
}
