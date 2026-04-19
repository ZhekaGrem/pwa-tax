import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SavingsBarChart } from './SavingsBarChart'
import { ComparisonChart } from './ComparisonChart'

describe('charts', () => {
  it('renders savings figure', () => {
    render(<SavingsBarChart currentTax={9240} proposedTax={6930} />)
    expect(screen.getByRole('figure', { name: /tax savings/i })).toBeInTheDocument()
  })
  it('renders comparison figure', () => {
    render(<ComparisonChart subjectPerSqft={200} medianPerSqft={165} />)
    expect(screen.getByRole('figure', { name: /per-square-foot/i })).toBeInTheDocument()
  })
})
