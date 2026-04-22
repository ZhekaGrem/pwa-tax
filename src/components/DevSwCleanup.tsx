'use client'

import { useEffect } from 'react'

/**
 * Aggressively purge any service worker + cache-storage in dev.
 * Runs on every mount. If anything was found, hard-reloads with a
 * cache-busting query param so sub-resources are refetched.
 *
 * No-op in production — the PWA ships normally there.
 */
export function DevSwCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return
    if (typeof window === 'undefined') return

    const run = async () => {
      let flushed = false
      try {
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations()
          for (const reg of regs) {
            await reg.unregister()
            flushed = true
          }
        }
        if ('caches' in window) {
          const keys = await caches.keys()
          for (const k of keys) {
            await caches.delete(k)
            flushed = true
          }
        }
      } catch {
        // dev cleanup — ignore
      }

      if (flushed) {
        const url = new URL(window.location.href)
        url.searchParams.set('nocache', String(Date.now()))
        window.location.replace(url.toString())
      }
    }

    run()
  }, [])

  return null
}
