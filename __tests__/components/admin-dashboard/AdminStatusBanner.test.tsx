import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminStatusBanner from '@/components/admin-dashboard/AdminStatusBanner'

describe('AdminStatusBanner', () => {
  it('renders message text', () => {
    render(<AdminStatusBanner variant="success" message="Operation completed" />)
    expect(screen.getByText('Operation completed')).toBeInTheDocument()
  })

  it('renders success variant with correct classes', () => {
    const { container } = render(<AdminStatusBanner variant="success" message="Success" />)
    expect(container.firstChild).toHaveClass('rounded-xl')
  })

  it('renders error variant', () => {
    render(<AdminStatusBanner variant="error" message="Error occurred" />)
    expect(screen.getByText('Error occurred')).toBeInTheDocument()
  })

  it('renders warning variant', () => {
    render(<AdminStatusBanner variant="warning" message="Caution" />)
    expect(screen.getByText('Caution')).toBeInTheDocument()
  })
})
