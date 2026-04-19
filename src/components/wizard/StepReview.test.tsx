import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StepReview } from './StepReview'
import { useAppealStore } from '@/store/useAppealStore'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    signInWithGoogle: vi.fn(),
    signOut: vi.fn(),
  }),
}))

beforeEach(() => {
  useAppealStore.setState(
    {
      id: 'demo',
      step: 3,
      property: {
        address: '1 A',
        county: 'Harris',
        parcelId: 'p',
        yearBuilt: 2000,
        sqft: 2000,
        bedrooms: 3,
        bathrooms: 2,
        lotSizeSqft: 6000,
      },
      assessment: { currentAssessedValue: 400000, marketValue: 420000, taxRate: 0.0231 },
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
      zip: '77005',
    },
    false,
  )
})

describe('StepReview', () => {
  it('shows computed savings in USD', () => {
    render(<StepReview />)
    expect(screen.getByText(/\$2,/)).toBeInTheDocument() // (400000-310000)*0.0231 ≈ $2,079
    expect(screen.getByRole('figure', { name: /tax savings/i })).toBeInTheDocument()
  })

  it('has a Generate PDF button', () => {
    render(<StepReview />)
    expect(screen.getByRole('button', { name: /generate pdf/i })).toBeInTheDocument()
  })
})
