import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepAssessment } from './StepAssessment'
import { useAppealStore } from '@/store/useAppealStore'

beforeEach(() => useAppealStore.getState().reset())

describe('StepAssessment', () => {
  it('rejects taxRate >= 0.1', async () => {
    render(<StepAssessment />)
    await userEvent.type(screen.getByLabelText(/current assessed value/i), '400000')
    await userEvent.type(screen.getByLabelText(/market value/i), '420000')
    await userEvent.clear(screen.getByLabelText(/tax rate/i))
    await userEvent.type(screen.getByLabelText(/tax rate/i), '0.5')
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(useAppealStore.getState().step).toBe(0)
  })

  it('advances on valid submit', async () => {
    render(<StepAssessment />)
    await userEvent.type(screen.getByLabelText(/current assessed value/i), '400000')
    await userEvent.type(screen.getByLabelText(/market value/i), '420000')
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(useAppealStore.getState().step).toBe(1)
  })
})
