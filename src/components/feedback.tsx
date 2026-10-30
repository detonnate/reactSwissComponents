import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/* ---------- Badge / Tag ---------- */
export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  color?: 'default' | 'primary' | 'success' | 'warning' | 'info' | 'neutral'
  dot?: boolean
}

export function Badge({ color = 'default', dot, children, ...rest }: BadgeProps) {
  return <span data-component="badge" data-color={color} data-dot={dot || undefined} {...rest}>{dot ? null : children}</span>
}

/** Wraps an element with a notification badge (count or dot). */
export function BadgeAnchor({ children, count, ...badge }: BadgeProps & { count?: number }) {
  return (
    <span data-component="badge-anchor">
      {children}
      {(badge.dot || (count ?? 0) > 0) && <Badge color="primary" aria-label={`${count ?? 'new'} notifications`} {...badge}>{count && count > 99 ? '99+' : count}</Badge>}
    </span>
  )
}

export type TagProps = {
  children: React.ReactNode
  selected?: boolean
  onClick?: () => void
  onRemove?: () => void
}

export function Tag({ children, selected, onClick, onRemove }: TagProps) {
  const body = (
    <>
      {children}
      {onRemove && <button type="button" aria-label={`Remove ${typeof children === 'string' ? children : 'tag'}`} onClick={(e) => { e.stopPropagation(); onRemove() }}>✕</button>}
    </>
  )
  return onClick
    ? <button type="button" data-component="tag" data-selected={selected || undefined} aria-pressed={selected} onClick={onClick}>{body}</button>
    : <span data-component="tag" data-selected={selected || undefined}>{body}</span>
}

/* ---------- Alert ---------- */
export type AlertProps = {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  description?: React.ReactNode
  actions?: React.ReactNode
}

export function Alert({ variant = 'info', title, description, actions }: AlertProps) {
  const role = variant === 'warning' || variant === 'error' ? 'alert' : 'status'
  return (
    <div data-component="alert" data-variant={variant} role={role}>
      <div data-slot="content">
        {title && <strong>{title}</strong>}
        {description && <div>{description}</div>}
      </div>
      {actions}
    </div>
  )
}

/* ---------- Spinner / Progress / Steps / Skeleton ---------- */
export function Spinner({ size = 'md', label = 'Loading' }: { size?: 'sm' | 'md' | 'lg'; label?: string }) {
  return <span data-component="spinner" data-size={size} role="status" aria-label={label} />
}

export type ProgressProps = { value: number; max?: number; label?: string }

export function Progress({ value, max = 100, label = 'Progress' }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div data-component="progress" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
      <div style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Steps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol data-component="steps">
      {steps.map((s, i) => (
        <li key={s} data-done={i <= current || undefined} aria-current={i === current ? 'step' : undefined}>{i + 1}. {s}</li>
      ))}
    </ol>
  )
}

export type SkeletonProps = { width?: string | number; height?: string | number; circle?: boolean; lines?: number }

export function Skeleton({ width = '100%', height = '1rem', circle, lines = 1 }: SkeletonProps) {
  const one = (k?: number, w?: string | number) => (
    <span key={k} data-component="skeleton" aria-hidden style={{ width: w ?? width, height: circle ? width : height, borderRadius: circle ? '50%' : 0, marginBottom: lines > 1 ? 8 : 0 }} />
  )
  if (lines > 1) {
    return <div role="status" aria-label="Loading content">{Array.from({ length: lines }, (_, i) => one(i, i === lines - 1 ? '60%' : undefined))}</div>
  }
  return one()
}

/* ---------- Toast ---------- */
type ToastItem = { id: number; message: string; variant: 'info' | 'success' | 'error' }
type ToastCtx = { toast: (message: string, variant?: ToastItem['variant']) => void }
const ToastContext = createContext<ToastCtx | null>(null)

export function ToastProvider({ children, durationMs = 3500 }: { children: React.ReactNode; durationMs?: number }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), [])
  const toast = useCallback<ToastCtx['toast']>((message, variant = 'info') => {
    const id = Date.now() + Math.random()
    setItems((l) => [...l, { id, message, variant }])
    setTimeout(() => dismiss(id), durationMs)
  }, [dismiss, durationMs])
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {mounted && createPortal(
        <div data-component="toaster" role="status" aria-live="polite">
          {items.map((t) => (
            <div key={t.id} data-component="toast" data-variant={t.variant}>
              {t.message}
              <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)}>✕</button>
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
