import type { Comp } from '@/schemas/appeal'

export async function loadCompsForZip(zip: string): Promise<Comp[]> {
  const res = await fetch(`/data/comps/${zip}.json`, { next: { revalidate: 3600 } })
  if (!res.ok) return []
  return (await res.json()) as Comp[]
}
