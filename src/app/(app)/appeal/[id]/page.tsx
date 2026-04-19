'use client'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default function AppealView() {
  const { id } = useParams<{ id: string }>()
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Appeal {id}</h1>
      <p className="text-slate-600">
        Full read-only view coming in v1.1. For now, edit via wizard.
      </p>
      <Link href="/appeal/new" className={buttonVariants()}>
        Open wizard
      </Link>
    </div>
  )
}
