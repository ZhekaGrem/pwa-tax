'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

type Props = {
  children: ReactNode
  rootMargin?: string
  minHeight?: number
  className?: string
  once?: boolean
}

/**
 * Mounts heavy children only when the wrapper enters (or nears) the viewport.
 * Reserves vertical space via `min-height` so nothing layout-shifts on mount.
 */
export function LazyVisible({
  children,
  rootMargin = '400px 0px',
  minHeight = 640,
  className,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    if (visible) return
    const node = ref.current
    if (!node) return

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true)
            if (once) io.disconnect()
            break
          }
        }
      },
      { rootMargin },
    )
    io.observe(node)
    return () => io.disconnect()
  }, [visible, rootMargin, once])

  return (
    <div
      ref={ref}
      className={className}
      style={visible ? undefined : { minHeight, contain: 'layout paint style' }}
    >
      {visible ? children : null}
    </div>
  )
}
