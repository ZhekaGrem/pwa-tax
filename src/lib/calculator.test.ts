import { describe, it, expect } from 'vitest'
import { computeSavings, median } from './calculator'
import { ValidationError } from './errors'

const sampleProperty = { sqft: 2000 }
const compAt = (assessedValue: number, sqft: number) => ({ assessedValue, sqft })
const TAX_RATE = 0.0231

describe('median', () => {
  it('returns middle element for odd count', () => {
    expect(median([1, 5, 3])).toBe(3)
  })
  it('returns average of two middle elements for even count', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5)
  })
  it('throws on empty array', () => {
    expect(() => median([])).toThrow(ValidationError)
  })
})

describe('computeSavings', () => {
  it('computes median-based proposed value from $/sqft comps', () => {
    const comps = [compAt(300000, 2000), compAt(340000, 2000), compAt(320000, 2000)]
    const r = computeSavings({
      property: sampleProperty,
      currentAssessedValue: 400000,
      comps,
      taxRate: TAX_RATE,
    })
    expect(r.proposedValue).toBe(320000)
  })

  it('savings = (current - proposed) * taxRate', () => {
    const comps = [compAt(300000, 2000), compAt(300000, 2000), compAt(300000, 2000)]
    const r = computeSavings({
      property: sampleProperty,
      currentAssessedValue: 400000,
      comps,
      taxRate: TAX_RATE,
    })
    expect(r.taxSavingsUSD).toBeCloseTo((400000 - 300000) * TAX_RATE)
  })

  it('clamps savings to 0 when proposed >= current', () => {
    const comps = [compAt(500000, 2000), compAt(600000, 2000), compAt(550000, 2000)]
    const r = computeSavings({
      property: sampleProperty,
      currentAssessedValue: 400000,
      comps,
      taxRate: TAX_RATE,
    })
    expect(r.proposedValue).toBe(400000)
    expect(r.taxSavingsUSD).toBe(0)
  })

  it('percentReduction is 0 when no savings', () => {
    const comps = [compAt(600000, 2000), compAt(700000, 2000), compAt(650000, 2000)]
    const r = computeSavings({
      property: sampleProperty,
      currentAssessedValue: 400000,
      comps,
      taxRate: TAX_RATE,
    })
    expect(r.percentReduction).toBe(0)
  })

  it('percentReduction correctly computed', () => {
    const comps = [compAt(300000, 2000), compAt(300000, 2000), compAt(300000, 2000)]
    const r = computeSavings({
      property: sampleProperty,
      currentAssessedValue: 400000,
      comps,
      taxRate: TAX_RATE,
    })
    expect(r.percentReduction).toBeCloseTo(0.25)
  })

  it('throws on empty comps', () => {
    expect(() =>
      computeSavings({
        property: sampleProperty,
        currentAssessedValue: 400000,
        comps: [],
        taxRate: TAX_RATE,
      }),
    ).toThrow(ValidationError)
  })

  it('throws on comp with zero sqft (divide-by-zero)', () => {
    const comps = [compAt(300000, 0), compAt(340000, 2000), compAt(320000, 2000)]
    expect(() =>
      computeSavings({
        property: sampleProperty,
        currentAssessedValue: 400000,
        comps,
        taxRate: TAX_RATE,
      }),
    ).toThrow(ValidationError)
  })

  it('throws on negative currentAssessedValue', () => {
    const comps = [compAt(300000, 2000), compAt(340000, 2000), compAt(320000, 2000)]
    expect(() =>
      computeSavings({
        property: sampleProperty,
        currentAssessedValue: -1,
        comps,
        taxRate: TAX_RATE,
      }),
    ).toThrow(ValidationError)
  })

  it('throws on zero subject sqft', () => {
    const comps = [compAt(300000, 2000), compAt(340000, 2000), compAt(320000, 2000)]
    expect(() =>
      computeSavings({
        property: { sqft: 0 },
        currentAssessedValue: 400000,
        comps,
        taxRate: TAX_RATE,
      }),
    ).toThrow(ValidationError)
  })

  it('throws on taxRate out of range', () => {
    const comps = [compAt(300000, 2000), compAt(340000, 2000), compAt(320000, 2000)]
    expect(() =>
      computeSavings({ property: sampleProperty, currentAssessedValue: 400000, comps, taxRate: 0 }),
    ).toThrow(ValidationError)
  })

  it('handles 4 comps with even-count median', () => {
    const comps = [
      compAt(280000, 2000),
      compAt(300000, 2000),
      compAt(320000, 2000),
      compAt(340000, 2000),
    ]
    const r = computeSavings({
      property: sampleProperty,
      currentAssessedValue: 400000,
      comps,
      taxRate: TAX_RATE,
    })
    expect(r.proposedValue).toBe(310000) // median of 140,150,160,170 = 155; 155*2000 = 310000
  })

  it('HCAD snapshot: realistic Houston values', () => {
    const comps = [compAt(342000, 1850), compAt(358000, 1900), compAt(351000, 1875)]
    const r = computeSavings({
      property: { sqft: 1900 },
      currentAssessedValue: 425000,
      comps,
      taxRate: 0.0231,
    })
    expect(r.proposedValue).toBeGreaterThan(340000)
    expect(r.proposedValue).toBeLessThan(365000)
    expect(r.taxSavingsUSD).toBeGreaterThan(1000)
  })
})
