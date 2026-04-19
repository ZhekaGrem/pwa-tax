'use client'
import { ReactNode, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => {
    if (!loading && !user) router.replace('/sign-in')
  }, [user, loading, router])
  if (loading || !user) return <div className="p-6">Loading…</div>
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white p-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Protest Pilot</h1>
        <span className="text-sm text-slate-500">{user.email}</span>
      </header>
      <main className="mx-auto max-w-4xl p-6">{children}</main>
    </div>
  )
}
