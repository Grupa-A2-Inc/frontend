import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import OrganizationSummaryCard from '@/components/admin-dashboard/OrganizationSummaryCard'

vi.mock('@/lib/admin-dashboard/api', () => ({
  getOrganizationById: vi.fn().mockResolvedValue({
    id: 'o1', organizationName: 'Acme', organizationType: 'Edu',
    country: 'RO', city: 'BUC', address: 'Str', phoneNumber: '123',
  }),
}))

const org = {
  id: 'o1',
  organizationName: 'Acme Corp',
  organizationType: 'Education',
  country: 'Romania',
  city: 'Bucharest',
  address: '123 Main St',
  phoneNumber: '+40123456789',
}

describe('OrganizationSummaryCard', () => {
  it('renders org information', () => {
    render(<OrganizationSummaryCard organization={org} onOrganizationUpdated={vi.fn()} />)
    expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    expect(screen.getByText('Education')).toBeInTheDocument()
    expect(screen.getByText('Romania')).toBeInTheDocument()
    expect(screen.getByText('Bucharest')).toBeInTheDocument()
  })

  it('renders Edit button in view mode', () => {
    render(<OrganizationSummaryCard organization={org} onOrganizationUpdated={vi.fn()} />)
    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument()
  })

  it('shows edit form when Edit is clicked', () => {
    render(<OrganizationSummaryCard organization={org} onOrganizationUpdated={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Edit/i }))
    expect(screen.queryByRole('button', { name: /Edit/i })).not.toBeInTheDocument()
  })

  it('shows dash for missing address', () => {
    render(<OrganizationSummaryCard organization={{ ...org, address: '' }} onOrganizationUpdated={vi.fn()} />)
    expect(screen.getAllByText('-').length).toBeGreaterThan(0)
  })
})
