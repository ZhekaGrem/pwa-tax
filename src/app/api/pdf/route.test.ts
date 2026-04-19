import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/firebase/admin', () => ({
  adminAuth: () => ({
    verifyIdToken: vi.fn().mockImplementation(async (t: string) => {
      if (t === 'good') return { uid: 'alice' }
      throw new Error('bad token')
    }),
  }),
  adminDb: () => ({
    doc: (p: string) => ({
      get: async () => ({
        exists: p.endsWith('alice/properties/a1'),
        id: 'a1',
        data: () => ({
          ownerUid: 'alice',
          year: 2026,
          status: 'ready',
          property: {
            address: '123 Main St',
            county: 'Harris',
            parcelId: 'p12345',
            yearBuilt: 2000,
            sqft: 2000,
            bedrooms: 3,
            bathrooms: 2,
            lotSizeSqft: 6000,
          },
          assessment: { currentAssessedValue: 400000, marketValue: 420000, taxRate: 0.0231 },
          selectedComps: Array(3).fill({
            parcelId: 'c12345',
            address: '1 Test',
            zip: '77005',
            assessedValue: 300000,
            sqft: 2000,
            yearBuilt: 2000,
            bedrooms: 3,
            bathrooms: 2,
          }),
          calculation: {
            medianCompValue: 300000,
            proposedValue: 300000,
            taxSavingsUSD: 2310,
            percentReduction: 0.25,
          },
        }),
      }),
    }),
  }),
}))

import { POST } from './route'

const mkReq = (body: unknown, auth?: string) =>
  new Request('http://x/api/pdf', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(auth ? { authorization: auth } : {}) },
    body: JSON.stringify(body),
  })

describe('POST /api/pdf', () => {
  it('returns 401 without token', async () => {
    const res = await POST(mkReq({ appealId: 'a1' }))
    expect(res.status).toBe(401)
  })

  it('returns 401 with bad token', async () => {
    const res = await POST(mkReq({ appealId: 'a1' }, 'Bearer bad'))
    expect(res.status).toBe(401)
  })

  it('returns 200 + PDF for owner', async () => {
    const res = await POST(mkReq({ appealId: 'a1' }, 'Bearer good'))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('application/pdf')
    const buf = Buffer.from(await res.arrayBuffer())
    expect(buf.slice(0, 5).toString()).toBe('%PDF-')
  }, 15_000)
})
