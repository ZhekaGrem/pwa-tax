import { describe, it, expect, vi } from 'vitest'
import { loadCompsForZip } from './comps'

describe('loadCompsForZip', () => {
  it('returns parsed array on 200', async () => {
    const payload = [
      {
        parcelId: 'x',
        address: 'a',
        zip: '77005',
        assessedValue: 1,
        sqft: 1,
        yearBuilt: 2000,
        bedrooms: 1,
        bathrooms: 1,
      },
    ]
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(payload) }),
    )
    expect(await loadCompsForZip('77005')).toEqual(payload)
  })

  it('returns empty array on 404', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    expect(await loadCompsForZip('99999')).toEqual([])
  })
})
