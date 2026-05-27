import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UsersHeader from '@/components/user-management/UsersHeader'

const baseProps = {
  totalUsers: 25,
  onAddUser: vi.fn(),
  onImportCsv: vi.fn(),
  importing: false,
}

describe('UsersHeader', () => {
  it('renders User Management heading', () => {
    render(<UsersHeader {...baseProps} />)
    expect(screen.getByText('User Management')).toBeInTheDocument()
  })

  it('shows total users count (plural)', () => {
    render(<UsersHeader {...baseProps} />)
    expect(screen.getByText('25 users total')).toBeInTheDocument()
  })

  it('shows singular for one user', () => {
    render(<UsersHeader {...baseProps} totalUsers={1} />)
    expect(screen.getByText('1 user total')).toBeInTheDocument()
  })

  it('renders Add User button', () => {
    render(<UsersHeader {...baseProps} />)
    expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument()
  })

  it('calls onAddUser when Add User clicked', () => {
    const onAddUser = vi.fn()
    render(<UsersHeader {...baseProps} onAddUser={onAddUser} />)
    fireEvent.click(screen.getByRole('button', { name: /add user/i }))
    expect(onAddUser).toHaveBeenCalled()
  })

  it('shows Import CSV label', () => {
    render(<UsersHeader {...baseProps} />)
    expect(screen.getByText('Import CSV')).toBeInTheDocument()
  })

  it('shows Importing... when importing is true', () => {
    render(<UsersHeader {...baseProps} importing={true} />)
    expect(screen.getByText('Importing...')).toBeInTheDocument()
  })
})
