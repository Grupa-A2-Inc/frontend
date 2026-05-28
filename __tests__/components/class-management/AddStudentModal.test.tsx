import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

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
  beforeEach(() => {
    mockFetch.mockReset()
  })

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

  it('filters users by search query', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => users,
    } as Response)
    render(<AddStudentModal {...baseProps} />)
    await screen.findByText('alice@test.com')
    fireEvent.change(screen.getByPlaceholderText('Search by name or email…'), { target: { value: 'alice' } })
    expect(screen.queryByText('bob@test.com')).not.toBeInTheDocument()
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
  })

  it('shows no students message when filtered list is empty', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)
    render(<AddStudentModal {...baseProps} />)
    expect(await screen.findByText(/No students available to add/i)).toBeInTheDocument()
  })

  it('shows no teachers available when TEACHER roleFilter and empty', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)
    render(<AddStudentModal {...baseProps} roleFilter="TEACHER" />)
    expect(await screen.findByText(/No teachers available to add/i)).toBeInTheDocument()
  })

  it('adds a student when Add button clicked', async () => {
    const onAdded = vi.fn()
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => users } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) } as Response)
    render(<AddStudentModal {...baseProps} onAdded={onAdded} />)
    await screen.findByText('alice@test.com')
    fireEvent.click(screen.getAllByText('Add')[0])
    await waitFor(() => {
      expect(onAdded).toHaveBeenCalled()
    })
  })

  it('shows error when add member fails', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => users } as Response)
      .mockResolvedValueOnce({ ok: false, json: async () => ({ message: 'Add failed' }) } as Response)
    render(<AddStudentModal {...baseProps} />)
    await screen.findByText('alice@test.com')
    fireEvent.click(screen.getAllByText('Add')[0])
    expect(await screen.findByText('Add failed')).toBeInTheDocument()
  })

  it('handles users from data.content format', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ content: users }),
    } as Response)
    render(<AddStudentModal {...baseProps} />)
    expect(await screen.findByText('alice@test.com')).toBeInTheDocument()
  })

  it('loads users from every paginated organization page', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [users[0]],
          totalPages: 2,
          number: 0,
          size: 1,
          last: false,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [users[1]],
          totalPages: 2,
          number: 1,
          size: 1,
          last: true,
        }),
      } as Response)

    render(<AddStudentModal {...baseProps} />)

    expect(await screen.findByText('alice@test.com')).toBeInTheDocument()
    expect(await screen.findByText('bob@test.com')).toBeInTheDocument()
    expect(mockFetch).toHaveBeenCalledTimes(2)
    expect(mockFetch.mock.calls[0][0]).toContain('page=0')
    expect(mockFetch.mock.calls[1][0]).toContain('page=1')
  })

  it('handles user with role field instead of roleName', async () => {
    const usersWithRole = [{ id: 'u3', email: 'carol@test.com', firstName: 'Carol', lastName: 'Lee', role: 'STUDENT' }]
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => usersWithRole,
    } as Response)
    render(<AddStudentModal {...baseProps} />)
    expect(await screen.findByText('carol@test.com')).toBeInTheDocument()
  })
})
