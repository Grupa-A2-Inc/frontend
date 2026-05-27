import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/lib/fetchWithAuth', () => ({
  fetchWithAuth: vi.fn(),
}))

import { fetchWithAuth } from '@/lib/fetchWithAuth'
import AddStudentModal from '@/components/class-management/AddStudentModal'

const mockFetch = vi.mocked(fetchWithAuth)

const users = [
  { id: 'u1', email: 'alice@test.com', firstName: 'Alice', lastName: 'Smith', roleName: 'STUDENT' },
  { id: 'u2', email: 'bob@test.com', firstName: 'Bob', lastName: 'Jones', roleName: 'STUDENT' },
]

const baseProps = {
  token: 'tok',
  classId: 'cl1',
  existingUserIds: [],
  roleFilter: 'STUDENT' as const,
  onAdded: vi.fn(),
  onClose: vi.fn(),
}

describe('AddStudentModal', () => {
  it('shows loading spinner initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<AddStudentModal {...baseProps} />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })

  it('renders student list after loading', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => users,
    } as Response)
    render(<AddStudentModal {...baseProps} />)
    expect(await screen.findByText('alice@test.com')).toBeInTheDocument()
    expect(screen.getByText('bob@test.com')).toBeInTheDocument()
  })

  it('shows "Add student" heading for STUDENT roleFilter', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<AddStudentModal {...baseProps} />)
    expect(screen.getByText('Add student')).toBeInTheDocument()
  })

  it('shows "Assign teacher" heading for TEACHER roleFilter', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<AddStudentModal {...baseProps} roleFilter="TEACHER" />)
    expect(screen.getByText('Assign teacher')).toBeInTheDocument()
  })

  it('renders search input', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<AddStudentModal {...baseProps} />)
    expect(screen.getByPlaceholderText('Search by name or email…')).toBeInTheDocument()
  })

  it('shows error on failed fetch', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response)
    render(<AddStudentModal {...baseProps} />)
    expect(await screen.findByText('Failed to load users')).toBeInTheDocument()
  })

  it('filters out existing users', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => users,
    } as Response)
    render(<AddStudentModal {...baseProps} existingUserIds={['u1']} />)
    await screen.findByText('bob@test.com')
    expect(screen.queryByText('alice@test.com')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    const onClose = vi.fn()
    render(<AddStudentModal {...baseProps} onClose={onClose} />)
    fireEvent.click(screen.getByText('✕'))
    expect(onClose).toHaveBeenCalled()
  })
})
