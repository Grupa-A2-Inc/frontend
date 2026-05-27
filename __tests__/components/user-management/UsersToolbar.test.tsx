import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UsersToolbar from '@/components/user-management/UsersToolbar'
import type { UsersRoleCounts } from '@/store/slices/usersSlice'

const roleCounts: UsersRoleCounts = { all: 50, students: 30, teachers: 15, admins: 5 }

const baseProps = {
  roleCounts,
  search: '',
  onSearchChange: vi.fn(),
  roleFilter: 'ALL' as const,
  onRoleFilterChange: vi.fn(),
  statusFilter: 'ALL' as const,
  onStatusFilterChange: vi.fn(),
}

describe('UsersToolbar', () => {
  it('renders role filter tabs', () => {
    render(<UsersToolbar {...baseProps} />)
    expect(screen.getAllByText('All').length).toBeGreaterThan(0)
    expect(screen.getByText('Students')).toBeInTheDocument()
    expect(screen.getByText('Teachers')).toBeInTheDocument()
    expect(screen.getByText('Admins')).toBeInTheDocument()
  })

  it('shows role counts', () => {
    render(<UsersToolbar {...baseProps} />)
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('30')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<UsersToolbar {...baseProps} />)
    expect(screen.getByPlaceholderText('Search by name or email...')).toBeInTheDocument()
  })

  it('calls onSearchChange when search changes', () => {
    const onSearchChange = vi.fn()
    render(<UsersToolbar {...baseProps} onSearchChange={onSearchChange} />)
    fireEvent.change(screen.getByPlaceholderText('Search by name or email...'), { target: { value: 'alice' } })
    expect(onSearchChange).toHaveBeenCalledWith('alice')
  })

  it('calls onRoleFilterChange when role tab clicked', () => {
    const onRoleFilterChange = vi.fn()
    render(<UsersToolbar {...baseProps} onRoleFilterChange={onRoleFilterChange} />)
    fireEvent.click(screen.getByText('Students'))
    expect(onRoleFilterChange).toHaveBeenCalledWith('STUDENT')
  })

  it('renders status filter tabs', () => {
    render(<UsersToolbar {...baseProps} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByText('Inactive')).toBeInTheDocument()
  })

  it('calls onStatusFilterChange when status tab clicked', () => {
    const onStatusFilterChange = vi.fn()
    render(<UsersToolbar {...baseProps} onStatusFilterChange={onStatusFilterChange} />)
    fireEvent.click(screen.getByText('Active'))
    expect(onStatusFilterChange).toHaveBeenCalledWith('ACTIVE')
  })
})
