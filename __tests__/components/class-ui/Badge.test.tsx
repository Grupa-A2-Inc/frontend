import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Badge from '@/components/class-ui/Badge'

describe('Badge', () => {
  it('renders "Active" for ACTIVE status', () => {
    render(<Badge status="ACTIVE" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders "Inactive" for INACTIVE status', () => {
    render(<Badge status="INACTIVE" />)
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('applies success classes for ACTIVE', () => {
    const { container } = render(<Badge status="ACTIVE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('success-bg')
  })

  it('applies error classes for INACTIVE', () => {
    const { container } = render(<Badge status="INACTIVE" />)
    const badge = container.firstChild as HTMLElement
    expect(badge.className).toContain('error-bg')
  })
})
