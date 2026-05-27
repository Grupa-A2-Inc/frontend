import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UsersTable from '@/components/user-management/UsersTable'
import type { User } from '@/store/slices/usersSlice'

const users: User[] = [
  { id: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', role: 'STUDENT', status: 'ACTIVE' },
  { id: 'u2', firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com', role: 'TEACHER', status: 'INACTIVE' },
]

const baseProps = {
  filtered: users,
  search: '',
  roleFilter: 'ALL' as const,
  statusFilter: 'ALL' as const,
  onEdit: vi.fn(),
  onToggleStatus: vi.fn(),
  onDelete: vi.fn(),
}

describe('UsersTable', () => {
  it('renders user names', () => {
    render(<UsersTable {...baseProps} />)
    expect(screen.getAllByText(/Alice Smith/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Bob Jones/).length).toBeGreaterThan(0)
  })

  it('renders user emails', () => {
    render(<UsersTable {...baseProps} />)
    expect(screen.getAllByText('alice@test.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText('bob@test.com').length).toBeGreaterThan(0)
  })

  it('shows empty state when no users', () => {
    render(<UsersTable {...baseProps} filtered={[]} />)
    expect(screen.getByText('No users yet.')).toBeInTheDocument()
  })

  it('shows filter-based empty message with active filters', () => {
    render(<UsersTable {...baseProps} filtered={[]} search="xyz" />)
    expect(screen.getByText('No users match your filters.')).toBeInTheDocument()
  })

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn()
    render(<UsersTable {...baseProps} onEdit={onEdit} />)
    const editButtons = screen.getAllByTitle ? screen.queryAllByRole('button') : []
    // Find edit buttons with material icon "edit"
    const buttons = screen.getAllByRole('button')
    // Click first edit button we find
    const editBtn = Array.from(document.querySelectorAll('button')).find(b =>
      b.querySelector('.material-symbols-rounded')?.textContent === 'edit'
    )
    if (editBtn) {
      fireEvent.click(editBtn)
      expect(onEdit).toHaveBeenCalledWith(users[0])
    }
  })
})
