import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StepProperty } from './StepProperty'
import { useAppealStore } from '@/store/useAppealStore'

beforeEach(() => useAppealStore.getState().reset())

describe('StepProperty', () => {
  it('blocks Next when required fields are missing', async () => {
    render(<StepProperty />)
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(await screen.findAllByText(/required|must|invalid/i)).not.toHaveLength(0)
  })

  it('persists values to store on valid submit', async () => {
    render(<StepProperty />)
    await userEvent.type(screen.getByLabelText(/address/i), '123 Oak St, Houston, TX')
    await userEvent.type(screen.getByLabelText(/parcel/i), '0660740000013')
    await userEvent.type(screen.getByLabelText(/year built/i), '1998')
    await userEvent.type(screen.getByLabelText(/sqft/i), '1850')
    await userEvent.type(screen.getByLabelText(/bedrooms/i), '3')
    await userEvent.type(screen.getByLabelText(/bathrooms/i), '2')
    await userEvent.type(screen.getByLabelText(/lot size/i), '6500')
    await userEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(useAppealStore.getState().property.address).toBe('123 Oak St, Houston, TX')
    expect(useAppealStore.getState().step).toBe(1)
  })
})
