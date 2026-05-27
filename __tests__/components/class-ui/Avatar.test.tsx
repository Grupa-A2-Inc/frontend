import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Avatar from '@/components/class-ui/Avatar'

describe('Avatar', () => {
  it('shows first letter of single name', () => {
    render(<Avatar name="Alice" />)
    expect(screen.getByText('A')).toBeInTheDocument()
  })

  it('shows initials of two-word name', () => {
    render(<Avatar name="John Doe" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('shows max 2 initials for long name', () => {
    render(<Avatar name="John Michael Doe" />)
    expect(screen.getByText('JM')).toBeInTheDocument()
  })

  it('shows uppercase initials', () => {
    render(<Avatar name="john doe" />)
    expect(screen.getByText('JD')).toBeInTheDocument()
  })

  it('applies medium size classes by default', () => {
    const { container } = render(<Avatar name="Alice" />)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('h-10')
  })

  it('applies small size classes when size="sm"', () => {
    const { container } = render(<Avatar name="Alice" size="sm" />)
    const div = container.firstChild as HTMLElement
    expect(div.className).toContain('h-8')
  })
})
