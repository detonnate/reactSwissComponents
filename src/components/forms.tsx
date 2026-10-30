import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { Size } from './utils'
import { parseISO, toISO, useClickOutside, useControllable, useStableId } from './utils'

/* ---------- Button ---------- */
export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  as?: React.ElementType
  href?: string
  variant?: 'solid' | 'outline' | 'ghost' | 'dark'
  size?: Size
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Button({ as: As = 'button', variant = 'solid', size = 'md', loading, leftIcon, rightIcon, disabled, children, ...rest }: ButtonProps) {
  const off = disabled || loading
  const extra = As === 'button' ? { disabled: off, type: rest.type ?? 'button' } : { 'aria-disabled': off || undefined }
  return (
    <As data-component="button" data-variant={variant} data-size={size} data-loading={loading || undefined} {...extra} {...rest}>
      {loading ? <span data-component="spinner" data-size="sm" role="status" aria-label="Loading" /> : leftIcon}
      {children}
      {rightIcon}
    </As>
  )
}

/* ---------- Field wrapper ---------- */
export type FieldProps = {
  label?: string
  hint?: string
  error?: string
  htmlFor?: string
  children: React.ReactNode
}

export function Field({ label, hint, error, htmlFor, children }: FieldProps) {
  return (
    <div data-component="field">
      {label && <label htmlFor={htmlFor}>{label}</label>}
      {children}
      {error ? <span data-slot="error" role="alert">{error}</span> : hint ? <span data-slot="hint">{hint}</span> : null}
    </div>
  )
}

/* ---------- Input / Textarea / Select ---------- */
export type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  size?: Size
  invalid?: boolean
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
  describedBy?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { size = 'md', invalid, leftAddon, rightAddon, describedBy, ...rest },
  ref,
) {
  return (
    <div data-component="input-wrapper" data-invalid={invalid || undefined}>
      {leftAddon && <span data-slot="addon">{leftAddon}</span>}
      <input ref={ref} data-component="input" data-size={size} aria-invalid={invalid || undefined} aria-describedby={describedBy} {...rest} />
      {rightAddon && <span data-slot="addon">{rightAddon}</span>}
    </div>
  )
})

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean
  autoResize?: boolean
  describedBy?: string
}

export function Textarea({ invalid, autoResize, describedBy, onInput, ...rest }: TextareaProps) {
  return (
    <div data-component="input-wrapper" data-invalid={invalid || undefined}>
      <textarea
        data-component="textarea"
        aria-invalid={invalid || undefined}
        aria-describedby={describedBy}
        onInput={(e) => {
          if (autoResize) {
            const t = e.currentTarget
            t.style.height = 'auto'
            t.style.height = `${t.scrollHeight}px`
          }
          onInput?.(e)
        }}
        {...rest}
      />
    </div>
  )
}

export type SelectProps = Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> & {
  size?: Size
  invalid?: boolean
  placeholder?: string
  options: Array<{ value: string; label: string }>
}

export function Select({ size = 'md', invalid, placeholder, options, defaultValue, ...rest }: SelectProps) {
  return (
    <div data-component="input-wrapper" data-invalid={invalid || undefined}>
      <select data-component="select" data-size={size} aria-invalid={invalid || undefined} defaultValue={rest.value === undefined ? defaultValue ?? '' : undefined} {...rest}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

/* ---------- Checkbox / Radio / Switch ---------- */
export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: React.ReactNode
  indeterminate?: boolean
}

export function Checkbox({ label, indeterminate, ...rest }: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate
  }, [indeterminate])
  return (
    <label data-component="checkbox">
      <input ref={ref} type="checkbox" {...rest} />
      {label && <span>{label}</span>}
    </label>
  )
}

type RadioCtx = { name: string; value?: string; onChange: (v: string) => void }
const RadioContext = createContext<RadioCtx | null>(null)

export type RadioGroupProps = {
  name?: string
  value?: string
  defaultValue?: string
  onChange?: (v: string) => void
  orientation?: 'vertical' | 'horizontal'
  legend?: string
  children: React.ReactNode
}

export function RadioGroup({ name, value, defaultValue, onChange, orientation = 'vertical', legend, children }: RadioGroupProps) {
  const id = useStableId(name)
  const [val, setVal] = useControllable<string | undefined>(value, defaultValue, onChange as (v: string | undefined) => void)
  return (
    <RadioContext.Provider value={{ name: id, value: val, onChange: setVal }}>
      <fieldset data-component="radio-group" role="radiogroup" data-orientation={orientation}>
        {legend && <legend style={{ fontWeight: 500, fontSize: 'var(--swiss-font-size-sm)', marginBottom: 'var(--swiss-spacing-2)' }}>{legend}</legend>}
        {children}
      </fieldset>
    </RadioContext.Provider>
  )
}

export type RadioProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'value'> & { value: string; label?: React.ReactNode }

export function Radio({ value, label, ...rest }: RadioProps) {
  const ctx = useContext(RadioContext)
  return (
    <label data-component="radio">
      <input type="radio" value={value} name={ctx?.name} checked={ctx ? ctx.value === value : undefined} onChange={() => ctx?.onChange(value)} {...rest} />
      {label && <span>{label}</span>}
    </label>
  )
}

export type SwitchProps = {
  checked?: boolean
  defaultChecked?: boolean
  onChange?: (v: boolean) => void
  label?: React.ReactNode
  disabled?: boolean
}

export function Switch({ checked, defaultChecked = false, onChange, label, disabled }: SwitchProps) {
  const [on, setOn] = useControllable(checked, defaultChecked, onChange)
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} data-component="switch" onClick={() => setOn(!on)}>
      <span data-slot="track"><span data-slot="thumb" /></span>
      {label && <span>{label}</span>}
    </button>
  )
}

/* ---------- Search bar ---------- */
export type SearchBarProps = {
  value?: string
  onSearch?: (q: string) => void
  placeholder?: string
  size?: Size
}

export function SearchBar({ value, onSearch, placeholder = 'Search…', size = 'md' }: SearchBarProps) {
  const [q, setQ] = useControllable(value, '')
  return (
    <form role="search" onSubmit={(e) => { e.preventDefault(); onSearch?.(q) }} style={{ display: 'flex', gap: 'var(--swiss-spacing-2)' }}>
      <div style={{ flex: 1 }}>
        <Input type="search" size={size} value={q} onChange={(e) => { setQ(e.target.value); onSearch?.(e.target.value) }} placeholder={placeholder} aria-label="Search" />
      </div>
      <Button type="submit" size={size} aria-label="Submit search">Search</Button>
    </form>
  )
}

/* ---------- Listbox based: Dropdown select + ComboBox ---------- */
export type Option = { value: string; label: string }

export type ComboBoxProps = {
  options: Option[]
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  /** false renders a button-style dropdown select instead of an editable combo. */
  searchable?: boolean
  size?: Size
}

export function ComboBox({ options, value, onChange, placeholder = 'Select…', searchable = true, size = 'md' }: ComboBoxProps) {
  const [val, setVal] = useControllable<string | undefined>(value, undefined, onChange as (v: string | undefined) => void)
  const selected = options.find((o) => o.value === val)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const listId = useStableId()
  useClickOutside(ref, () => setOpen(false), open)

  const filtered = useMemo(
    () => (searchable && query ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())) : options),
    [options, query, searchable],
  )

  const choose = (o: Option) => {
    setVal(o.value)
    setQuery('')
    setOpen(false)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter' && open && filtered[active]) { e.preventDefault(); choose(filtered[active]) }
    else if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div data-component="popover" ref={ref} style={{ display: 'block' }}>
      <div data-component="input-wrapper">
        <input
          data-component="input"
          data-size={size}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete={searchable ? 'list' : 'none'}
          readOnly={!searchable}
          placeholder={placeholder}
          value={open && searchable ? query : selected?.label ?? ''}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setActive(0); setOpen(true) }}
          onKeyDown={onKey}
        />
        <span data-slot="addon" aria-hidden>▾</span>
      </div>
      {open && (
        <ul id={listId} role="listbox" data-component="listbox">
          {filtered.length === 0 && <li style={{ padding: 'var(--swiss-spacing-2) var(--swiss-spacing-3)', color: 'var(--swiss-color-muted)' }}>No results</li>}
          {filtered.map((o, i) => (
            <li key={o.value} role="option" aria-selected={o.value === val} data-active={i === active || undefined} onMouseEnter={() => setActive(i)} onMouseDown={(e) => { e.preventDefault(); choose(o) }}>
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ---------- Slider / Stepper ---------- */
export type SliderProps = {
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  onChange?: (v: number) => void
  label?: string
  format?: (v: number) => string
}

export function Slider({ min = 0, max = 100, step = 1, value, defaultValue = 50, onChange, label, format }: SliderProps) {
  const [v, setV] = useControllable(value, defaultValue, onChange)
  return (
    <div data-component="slider">
      <input type="range" min={min} max={max} step={step} value={v} aria-label={label ?? 'Slider'} onChange={(e) => setV(Number(e.target.value))} />
      <output>{format ? format(v) : v}</output>
    </div>
  )
}

export type StepperProps = {
  value?: number
  defaultValue?: number
  min?: number
  max?: number
  step?: number
  onChange?: (v: number) => void
}

export function Stepper({ value, defaultValue = 0, min = -Infinity, max = Infinity, step = 1, onChange }: StepperProps) {
  const [v, setV] = useControllable(value, defaultValue, onChange)
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  return (
    <div data-component="stepper" role="group" aria-label="Quantity">
      <button type="button" aria-label="Decrease" disabled={v <= min} onClick={() => setV(clamp(v - step))}>−</button>
      <input type="number" value={v} onChange={(e) => setV(clamp(Number(e.target.value) || 0))} aria-label="Value" />
      <button type="button" aria-label="Increase" disabled={v >= max} onClick={() => setV(clamp(v + step))}>+</button>
    </div>
  )
}

/* ---------- Date picker ---------- */
const DOW = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export type DatePickerProps = {
  /** ISO date `YYYY-MM-DD`. In range mode, `value` is the start and `endValue` the end. */
  value?: string
  endValue?: string
  onChange?: (start: string, end?: string) => void
  range?: boolean
  min?: string
  max?: string
  placeholder?: string
}

export function DatePicker({ value, endValue, onChange, range, min, max, placeholder = 'Select date' }: DatePickerProps) {
  const [start, setStart] = useControllable<string | undefined>(value, undefined)
  const [end, setEnd] = useControllable<string | undefined>(endValue, undefined)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => { const b = start ? parseISO(start) : new Date(); return new Date(b.getFullYear(), b.getMonth(), 1) })
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false), open)

  const days = useMemo(() => {
    const first = new Date(view.getFullYear(), view.getMonth(), 1)
    const offset = (first.getDay() + 6) % 7
    return Array.from({ length: 42 }, (_, i) => new Date(view.getFullYear(), view.getMonth(), 1 - offset + i))
  }, [view])

  const pick = (d: Date) => {
    const iso = toISO(d)
    if (!range) { setStart(iso); onChange?.(iso); setOpen(false); return }
    if (!start || end) { setStart(iso); setEnd(undefined); onChange?.(iso) }
    else {
      const [s, e] = iso < start ? [iso, start] : [start, iso]
      setStart(s); setEnd(e); onChange?.(s, e); setOpen(false)
    }
  }

  const todayISO = toISO(new Date())
  const shift = (n: number) => setView(new Date(view.getFullYear(), view.getMonth() + n, 1))
  const text = start ? (range && end ? `${start} → ${end}` : start) : ''

  return (
    <div data-component="popover" ref={ref} style={{ display: 'block' }}>
      <Input readOnly value={text} placeholder={range ? 'Select date range' : placeholder} onClick={() => setOpen(true)} onFocus={() => setOpen(true)} rightAddon="📅" aria-haspopup="dialog" />
      {open && (
        <div data-component="datepicker-panel" role="dialog" aria-label="Choose date">
          <header>
            <Button size="sm" variant="ghost" aria-label="Previous month" onClick={() => shift(-1)}>‹</Button>
            <span aria-live="polite">{MONTHS[view.getMonth()]} {view.getFullYear()}</span>
            <Button size="sm" variant="ghost" aria-label="Next month" onClick={() => shift(1)}>›</Button>
          </header>
          <div data-slot="grid">
            {DOW.map((d) => <span key={d} data-slot="dow">{d}</span>)}
            {days.map((d) => {
              const iso = toISO(d)
              const selected = iso === start || iso === end
              const inRange = !!(range && start && end && iso > start && iso < end)
              return (
                <button
                  key={iso}
                  type="button"
                  data-slot="day"
                  data-outside={d.getMonth() !== view.getMonth() || undefined}
                  data-today={iso === todayISO || undefined}
                  data-selected={selected || undefined}
                  data-in-range={inRange || undefined}
                  disabled={(!!min && iso < min) || (!!max && iso > max)}
                  aria-pressed={selected}
                  onClick={() => pick(d)}
                >
                  {d.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- File uploader ---------- */
export type FileUploaderProps = {
  accept?: string
  multiple?: boolean
  onFiles?: (files: File[]) => void
  label?: string
  /** Pre-populate the list (useful for mocks). */
  initialFiles?: Array<{ name: string; size: number }>
}

export function FileUploader({ accept, multiple = true, onFiles, label = 'Drag and drop files here, or click to browse', initialFiles = [] }: FileUploaderProps) {
  const [files, setFiles] = useState<Array<{ name: string; size: number }>>(initialFiles)
  const [drag, setDrag] = useState(false)
  const input = useRef<HTMLInputElement>(null)

  const add = (list: FileList | null) => {
    if (!list) return
    const arr = Array.from(list)
    setFiles((f) => [...f, ...arr.map((x) => ({ name: x.name, size: x.size }))])
    onFiles?.(arr)
  }

  return (
    <div>
      <div
        data-component="file-uploader"
        data-dragging={drag || undefined}
        role="button"
        tabIndex={0}
        onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); add(e.dataTransfer.files) }}
      >
        {label}
        <input ref={input} type="file" hidden accept={accept} multiple={multiple} onChange={(e) => add(e.target.files)} />
      </div>
      {files.length > 0 && (
        <ul data-component="file-list">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`}>
              <span>{f.name} <small>({(f.size / 1024).toFixed(1)} KB)</small></span>
              <Button size="sm" variant="ghost" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}>✕</Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
