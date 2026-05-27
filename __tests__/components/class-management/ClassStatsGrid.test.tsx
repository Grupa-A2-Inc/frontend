import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ClassStatsGrid from '@/components/class-management/ClassStatsGrid'
import type { ClassDetails, ClassMember } from '@/lib/classes/types'

const cls: ClassDetails = {
  id: 'cls1',
  name: 'Class A',
  description: 'Test class',
  createdAt: '2024-01-15T00:00:00Z',
}

const members: ClassMember[] = [
  { userId: 'u1', email: 's1@test.com', membershipType: 'STUDENT' },
  { userId: 'u2', email: 's2@test.com', membershipType: 'STUDENT' },
  { userId: 'u3', email: 't1@test.com', membershipType: 'TEACHER' },
]

describe('ClassStatsGrid', () => {
  it('renders Students label', () => {
    render(<ClassStatsGrid cls={cls} members={members} />)
    expect(screen.getByText('Students')).toBeInTheDocument()
  })

  it('shows correct student count', () => {
    render(<ClassStatsGrid cls={cls} members={members} />)
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('shows correct teacher count', () => {
    render(<ClassStatsGrid cls={cls} members={members} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders Teachers label', () => {
    render(<ClassStatsGrid cls={cls} members={members} />)
    expect(screen.getByText('Teachers')).toBeInTheDocument()
  })

  it('renders Created label', () => {
    render(<ClassStatsGrid cls={cls} members={members} />)
    expect(screen.getByText('Created')).toBeInTheDocument()
  })

  it('shows dash for missing createdAt', () => {
    render(<ClassStatsGrid cls={{ ...cls, createdAt: undefined }} members={[]} />)
    expect(screen.getByText('—')).toBeInTheDocument()
  })

  it('shows 0 students when no members', () => {
    render(<ClassStatsGrid cls={cls} members={[]} />)
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1)
  })
})
