import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchBar from '@/components/student-courses/SearchBar'

const defaultProps = {
  search: '',
  onSearchChange: vi.fn(),
  category: 'ALL',
  onCategoryChange: vi.fn(),
  categories: ['Web', 'Mobile', 'Data Science'],
}

describe('SearchBar', () => {
  it('renders search input', () => {
    render(<SearchBar {...defaultProps} />)
    expect(screen.getByPlaceholderText('Search courses...')).toBeInTheDocument()
  })

  it('displays current search value', () => {
    render(<SearchBar {...defaultProps} search="React" />)
    expect(screen.getByDisplayValue('React')).toBeInTheDocument()
  })

  it('calls onSearchChange when input changes', () => {
    const onSearchChange = vi.fn()
    render(<SearchBar {...defaultProps} onSearchChange={onSearchChange} />)
    fireEvent.change(screen.getByPlaceholderText('Search courses...'), { target: { value: 'Vue' } })
    expect(onSearchChange).toHaveBeenCalledWith('Vue')
  })

  it('renders category dropdown with all categories', () => {
    render(<SearchBar {...defaultProps} />)
    expect(screen.getByDisplayValue('All categories')).toBeInTheDocument()
    expect(screen.getByText('Web')).toBeInTheDocument()
    expect(screen.getByText('Mobile')).toBeInTheDocument()
  })

  it('calls onCategoryChange when category changes', () => {
    const onCategoryChange = vi.fn()
    render(<SearchBar {...defaultProps} onCategoryChange={onCategoryChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Web' } })
    expect(onCategoryChange).toHaveBeenCalledWith('Web')
  })

  it('shows selected category', () => {
    render(<SearchBar {...defaultProps} category="Web" />)
    expect(screen.getByDisplayValue('Web')).toBeInTheDocument()
  })
})
