import { describe, it, expect } from 'vitest'
import { PropertySchema, AssessmentSchema, CompSchema, AppealSchema } from './appeal'

const validProperty = {
  address: '123 Oak St, Houston, TX',
  county: 'Harris' as const,
  parcelId: '0660740000013',
  yearBuilt: 1998,
  sqft: 1850,
  bedrooms: 3,
  bathrooms: 2,
  lotSizeSqft: 6500,
}
const validAssessment = { currentAssessedValue: 400000, marketValue: 420000, taxRate: 0.0231 }
const validComp = {
  parcelId: '0660740000014',
  address: '125 Oak St',
  zip: '77005',
  assessedValue: 340000,
  sqft: 1800,
  yearBuilt: 1997,
  bedrooms: 3,
  bathrooms: 2,
}

describe('PropertySchema', () => {
  it('accepts valid property', () => {
    expect(PropertySchema.safeParse(validProperty).success).toBe(true)
  })
  it('rejects sqft below 100', () => {
    expect(PropertySchema.safeParse({ ...validProperty, sqft: 50 }).success).toBe(false)
  })
  it('rejects yearBuilt in future', () => {
    expect(PropertySchema.safeParse({ ...validProperty, yearBuilt: 3000 }).success).toBe(false)
  })
})

describe('AssessmentSchema', () => {
  it('accepts valid assessment', () => {
    expect(AssessmentSchema.safeParse(validAssessment).success).toBe(true)
  })
  it('rejects taxRate >= 0.1', () => {
    expect(AssessmentSchema.safeParse({ ...validAssessment, taxRate: 0.2 }).success).toBe(false)
  })
  it('rejects currentAssessedValue below 1000', () => {
    expect(
      AssessmentSchema.safeParse({ ...validAssessment, currentAssessedValue: 0 }).success,
    ).toBe(false)
  })
})

describe('CompSchema', () => {
  it('accepts valid comp', () => {
    expect(CompSchema.safeParse(validComp).success).toBe(true)
  })
  it('rejects non-Texas ZIP shape', () => {
    expect(CompSchema.safeParse({ ...validComp, zip: 'abcde' }).success).toBe(false)
  })
})

describe('AppealSchema', () => {
  const validAppeal = {
    id: 'x',
    ownerUid: 'u1',
    year: 2026,
    status: 'draft' as const,
    property: validProperty,
    assessment: validAssessment,
    selectedComps: [validComp, validComp, validComp],
    calculation: null,
  }
  it('accepts draft with 3 comps', () => {
    expect(AppealSchema.safeParse(validAppeal).success).toBe(true)
  })
  it('rejects ready status with fewer than 3 comps', () => {
    const appeal = { ...validAppeal, status: 'ready' as const, selectedComps: [validComp] }
    expect(AppealSchema.safeParse(appeal).success).toBe(false)
  })
})
