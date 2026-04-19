import { z } from 'zod'

const currentYear = new Date().getFullYear()

export const PropertySchema = z.object({
  address: z.string().min(5),
  county: z.literal('Harris'),
  parcelId: z.string().min(5),
  yearBuilt: z.number().int().min(1800).max(currentYear),
  sqft: z.number().min(100),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  lotSizeSqft: z.number().min(0),
})

export const AssessmentSchema = z.object({
  currentAssessedValue: z.number().min(1000),
  marketValue: z.number().min(0),
  taxRate: z.number().gt(0).lt(0.1),
})

export const CompSchema = z.object({
  parcelId: z.string().min(5),
  address: z.string().min(5),
  zip: z.string().regex(/^\d{5}$/, 'ZIP must be 5 digits'),
  assessedValue: z.number().min(0),
  sqft: z.number().min(100),
  yearBuilt: z.number().int().min(1800).max(currentYear),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().min(0).max(20),
  distance: z.number().min(0).optional(),
})

export const CalculationSchema = z.object({
  medianCompValue: z.number(),
  proposedValue: z.number(),
  taxSavingsUSD: z.number(),
  percentReduction: z.number(),
})

export const AppealSchema = z
  .object({
    id: z.string(),
    ownerUid: z.string(),
    year: z.number().int(),
    status: z.enum(['draft', 'ready', 'submitted']),
    property: PropertySchema,
    assessment: AssessmentSchema,
    selectedComps: z.array(CompSchema).max(5),
    calculation: CalculationSchema.nullable(),
  })
  .refine((a) => a.status === 'draft' || a.selectedComps.length >= 3, {
    message: 'At least 3 comps required before ready/submitted',
    path: ['selectedComps'],
  })

export type Property = z.infer<typeof PropertySchema>
export type Assessment = z.infer<typeof AssessmentSchema>
export type Comp = z.infer<typeof CompSchema>
export type Calculation = z.infer<typeof CalculationSchema>
export type Appeal = z.infer<typeof AppealSchema>
