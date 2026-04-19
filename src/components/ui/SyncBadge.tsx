'use client'
import { useSyncExternalStore } from 'react'

export type SyncState = 'synced' | 'pending' | 'offline'

export function SyncBadgeView({ state }: { state: SyncState }) {
  const meta = {
    synced: { text: 'Saved', cls: 'bg-green-100 text-green-800' },
    pending: { text: 'Syncing…', cls: 'bg-yellow-100 text-yellow-800' },
    offline: { text: 'Saved locally (offline)', cls: 'bg-slate-200 text-slate-700' },
  }[state]
  return (
    <span
      aria-live="polite"
      className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs ${meta.cls}`}
    >
      ☁ {meta.text}
    </span>
  )
}

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}
const getOnlineSnapshot = () => navigator.onLine
const getOnlineServerSnapshot = () => true

export function SyncBadge({ pendingWrites }: { pendingWrites: boolean }) {
  const online = useSyncExternalStore(subscribeOnline, getOnlineSnapshot, getOnlineServerSnapshot)
  const state: SyncState = pendingWrites ? 'pending' : online ? 'synced' : 'offline'
  return <SyncBadgeView state={state} />
}
