'use client'

/**
 * Dev-only fixed banner with a "Hard reload" button that nukes the
 * service worker + cache-storage and reloads the page with a
 * cache-busting query string. Acts as a manual escape hatch for
 * cases where HMR or an old SW has pinned a stale client bundle.
 */
export function DevBanner() {
  if (process.env.NODE_ENV === 'production') return null

  const nuke = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations()
        for (const reg of regs) await reg.unregister()
      }
      if ('caches' in window) {
        const keys = await caches.keys()
        for (const k of keys) await caches.delete(k)
      }
    } catch {
      // ignore
    }
    const url = new URL(window.location.href)
    url.searchParams.set('nocache', String(Date.now()))
    window.location.replace(url.toString())
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
    >
      <button
        type="button"
        onClick={nuke}
        className="rounded-full border border-ink bg-paper/90 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-ink shadow-lg backdrop-blur-md hover:bg-ink hover:text-paper transition-colors"
      >
        Hard reload · flush cache
      </button>
    </div>
  )
}
