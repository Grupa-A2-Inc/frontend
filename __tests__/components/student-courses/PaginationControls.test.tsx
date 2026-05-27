import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PaginationControls from '@/components/student-courses/PaginationControls'

const basePagination = {
  number: 0, totalPages: 3, totalElements: 25, size: 10, numberOfElements: 10,
  first: true, last: false, empty: false,
}

describe('PaginationControls', () => {
  it('renders Previous and Next buttons', () => {
    render(<PaginationControls pagination={basePagination} loading={false} onPageChange={vi.fn()} pageSize={10} onPageSizeChange={vi.fn()} />)
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('shows page info', () => {
    render(<PaginationControls pagination={basePagination} loading={false} onPageChange={vi.fn()} pageSize={10} onPageSizeChange={vi.fn()} />)
    expect(screen.getByText(/Page 1 \/ 3/)).toBeInTheDocument()
  })

  it('disables Previous on first page', () => {
    render(<PaginationControls pagination={basePagination} loading={false} onPageChange={vi.fn()} pageSize={10} onPageSizeChange={vi.fn()} />)
    expect(screen.getByText('Previous').closest('button')).toBeDisabled()
  })

  it('disables Next on last page', () => {
    const lastPage = { ...basePagination, number: 2, first: false, last: true }
    render(<PaginationControls pagination={lastPage} loading={false} onPageChange={vi.fn()} pageSize={10} onPageSizeChange={vi.fn()} />)
    expect(screen.getByText('Next').closest('button')).toBeDisabled()
  })

  it('calls onPageChange with next page on Next click', () => {
    const onPageChange = vi.fn()
    render(<PaginationControls pagination={basePagination} loading={false} onPageChange={onPageChange} pageSize={10} onPageSizeChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Next'))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('calls onPageChange with prev page on Previous click', () => {
    const onPageChange = vi.fn()
    const page1 = { ...basePagination, number: 1, first: false }
    render(<PaginationControls pagination={page1} loading={false} onPageChange={onPageChange} pageSize={10} onPageSizeChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Previous'))
    expect(onPageChange).toHaveBeenCalledWith(0)
  })

  it('disables buttons when loading', () => {
    const middlePage = { ...basePagination, number: 1, first: false }
    render(<PaginationControls pagination={middlePage} loading={true} onPageChange={vi.fn()} pageSize={10} onPageSizeChange={vi.fn()} />)
    expect(screen.getByText('Previous').closest('button')).toBeDisabled()
    expect(screen.getByText('Next').closest('button')).toBeDisabled()
  })
})
