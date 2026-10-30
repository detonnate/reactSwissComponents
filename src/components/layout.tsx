import React from 'react'
import { cx } from './utils'

type AsProp = { as?: React.ElementType }

export type BoxProps = React.HTMLAttributes<HTMLElement> & AsProp

export const Box = React.forwardRef<HTMLElement, BoxProps>(function Box({ as: As = 'div', ...rest }, ref) {
  return <As ref={ref} data-component="box" {...rest} />
})

export type TextProps = React.HTMLAttributes<HTMLElement> &
  AsProp & {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    weight?: 'regular' | 'medium' | 'bold'
    align?: 'left' | 'center' | 'right'
    truncate?: boolean
    muted?: boolean
  }

export function Text({ as: As = 'p', size = 'md', weight = 'regular', align, truncate, muted, ...rest }: TextProps) {
  return (
    <As
      data-component="text"
      data-size={size}
      data-weight={weight}
      data-align={align}
      data-truncate={truncate || undefined}
      data-muted={muted || undefined}
      {...rest}
    />
  )
}

export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  AsProp & {
    level?: 1 | 2 | 3 | 4 | 5 | 6
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
    weight?: 'regular' | 'medium' | 'bold'
    align?: 'left' | 'center' | 'right'
  }

export function Heading({ level = 2, as, size, weight = 'bold', align, ...rest }: HeadingProps) {
  const As = as ?? (`h${level}` as React.ElementType)
  const defaults = { 1: '3xl', 2: '2xl', 3: 'xl', 4: 'lg', 5: 'md', 6: 'sm' } as const
  return <As data-component="heading" data-size={size ?? defaults[level]} data-weight={weight} data-align={align} {...rest} />
}

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Container({ size = 'lg', ...rest }: ContainerProps) {
  return <div data-component="container" data-size={size} {...rest} />
}

type Gap = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12

export type StackProps = React.HTMLAttributes<HTMLDivElement> & {
  gap?: Gap
  direction?: 'column' | 'row'
  align?: React.CSSProperties['alignItems']
  justify?: React.CSSProperties['justifyContent']
  wrap?: boolean
}

export function Stack({ gap = 4, direction = 'column', align, justify, wrap, style, ...rest }: StackProps) {
  return (
    <div
      data-component="stack"
      style={{
        flexDirection: direction,
        gap: `var(--swiss-spacing-${gap})`,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? 'wrap' : undefined,
        ...style,
      }}
      {...rest}
    />
  )
}

export type GridProps = React.HTMLAttributes<HTMLDivElement> & {
  cols?: number
  gap?: Gap
  align?: React.CSSProperties['alignItems']
}

export function Grid({ cols = 12, gap = 4, align, style, ...rest }: GridProps) {
  return (
    <div
      data-component="grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: `var(--swiss-spacing-${gap})`,
        alignItems: align,
        ...style,
      }}
      {...rest}
    />
  )
}

export type GridItemProps = React.HTMLAttributes<HTMLDivElement> & { colSpan?: number; rowSpan?: number }

export function GridItem({ colSpan, rowSpan, style, className, ...rest }: GridItemProps) {
  return (
    <div
      data-component="grid-item"
      className={cx(className)}
      style={{
        gridColumn: colSpan ? `span ${colSpan} / span ${colSpan}` : undefined,
        gridRow: rowSpan ? `span ${rowSpan} / span ${rowSpan}` : undefined,
        minWidth: 0,
        ...style,
      }}
      {...rest}
    />
  )
}

export type CardProps = React.HTMLAttributes<HTMLDivElement> & {
  title?: React.ReactNode
  actions?: React.ReactNode
}

export function Card({ title, actions, children, ...rest }: CardProps) {
  return (
    <section data-component="card" {...rest}>
      {(title || actions) && (
        <header data-slot="header">
          <Heading level={4}>{title}</Heading>
          {actions}
        </header>
      )}
      <div data-slot="body">{children}</div>
    </section>
  )
}
