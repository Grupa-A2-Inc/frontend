import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Toast from '@/components/class-ui/Toast'

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders the message text', () => {
    render(<Toast message="Operation successful" type="success" onClose={vi.fn()} />)
    expect(screen.getByText(/Operation successful/)).toBeInTheDocument()
  })

  it('renders success emoji for success type', () => {
    render(<Toast message="Done" type="success" onClose={vi.fn()} />)
    expect(screen.getByText(/✅/)).toBeInTheDocument()
  })

  it('renders error emoji for error type', () => {
    render(<Toast message="Failed" type="error" onClose={vi.fn()} />)
    expect(screen.getByText(/❌/)).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    render(<Toast message="Test" type="success" onClose={onClose} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose automatically after 4000ms', () => {
    const onClose = vi.fn()
    render(<Toast message="Auto-close" type="success" onClose={onClose} />)
    expect(onClose).not.toHaveBeenCalled()
    vi.advanceTimersByTime(4000)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not auto-close before 4000ms', () => {
    const onClose = vi.fn()
    render(<Toast message="No close yet" type="error" onClose={onClose} />)
    vi.advanceTimersByTime(3999)
    expect(onClose).not.toHaveBeenCalled()
  })
})
