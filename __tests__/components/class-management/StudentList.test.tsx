import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import StudentList from '@/components/class-management/StudentList'
import type { ClassMember } from '@/lib/classes/types'

const members: ClassMember[] = [
  { userId: 'u1', email: 'alice@test.com', membershipType: 'STUDENT' },
  { userId: 'u2', email: 'bob@test.com', membershipType: 'STUDENT' },
  { userId: 'u3', email: 'teacher@test.com', membershipType: 'TEACHER' },
]

describe('StudentList', () => {
  it('renders student emails', () => {
    render(<StudentList members={members} onAddClick={vi.fn()} onRemoveClick={vi.fn()} />)
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
    expect(screen.getByText('bob@test.com')).toBeInTheDocument()
  })

  it('does not render teacher in list', () => {
    render(<StudentList members={members} onAddClick={vi.fn()} onRemoveClick={vi.fn()} />)
    expect(screen.queryByText('teacher@test.com')).not.toBeInTheDocument()
  })

  it('shows enrolled count', () => {
    render(<StudentList members={members} onAddClick={vi.fn()} onRemoveClick={vi.fn()} />)
    expect(screen.getByText('2 enrolled')).toBeInTheDocument()
  })

  it('renders Add member button', () => {
    render(<StudentList members={members} onAddClick={vi.fn()} onRemoveClick={vi.fn()} />)
    expect(screen.getByText('Add member')).toBeInTheDocument()
  })

  it('calls onAddClick when Add member is clicked', () => {
    const onAddClick = vi.fn()
    render(<StudentList members={members} onAddClick={onAddClick} onRemoveClick={vi.fn()} />)
    fireEvent.click(screen.getByText('Add member'))
    expect(onAddClick).toHaveBeenCalled()
  })

  it('renders Remove button for each student', () => {
    render(<StudentList members={members} onAddClick={vi.fn()} onRemoveClick={vi.fn()} />)
    expect(screen.getAllByText('Remove')).toHaveLength(2)
  })

  it('calls onRemoveClick with member when Remove is clicked', () => {
    const onRemoveClick = vi.fn()
    render(<StudentList members={members} onAddClick={vi.fn()} onRemoveClick={onRemoveClick} />)
    fireEvent.click(screen.getAllByText('Remove')[0])
    expect(onRemoveClick).toHaveBeenCalledWith(members[0])
  })

  it('shows empty state when no students', () => {
    render(<StudentList members={[]} onAddClick={vi.fn()} onRemoveClick={vi.fn()} />)
    expect(screen.getByText('No students yet. Add one above.')).toBeInTheDocument()
  })

  it('filters students by search', () => {
    render(<StudentList members={members} onAddClick={vi.fn()} onRemoveClick={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('Search by email…'), { target: { value: 'alice' } })
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
    expect(screen.queryByText('bob@test.com')).not.toBeInTheDocument()
  })
})
