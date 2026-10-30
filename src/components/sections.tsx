import React, { useRef, useState } from 'react'
import { Button } from './forms'
import { Heading, Text } from './layout'

/* ---------- Hero ---------- */
export type HeroProps = {
  eyebrow?: string
  title: string
  subtitle: string
  primary: { label: string; href?: string; onClick?: () => void }
  secondary?: { label: string; href?: string; onClick?: () => void }
  visual?: React.ReactNode
}

export function Hero({ eyebrow, title, subtitle, primary, secondary, visual }: HeroProps) {
  return (
    <section data-component="hero">
      <div>
        {eyebrow && <Text size="sm" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--swiss-color-primary)' }}>{eyebrow}</Text>}
        <h1>{title}</h1>
        <Text size="lg" muted style={{ maxWidth: '34rem', marginBottom: 'var(--swiss-spacing-6)' }}>{subtitle}</Text>
        <div style={{ display: 'flex', gap: 'var(--swiss-spacing-3)', flexWrap: 'wrap' }}>
          <Button size="lg" {...(primary.href ? { as: 'a', href: primary.href } : {})} onClick={primary.onClick}>{primary.label}</Button>
          {secondary && <Button size="lg" variant="outline" {...(secondary.href ? { as: 'a', href: secondary.href } : {})} onClick={secondary.onClick}>{secondary.label}</Button>}
        </div>
      </div>
      {visual ?? <div data-slot="visual" aria-hidden />}
    </section>
  )
}

/* ---------- Form container ---------- */
export type FormContainerProps = {
  title: string
  description?: string
  submitLabel?: string
  onSubmit?: (data: FormData) => void
  children: React.ReactNode
}

export function FormContainer({ title, description, submitLabel = 'Submit', onSubmit, children }: FormContainerProps) {
  return (
    <form data-component="form-container" onSubmit={(e) => { e.preventDefault(); onSubmit?.(new FormData(e.currentTarget)) }}>
      <div>
        <Heading level={3}>{title}</Heading>
        {description && <Text muted size="sm">{description}</Text>}
      </div>
      {children}
      <div><Button type="submit">{submitLabel}</Button></div>
    </form>
  )
}

/* ---------- Feed / Timeline ---------- */
export type FeedItem = { id: string; author: string; time: string; title?: string; body: string }

export const initials = (name: string) => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

export function Avatar({ name }: { name: string }) {
  return <span data-component="avatar" aria-label={name} role="img">{initials(name)}</span>
}

export function Feed({ items }: { items: FeedItem[] }) {
  return (
    <ol data-component="feed">
      {items.map((it) => (
        <li key={it.id}>
          <div style={{ display: 'flex', gap: 'var(--swiss-spacing-3)' }}>
            <Avatar name={it.author} />
            <div>
              <Text weight="bold" size="sm">{it.author} <time dateTime={it.time}>· {new Date(it.time).toLocaleDateString()}</time></Text>
              {it.title && <Text weight="medium">{it.title}</Text>}
              <Text muted>{it.body}</Text>
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}

/* ---------- Testimonial / Logos ---------- */
export type TestimonialProps = { quote: string; author: string; role: string }

export function Testimonial({ quote, author, role }: TestimonialProps) {
  return (
    <figure data-component="testimonial" style={{ margin: 0 }}>
      <blockquote>“{quote}”</blockquote>
      <figcaption style={{ display: 'flex', gap: 'var(--swiss-spacing-3)', alignItems: 'center' }}>
        <Avatar name={author} />
        <div><Text weight="bold" size="sm">{author}</Text><Text size="xs" muted>{role}</Text></div>
      </figcaption>
    </figure>
  )
}

export function LogoStrip({ names }: { names: string[] }) {
  return <div data-component="logo-strip" aria-label="Trusted by">{names.map((n) => <span key={n}>{n}</span>)}</div>
}

/* ---------- Video player ---------- */
export type VideoPlayerProps = { src?: string; poster?: string; title?: string }

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export function VideoPlayer({ src, poster, title = 'Video' }: VideoPlayerProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [dur, setDur] = useState(0)
  const [muted, setMuted] = useState(false)
  const toggle = () => { const v = ref.current; if (!v) return; if (v.paused) void v.play(); else v.pause() }
  return (
    <div data-component="video-player">
      {src
        ? <video ref={ref} src={src} poster={poster} aria-label={title} onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onTimeUpdate={(e) => setT(e.currentTarget.currentTime)} onLoadedMetadata={(e) => setDur(e.currentTarget.duration)} />
        : <div data-slot="poster">{title} (no source provided)</div>}
      <div data-slot="controls">
        <button type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={toggle} disabled={!src}>{playing ? '❚❚' : '▶'}</button>
        <input type="range" aria-label="Seek" min={0} max={dur || 1} step={0.1} value={t} disabled={!src} onChange={(e) => { if (ref.current) ref.current.currentTime = Number(e.target.value) }} />
        <span style={{ fontSize: 12 }}>{clock(t)} / {clock(dur)}</span>
        <button type="button" aria-label={muted ? 'Unmute' : 'Mute'} disabled={!src} onClick={() => { setMuted(!muted); if (ref.current) ref.current.muted = !muted }}>{muted ? '🔇' : '🔊'}</button>
        <button type="button" aria-label="Fullscreen" disabled={!src} onClick={() => void ref.current?.parentElement?.requestFullscreen?.()}>⛶</button>
      </div>
    </div>
  )
}
