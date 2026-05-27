import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CoursesFilters from '@/components/teacher-courses/CoursesFilters'

const defaultProps = {
  statusFilter: 'ALL' as const,
  onStatusFilterChange: vi.fn(),
  search: '',
  onSearchChange: vi.fn(),
}

describe('CoursesFilters', () => {
  it('renders filter buttons for all statuses', () => {
    render(<CoursesFilters {...defaultProps} />)
    expect(screen.getAllByText('All').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Published').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Draft').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Hidden').length).toBeGreaterThan(0)
  })

  it('renders search input', () => {
    render(<CoursesFilters {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search courses...')).toBeInTheDocument()
  })

  it('displays current search value', () => {
    render(<CoursesFilters {...defaultProps} search="React" />)
    expect(screen.getByDisplayValue('React')).toBeInTheDocument()
  })

  it('calls onSearchChange when input changes', () => {
    const onSearchChange = vi.fn()
    render(<CoursesFilters {...defaultProps} onSearchChange={onSearchChange} />)
    fireEvent.change(screen.getByPlaceholderText('Search courses...'), { target: { value: 'Vue' } })
    expect(onSearchChange).toHaveBeenCalledWith('Vue')
  })

  it('calls onStatusFilterChange when a filter button is clicked', () => {
    const onStatusFilterChange = vi.fn()
    render(<CoursesFilters {...defaultProps} onStatusFilterChange={onStatusFilterChange} />)
    fireEvent.click(screen.getAllByText('Published')[0])
    expect(onStatusFilterChange).toHaveBeenCalledWith('PUBLISHED')
  })

  it('calls onStatusFilterChange with DRAFT', () => {
    const onStatusFilterChange = vi.fn()
    render(<CoursesFilters {...defaultProps} onStatusFilterChange={onStatusFilterChange} />)
    fireEvent.click(screen.getAllByText('Draft')[0])
    expect(onStatusFilterChange).toHaveBeenCalledWith('DRAFT')
  })

  it('calls onStatusFilterChange with HIDDEN', () => {
    const onStatusFilterChange = vi.fn()
    render(<CoursesFilters {...defaultProps} onStatusFilterChange={onStatusFilterChange} />)
    fireEvent.click(screen.getAllByText('Hidden')[0])
    expect(onStatusFilterChange).toHaveBeenCalledWith('HIDDEN')
  })
})
