import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockDispatch = vi.fn(() => Promise.resolve({ type: 'test' }))
const mockSelector = vi.fn()

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => mockSelector(selector),
}))

vi.mock('@/store/slices/studentCoursesSlice', () => ({
  enrollInCourseThunk: vi.fn(() => ({ type: 'courses/enroll' })),
  fetchMyCoursesThunk: vi.fn(() => ({ type: 'courses/fetchMy' })),
  fetchPublicCoursesThunk: vi.fn(() => ({ type: 'courses/fetchPublic' })),
}))

vi.mock('@/components/student-courses/Header', () => ({
  default: ({ totalCourses }: { totalCourses: number }) =>
    React.createElement('div', { 'data-testid': 'courses-header' }, `Total: ${totalCourses}`),
}))

vi.mock('@/components/student-courses/Tabs', () => ({
  default: ({ activeTab, onTabChange }: { activeTab: string; onTabChange: (t: string) => void }) =>
    React.createElement('div', null,
      React.createElement('button', { onClick: () => onTabChange('my') }, 'My Courses'),
      React.createElement('button', { onClick: () => onTabChange('discover') }, 'Discover'),
    ),
}))

vi.mock('@/components/student-courses/SearchBar', () => ({
  default: ({ search, onSearchChange }: { search: string; onSearchChange: (v: string) => void; category: string; onCategoryChange: (v: string) => void; categories: string[] }) =>
    React.createElement('input', { 'data-testid': 'search', value: search, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value) }),
}))

vi.mock('@/components/student-courses/CoursesGrid', () => ({
  default: ({ courses, loading, emptyMessage }: { courses: unknown[]; loading: boolean; emptyMessage: string; variant?: string; enrolledCourseIds?: Set<string>; enrollingCourseId?: string | null; onEnroll?: (id: string) => void; token?: string }) =>
    loading
      ? React.createElement('div', null, 'Loading...')
      : courses.length === 0
        ? React.createElement('div', null, emptyMessage)
        : React.createElement('div', { 'data-testid': 'courses-grid' }, `${courses.length} courses`),
}))

vi.mock('@/components/student-courses/PaginationControls', () => ({
  default: ({ onPageChange, onPageSizeChange }: { pagination: unknown; loading: boolean; onPageChange: (p: number) => void; pageSize: number; onPageSizeChange: (s: number) => void }) =>
    React.createElement('div', null,
      React.createElement('button', { onClick: () => onPageChange(1) }, 'Page 2'),
      React.createElement('button', { onClick: () => onPageSizeChange(20) }, 'Size 20'),
    ),
}))

import React from 'react'
import StudentCoursesPage from '@/components/student-courses/StudentCoursesPage'

const defaultPagination = { totalElements: 2, totalPages: 1, number: 0, size: 10, first: true, last: true }

const myCourses = [
  { id: 'c1', title: 'React', description: '', category: 'Web', status: 'PUBLISHED', visibility: 'PUBLIC', createdBy: 'u1' },
]
const publicCourses = [
  { id: 'c2', title: 'Vue', description: '', category: 'Web', status: 'PUBLISHED', visibility: 'PUBLIC', createdBy: 'u1' },
  { id: 'c3', title: 'Angular', description: '', category: 'Web', status: 'PUBLISHED', visibility: 'PUBLIC', createdBy: 'u1' },
]

function setup(overrides = {}) {
  mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({
      studentCourses: {
        myCourses,
        publicCourses,
        myPagination: defaultPagination,
        publicPagination: { ...defaultPagination, totalElements: 2 },
        isLoadingMy: false,
        isLoadingPublic: false,
        enrollingCourseId: null,
        error: null,
        ...overrides,
      },
      auth: { accessToken: 'tok' },
    })
  )
}

describe('StudentCoursesPage', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
  })

  it('renders header with total courses', () => {
    setup()
    render(<StudentCoursesPage />)
    expect(screen.getByTestId('courses-header')).toBeInTheDocument()
  })

  it('renders courses grid with my courses by default', () => {
    setup()
    render(<StudentCoursesPage />)
    expect(screen.getByTestId('courses-grid')).toBeInTheDocument()
    expect(screen.getByText('1 courses')).toBeInTheDocument()
  })

  it('switches to discover tab', () => {
    setup()
    render(<StudentCoursesPage />)
    fireEvent.click(screen.getByText('Discover'))
    expect(screen.getByText('2 courses')).toBeInTheDocument()
  })

  it('shows error message when error present', () => {
    setup({ error: 'Failed to load' })
    render(<StudentCoursesPage />)
    expect(screen.getByText('Failed to load')).toBeInTheDocument()
  })

  it('shows loading state when loading', () => {
    setup({ isLoadingMy: true })
    render(<StudentCoursesPage />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('dispatches fetchMyCoursesThunk on mount', () => {
    setup()
    render(<StudentCoursesPage />)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('shows empty message when no my courses', () => {
    setup({ myCourses: [] })
    render(<StudentCoursesPage />)
    expect(screen.getByText('You have no courses yet.')).toBeInTheDocument()
  })

  it('shows discover empty message when no public courses', () => {
    setup({ publicCourses: [] })
    render(<StudentCoursesPage />)
    fireEvent.click(screen.getByText('Discover'))
    expect(screen.getByText('No public courses found.')).toBeInTheDocument()
  })

  it('renders search input', () => {
    setup()
    render(<StudentCoursesPage />)
    expect(screen.getByTestId('search')).toBeInTheDocument()
  })

  it('filters by search text', () => {
    setup()
    render(<StudentCoursesPage />)
    const search = screen.getByTestId('search')
    fireEvent.change(search, { target: { value: 'xyz' } })
    expect(screen.getByText('You have no courses yet.')).toBeInTheDocument()
  })
})
