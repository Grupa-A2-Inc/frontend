import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OrganizationInlineEditForm from '@/components/admin-dashboard/OrganizationInlineEditForm'

vi.mock('@/lib/admin-dashboard/api', () => ({
  getOrganizationIdFromStorage: vi.fn().mockReturnValue('o1'),
  updateOrganizationById: vi.fn().mockResolvedValue(undefined),
}))

import { getOrganizationIdFromStorage, updateOrganizationById } from '@/lib/admin-dashboard/api'
const mockGetOrgId = getOrganizationIdFromStorage as ReturnType<typeof vi.fn>
const mockUpdate = updateOrganizationById as ReturnType<typeof vi.fn>

const initialValues = {
  id: 'o1',
  organizationName: 'Acme',
  organizationType: 'Education',
  country: 'Romania',
  city: 'Bucharest',
  address: '123 St',
  phoneNumber: '123',
}

describe('OrganizationInlineEditForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetOrgId.mockReturnValue('o1')
    mockUpdate.mockResolvedValue(undefined)
  })

  it('renders all form fields', () => {
    render(<OrganizationInlineEditForm initialValues={initialValues} onCancel={vi.fn()} onSuccess={vi.fn()} />)
    expect(screen.getByDisplayValue('Acme')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Romania')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Bucharest')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<OrganizationInlineEditForm initialValues={initialValues} onCancel={onCancel} onSuccess={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows validation error when name is empty', async () => {
    render(<OrganizationInlineEditForm initialValues={{ ...initialValues, organizationName: '' }} onCancel={vi.fn()} onSuccess={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    await waitFor(() => {
      expect(screen.getByText(/Organization name is required/i)).toBeInTheDocument()
    })
  })

  it('shows error when org ID is not found', async () => {
    mockGetOrgId.mockReturnValue(null)
    render(<OrganizationInlineEditForm initialValues={initialValues} onCancel={vi.fn()} onSuccess={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    await waitFor(() => {
      expect(screen.getByText(/Organization ID was not found/i)).toBeInTheDocument()
    })
  })

  it('calls onSuccess on successful save', async () => {
    const onSuccess = vi.fn()
    render(<OrganizationInlineEditForm initialValues={initialValues} onCancel={vi.fn()} onSuccess={onSuccess} />)
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
    })
  })

  it('shows success message after save', async () => {
    render(<OrganizationInlineEditForm initialValues={initialValues} onCancel={vi.fn()} onSuccess={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    await waitFor(() => {
      expect(screen.getByText(/updated successfully/i)).toBeInTheDocument()
    })
  })

  it('shows error message when save fails', async () => {
    mockUpdate.mockRejectedValueOnce(new Error('Server error'))
    render(<OrganizationInlineEditForm initialValues={initialValues} onCancel={vi.fn()} onSuccess={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })

  it('shows validation error when country is empty', async () => {
    render(<OrganizationInlineEditForm initialValues={{ ...initialValues, country: '' }} onCancel={vi.fn()} onSuccess={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    await waitFor(() => {
      expect(screen.getByText(/Country is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when city is empty', async () => {
    render(<OrganizationInlineEditForm initialValues={{ ...initialValues, city: '' }} onCancel={vi.fn()} onSuccess={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    await waitFor(() => {
      expect(screen.getByText(/City is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error when type is empty', async () => {
    render(<OrganizationInlineEditForm initialValues={{ ...initialValues, organizationType: '' }} onCancel={vi.fn()} onSuccess={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    await waitFor(() => {
      expect(screen.getByText(/Organization type is required/i)).toBeInTheDocument()
    })
  })
})
