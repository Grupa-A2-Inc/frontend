import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import UsersPagination from '@/components/user-management/UsersPagination'
import type { UsersPaginationMeta } from '@/store/slices/usersSlice'

const basePagination: UsersPaginationMeta = {
  number: 0,
  totalPages: 3,
  totalElements: 25,
  size: 10,
  numberOfElements: 10,
  first: true,
  last: false,
  empty: false,
}

describe('UsersPagination', () => {
  it('renders Previous and Next buttons', () => {
    render(<UsersPagination pagination={basePagination} loading={false} pageSize={10} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} />)
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Next')).toBeInTheDocument()
  })

  it('shows page info', () => {
    render(<UsersPagination pagination={basePagination} loading={false} pageSize={10} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} />)
    expect(screen.getByText('Page 1 / 3')).toBeInTheDocument()
  })

  it('disables Previous on first page', () => {
    render(<UsersPagination pagination={basePagination} loading={false} pageSize={10} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} />)
    expect(screen.getByText('Previous').closest('button')).toBeDisabled()
  })

  it('disables Next on last page', () => {
    const lastPage = { ...basePagination, number: 2, first: false, last: true }
    render(<UsersPagination pagination={lastPage} loading={false} pageSize={10} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} />)
    expect(screen.getByText('Next').closest('button')).toBeDisabled()
  })

  it('calls onPageChange with next page', () => {
    const onPageChange = vi.fn()
    render(<UsersPagination pagination={basePagination} loading={false} pageSize={10} onPageChange={onPageChange} onPageSizeChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Next'))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('calls onPageChange with prev page', () => {
    const onPageChange = vi.fn()
    const page1 = { ...basePagination, number: 1, first: false }
    render(<UsersPagination pagination={page1} loading={false} pageSize={10} onPageChange={onPageChange} onPageSizeChange={vi.fn()} />)
    fireEvent.click(screen.getByText('Previous'))
    expect(onPageChange).toHaveBeenCalledWith(0)
  })

  it('disables buttons when loading', () => {
    const middlePage = { ...basePagination, number: 1, first: false }
    render(<UsersPagination pagination={middlePage} loading={true} pageSize={10} onPageChange={vi.fn()} onPageSizeChange={vi.fn()} />)
    expect(screen.getByText('Previous').closest('button')).toBeDisabled()
    expect(screen.getByText('Next').closest('button')).toBeDisabled()
  })
})
