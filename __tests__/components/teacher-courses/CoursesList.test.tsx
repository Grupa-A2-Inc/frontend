import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CoursesList from '@/components/teacher-courses/CoursesList'
import type { Course } from '@/lib/courses/types'

const courses: Course[] = [
  { id: 'c1', title: 'React', description: '', category: 'Web', status: 'PUBLISHED', visibility: 'PUBLIC' },
  { id: 'c2', title: 'Vue', description: '', category: 'Web', status: 'DRAFT', visibility: 'PUBLIC' },
]

const baseProps = {
  courses,
  loading: false,
  error: null,
  search: '',
  statusFilter: 'ALL' as const,
  onEdit: vi.fn(),
  onManage: vi.fn(),
  onRetry: vi.fn(),
}

describe('CoursesList', () => {
  it('renders list of courses', () => {
    render(<CoursesList {...baseProps} />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Vue')).toBeInTheDocument()
  })

  it('shows empty state when no courses', () => {
    render(<CoursesList {...baseProps} courses={[]} />)
    expect(screen.getByText('No courses found.')).toBeInTheDocument()
  })

  it('shows loading skeleton rows', () => {
    render(<CoursesList {...baseProps} loading={true} />)
    expect(screen.queryByText('React')).not.toBeInTheDocument()
  })

  it('shows error message and retry button', () => {
    render(<CoursesList {...baseProps} error="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('calls onRetry when Retry is clicked', () => {
    const onRetry = vi.fn()
    render(<CoursesList {...baseProps} error="Oops" onRetry={onRetry} />)
    fireEvent.click(screen.getByText('Retry'))
    expect(onRetry).toHaveBeenCalled()
  })
})
