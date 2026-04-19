import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SyncBadgeView } from './SyncBadge'

describe('SyncBadgeView', () => {
  it('renders synced state', () => {
    render(<SyncBadgeView state="synced" />)
    expect(screen.getByText(/saved/i)).toBeInTheDocument()
  })
  it('renders pending state', () => {
    render(<SyncBadgeView state="pending" />)
    expect(screen.getByText(/syncing/i)).toBeInTheDocument()
  })
  it('renders offline state', () => {
    render(<SyncBadgeView state="offline" />)
    expect(screen.getByText(/offline/i)).toBeInTheDocument()
  })
})
