import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminQuickLinks from '@/components/admin-dashboard/AdminQuickLinks'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

describe('AdminQuickLinks', () => {
  it('renders the Quick Links heading', () => {
    render(<AdminQuickLinks />)
    expect(screen.getByText('Quick Links')).toBeInTheDocument()
  })

  it('renders all three links', () => {
    render(<AdminQuickLinks />)
    expect(screen.getByText('Manage Users')).toBeInTheDocument()
    expect(screen.getByText('Manage Classes')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('links have correct hrefs', () => {
    render(<AdminQuickLinks />)
    expect(screen.getByText('Manage Users').closest('a')).toHaveAttribute('href', '/dashboard/admin/users')
    expect(screen.getByText('Manage Classes').closest('a')).toHaveAttribute('href', '/dashboard/admin/classes')
    expect(screen.getByText('Settings').closest('a')).toHaveAttribute('href', '/dashboard/admin/settings')
  })
})
