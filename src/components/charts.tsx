import React, { useMemo, useState } from 'react'

export const CHART_COLORS = [1, 2, 3, 4, 5, 6].map((n) => `var(--swiss-chart-${n})`)

export type Series = { name: string; data: number[]; color?: string }

const W = 640
const H = 320
const M = { t: 16, r: 16, b: 32, l: 44 }
const iw = W - M.l - M.r
const ih = H - M.t - M.b

const colorOf = (s: { color?: string }, i: number) => s.color ?? CHART_COLORS[i % CHART_COLORS.length]

function niceMax(v: number) {
  if (v <= 0) return 1
  const p = 10 ** Math.floor(Math.log10(v))
  const n = v / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p
}

const fmt = (n: number) => (Math.abs(n) >= 1000 ? `${+(n / 1000).toFixed(1)}k` : String(+n.toFixed(2)))

type Tip = { x: number; y: number; text: string } | null

function useTip() {
  const [tip, setTip] = useState<Tip>(null)
  const bind = (text: string) => ({
    onMouseMove: (e: React.MouseEvent) => setTip({ x: e.clientX, y: e.clientY, text }),
    onMouseLeave: () => setTip(null),
  })
  const node = tip && <div data-component="chart-tooltip" style={{ left: tip.x, top: tip.y }}>{tip.text}</div>
  return { bind, node }
}

function Legend({ items }: { items: Array<{ name: string; color: string }> }) {
  return (
    <div data-component="chart-legend">
      {items.map((i) => <span key={i.name} style={{ ['--c' as string]: i.color }}>{i.name}</span>)}
    </div>
  )
}

function Axes({ max, labels, ticks = 5 }: { max: number; labels: string[]; ticks?: number }) {
  const step = labels.length > 12 ? Math.ceil(labels.length / 12) : 1
  return (
    <g>
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const y = M.t + ih - (ih * i) / ticks
        return (
          <g key={i}>
            <line data-slot="grid" x1={M.l} x2={W - M.r} y1={y} y2={y} />
            <text x={M.l - 8} y={y + 4} textAnchor="end">{fmt((max * i) / ticks)}</text>
          </g>
        )
      })}
      <line data-slot="axis" x1={M.l} x2={W - M.r} y1={M.t + ih} y2={M.t + ih} />
      {labels.map((l, i) => i % step === 0 && (
        <text key={i} x={xBand(i, labels.length)} y={H - 10} textAnchor="middle">{l}</text>
      ))}
    </g>
  )
}

const xBand = (i: number, n: number) => M.l + (iw / n) * (i + 0.5)
const xPoint = (i: number, n: number) => (n === 1 ? M.l + iw / 2 : M.l + (iw * i) / (n - 1))
const yVal = (v: number, max: number) => M.t + ih - (v / max) * ih

/* ---------- Line / Area ---------- */
export type LineChartProps = { series: Series[]; labels: string[]; area?: boolean; title?: string }

export function LineChart({ series, labels, area, title = 'Line chart' }: LineChartProps) {
  const max = niceMax(Math.max(...series.flatMap((s) => s.data), 0))
  const { bind, node } = useTip()
  const n = labels.length
  return (
    <figure data-component="chart" style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        <Axes max={max} labels={labels} />
        {series.map((s, si) => {
          const c = colorOf(s, si)
          const pts = s.data.map((v, i) => [xPoint(i, n), yVal(v, max)] as const)
          const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ')
          return (
            <g key={s.name}>
              {area && <path d={`${d} L${pts[pts.length - 1][0]},${M.t + ih} L${pts[0][0]},${M.t + ih} Z`} fill={c} opacity={0.15} />}
              <path d={d} fill="none" stroke={c} strokeWidth={2.5} strokeLinejoin="round" />
              {pts.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill="#fff" stroke={c} strokeWidth={2} {...bind(`${s.name} · ${labels[i]}: ${s.data[i]}`)} />)}
            </g>
          )
        })}
      </svg>
      <Legend items={series.map((s, i) => ({ name: s.name, color: colorOf(s, i) }))} />
      {node}
    </figure>
  )
}

/* ---------- Bar (grouped / stacked / horizontal-free) ---------- */
export type BarChartProps = { series: Series[]; labels: string[]; stacked?: boolean; title?: string }

export function BarChart({ series, labels, stacked, title = 'Bar chart' }: BarChartProps) {
  const n = labels.length
  const totals = labels.map((_, i) => series.reduce((a, s) => a + s.data[i], 0))
  const max = niceMax(stacked ? Math.max(...totals, 0) : Math.max(...series.flatMap((s) => s.data), 0))
  const { bind, node } = useTip()
  const band = iw / n
  const gw = band * 0.7
  const bw = stacked ? gw : gw / series.length
  return (
    <figure data-component="chart" style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        <Axes max={max} labels={labels} />
        {labels.map((l, i) => {
          let acc = 0
          return series.map((s, si) => {
            const v = s.data[i]
            const h = (v / max) * ih
            const x = M.l + band * i + (band - gw) / 2 + (stacked ? 0 : bw * si)
            const y = stacked ? M.t + ih - ((acc += v) / max) * ih : M.t + ih - h
            return <rect key={`${i}-${s.name}`} x={x} y={y} width={bw - (stacked ? 0 : 2)} height={h} fill={colorOf(s, si)} {...bind(`${s.name} · ${l}: ${v}`)} />
          })
        })}
      </svg>
      <Legend items={series.map((s, i) => ({ name: s.name, color: colorOf(s, i) }))} />
      {node}
    </figure>
  )
}

/* ---------- Pie / Donut ---------- */
export type Slice = { name: string; value: number; color?: string }
export type PieChartProps = { data: Slice[]; donut?: boolean; title?: string; centerLabel?: string }

export function PieChart({ data, donut, title = 'Pie chart', centerLabel }: PieChartProps) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1
  const { bind, node } = useTip()
  const R = 120, r = donut ? 70 : 0, cx = 150, cy = 150
  let angle = -Math.PI / 2
  const paths = data.map((d, i) => {
    const a0 = angle
    const a1 = (angle += (d.value / total) * Math.PI * 2)
    const large = a1 - a0 > Math.PI ? 1 : 0
    const p = (rad: number, a: number) => `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`
    const full = d.value / total > 0.9999
    const end = full ? a1 - 0.0001 : a1
    const dstr = r
      ? `M${p(R, a0)} A${R},${R} 0 ${large} 1 ${p(R, end)} L${p(r, end)} A${r},${r} 0 ${large} 0 ${p(r, a0)} Z`
      : `M${cx},${cy} L${p(R, a0)} A${R},${R} 0 ${large} 1 ${p(R, end)} Z`
    return <path key={d.name} d={dstr} fill={colorOf(d, i)} stroke="#fff" strokeWidth={2} {...bind(`${d.name}: ${d.value} (${((d.value / total) * 100).toFixed(1)}%)`)} />
  })
  return (
    <figure data-component="chart" style={{ margin: 0, maxWidth: 360 }}>
      <svg viewBox="0 0 300 300" role="img" aria-label={title}>
        {paths}
        {donut && <text x={cx} y={cy + 5} textAnchor="middle" style={{ fontSize: 18, fontWeight: 700, fill: 'var(--swiss-color-text)' }}>{centerLabel ?? fmt(total)}</text>}
      </svg>
      <Legend items={data.map((d, i) => ({ name: d.name, color: colorOf(d, i) }))} />
      {node}
    </figure>
  )
}

/* ---------- Scatter ---------- */
export type ScatterSeries = { name: string; points: Array<{ x: number; y: number }>; color?: string }
export type ScatterChartProps = { series: ScatterSeries[]; title?: string }

export function ScatterChart({ series, title = 'Scatter plot' }: ScatterChartProps) {
  const all = series.flatMap((s) => s.points)
  const xmax = niceMax(Math.max(...all.map((p) => p.x), 0))
  const ymax = niceMax(Math.max(...all.map((p) => p.y), 0))
  const { bind, node } = useTip()
  const ticks = 5
  return (
    <figure data-component="chart" style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title}>
        <Axes max={ymax} labels={[]} />
        {Array.from({ length: ticks + 1 }, (_, i) => (
          <text key={i} x={M.l + (iw * i) / ticks} y={H - 10} textAnchor="middle">{fmt((xmax * i) / ticks)}</text>
        ))}
        {series.map((s, si) => s.points.map((p, i) => (
          <circle key={`${s.name}${i}`} cx={M.l + (p.x / xmax) * iw} cy={yVal(p.y, ymax)} r={5} fill={colorOf(s, si)} opacity={0.75} {...bind(`${s.name}: (${p.x}, ${p.y})`)} />
        )))}
      </svg>
      <Legend items={series.map((s, i) => ({ name: s.name, color: colorOf(s, i) }))} />
      {node}
    </figure>
  )
}

/* ---------- Sparkline ---------- */
export function Sparkline({ data, color = CHART_COLORS[0], width = 120, height = 32 }: { data: number[]; color?: string; width?: number; height?: number }) {
  const path = useMemo(() => {
    const min = Math.min(...data), max = Math.max(...data)
    const span = max - min || 1
    return data.map((v, i) => `${i ? 'L' : 'M'}${(i / Math.max(data.length - 1, 1)) * width},${height - 2 - ((v - min) / span) * (height - 4)}`).join(' ')
  }, [data, width, height])
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trend" style={{ display: 'block' }}>
      <path d={path} fill="none" stroke={color} strokeWidth={2} />
    </svg>
  )
}

/* ---------- Gauge ---------- */
export function Gauge({ value, max = 100, label }: { value: number; max?: number; label?: string }) {
  const pct = Math.min(1, Math.max(0, value / max))
  const R = 80
  const x = (a: number) => 100 + R * Math.cos(Math.PI - a)
  const y = (a: number) => 100 - R * Math.sin(Math.PI - a)
  const a = Math.PI * pct
  return (
    <figure data-component="chart" style={{ margin: 0, maxWidth: 240 }}>
      <svg viewBox="0 0 200 120" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label ?? 'Gauge'}>
        <path d={`M${x(0)},${y(0)} A${R},${R} 0 0 1 ${x(Math.PI)},${y(Math.PI)}`} fill="none" stroke="#e5e5e5" strokeWidth={16} />
        {pct > 0 && <path d={`M${x(0)},${y(0)} A${R},${R} 0 0 1 ${x(a)},${y(a)}`} fill="none" stroke="var(--swiss-chart-1)" strokeWidth={16} />}
        <text x={100} y={98} textAnchor="middle" style={{ fontSize: 24, fontWeight: 700, fill: 'var(--swiss-color-text)' }}>{value}</text>
      </svg>
      {label && <figcaption style={{ textAlign: 'center', fontSize: 'var(--swiss-font-size-sm)' }}>{label}</figcaption>}
    </figure>
  )
}
