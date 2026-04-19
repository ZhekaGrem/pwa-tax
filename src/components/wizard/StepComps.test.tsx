import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepComps } from './StepComps'
import { useAppealStore } from '@/store/useAppealStore'

beforeEach(() => {
  useAppealStore.getState().reset()
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            parcelId: 'a1',
            address: '1 A',
            zip: '77005',
            assessedValue: 300000,
            sqft: 1800,
            yearBuilt: 2000,
            bedrooms: 3,
            bathrooms: 2,
          },
          {
            parcelId: 'a2',
            address: '2 A',
            zip: '77005',
            assessedValue: 320000,
            sqft: 1850,
            yearBuilt: 2001,
            bedrooms: 3,
            bathrooms: 2,
          },
          {
            parcelId: 'a3',
            address: '3 A',
            zip: '77005',
            assessedValue: 340000,
            sqft: 1900,
            yearBuilt: 2002,
            bedrooms: 3,
            bathrooms: 2,
          },
        ]),
    }),
  )
})

describe('StepComps', () => {
  it('loads comps on ZIP submit and allows selection', async () => {
    render(<StepComps />)
    await userEvent.type(screen.getByLabelText(/zip/i), '77005')
    await userEvent.click(screen.getByRole('button', { name: /load/i }))
    const rows = await screen.findAllByRole('checkbox')
    await userEvent.click(rows[0])
    await userEvent.click(rows[1])
    await userEvent.click(rows[2])
    expect(useAppealStore.getState().selectedComps).toHaveLength(3)
  })

  it('blocks Next with fewer than 3 comps selected', async () => {
    render(<StepComps />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(useAppealStore.getState().step).toBe(0)
    expect(await screen.findByText(/select at least 3/i)).toBeInTheDocument()
  })
})
