import { describe, it, expect, beforeEach } from 'vitest'
import { useAppealStore } from './useAppealStore'

beforeEach(() => {
  useAppealStore.setState(useAppealStore.getInitialState(), true)
  localStorage.clear()
})

describe('useAppealStore', () => {
  it('starts at step 0', () => {
    expect(useAppealStore.getState().step).toBe(0)
  })

  it('advances to next step', () => {
    useAppealStore.getState().nextStep()
    expect(useAppealStore.getState().step).toBe(1)
  })

  it('caps step at 3', () => {
    const { nextStep } = useAppealStore.getState()
    for (let i = 0; i < 10; i++) nextStep()
    expect(useAppealStore.getState().step).toBe(3)
  })

  it('patches property and assessment', () => {
    useAppealStore.getState().patchProperty({ address: '1 A St' })
    useAppealStore.getState().patchAssessment({ taxRate: 0.02 })
    expect(useAppealStore.getState().property.address).toBe('1 A St')
    expect(useAppealStore.getState().assessment.taxRate).toBe(0.02)
  })

  it('resets', () => {
    useAppealStore.getState().patchProperty({ address: 'X' })
    useAppealStore.getState().reset()
    expect(useAppealStore.getState().property.address).toBeUndefined()
  })
})
