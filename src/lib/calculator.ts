import { ValidationError } from './errors'

export function median(values: number[]): number {
  if (values.length === 0) throw new ValidationError('Cannot compute median of empty array')
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

type ComputeInput = {
  property: { sqft: number }
  currentAssessedValue: number
  comps: ReadonlyArray<{ assessedValue: number; sqft: number }>
  taxRate: number
}

export type ComputeResult = {
  medianCompValue: number
  proposedValue: number
  taxSavingsUSD: number
  percentReduction: number
}

export function computeSavings({
  property,
  currentAssessedValue,
  comps,
  taxRate,
}: ComputeInput): ComputeResult {
  if (comps.length === 0) throw new ValidationError('At least one comp required')
  if (currentAssessedValue < 0) throw new ValidationError('currentAssessedValue must be >= 0')
  if (property.sqft <= 0) throw new ValidationError('Subject sqft must be > 0')
  if (taxRate <= 0 || taxRate >= 0.1) throw new ValidationError('taxRate out of range (0, 0.1)')
  if (comps.some((c) => c.sqft <= 0)) throw new ValidationError('All comps must have sqft > 0')

  const pricePerSqft = comps.map((c) => c.assessedValue / c.sqft)
  const medianPricePerSqft = median(pricePerSqft)
  const medianCompValue = medianPricePerSqft * property.sqft
  const proposedValue = Math.min(currentAssessedValue, medianCompValue)
  const taxSavingsUSD = Math.max(0, (currentAssessedValue - proposedValue) * taxRate)
  const percentReduction =
    currentAssessedValue > 0
      ? Math.max(0, (currentAssessedValue - proposedValue) / currentAssessedValue)
      : 0

  return { medianCompValue, proposedValue, taxSavingsUSD, percentReduction }
}
