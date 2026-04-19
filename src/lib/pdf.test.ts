import { describe, it, expect } from 'vitest'
import { fillForm50132 } from './pdf'
import type { Appeal } from '@/schemas/appeal'

const appeal: Appeal = {
  id: 'a1',
  ownerUid: 'u1',
  year: 2026,
  status: 'ready',
  property: {
    address: '123 Oak',
    county: 'Harris',
    parcelId: 'P1',
    yearBuilt: 2000,
    sqft: 2000,
    bedrooms: 3,
    bathrooms: 2,
    lotSizeSqft: 6000,
  },
  assessment: {
    currentAssessedValue: 400000,
    marketValue: 420000,
    taxRate: 0.0231,
  },
  selectedComps: [
    {
      parcelId: 'c1',
      address: '1',
      zip: '77005',
      assessedValue: 300000,
      sqft: 2000,
      yearBuilt: 2000,
      bedrooms: 3,
      bathrooms: 2,
    },
    {
      parcelId: 'c2',
      address: '2',
      zip: '77005',
      assessedValue: 320000,
      sqft: 2000,
      yearBuilt: 2000,
      bedrooms: 3,
      bathrooms: 2,
    },
    {
      parcelId: 'c3',
      address: '3',
      zip: '77005',
      assessedValue: 310000,
      sqft: 2000,
      yearBuilt: 2000,
      bedrooms: 3,
      bathrooms: 2,
    },
  ],
  calculation: {
    medianCompValue: 310000,
    proposedValue: 310000,
    taxSavingsUSD: 2079,
    percentReduction: 0.225,
  },
}

describe('fillForm50132', () => {
  it('returns a PDF byte stream starting with %PDF-', async () => {
    const bytes = await fillForm50132(appeal, 'John Smith')
    const header = Buffer.from(bytes.slice(0, 5)).toString()
    expect(header).toBe('%PDF-')
  }, 15_000)

  it('output is larger than 10KB (template plus overlay)', async () => {
    const bytes = await fillForm50132(appeal, 'John Smith')
    expect(bytes.byteLength).toBeGreaterThan(10_000)
  }, 15_000)
})
