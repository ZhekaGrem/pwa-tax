import { describe, it, expect } from 'vitest'
import { getCurrentPhase, TEXAS_TIMELINE } from './timeline-texas'

describe('getCurrentPhase', () => {
  it('returns assessment phase on Feb 1', () => {
    expect(getCurrentPhase(new Date(2026, 1, 1)).id).toBe('assessment')
  })
  it('returns filing window on Apr 20', () => {
    expect(getCurrentPhase(new Date(2026, 3, 20)).id).toBe('filing')
  })
  it('returns filing window on May 15', () => {
    expect(getCurrentPhase(new Date(2026, 4, 15)).id).toBe('filing')
  })
  it('returns waiting on Jun 1', () => {
    expect(getCurrentPhase(new Date(2026, 5, 1)).id).toBe('waiting')
  })
  it('returns hearing on Oct 1', () => {
    expect(getCurrentPhase(new Date(2026, 9, 1)).id).toBe('hearing')
  })
})

describe('TEXAS_TIMELINE', () => {
  it('has 4 ordered phases', () => {
    expect(TEXAS_TIMELINE).toHaveLength(4)
    expect(TEXAS_TIMELINE.map((p) => p.id)).toEqual(['assessment', 'filing', 'waiting', 'hearing'])
  })
})
