import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockDispatch = vi.fn()
const mockSelector = vi.fn()

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => mockSelector(selector),
}))

vi.mock('@/store/slices/courseManagementSlice', () => ({
  setSearchQuery: vi.fn((q: string) => ({ type: 'cm/setSearch', payload: q })),
  setSortField: vi.fn((f: string) => ({ type: 'cm/setSortField', payload: f })),
  setSortDirection: vi.fn((d: string) => ({ type: 'cm/setSortDir', payload: d })),
}))

import StudentsByClass from '@/components/course-management/StudentsByClass'

const students = [
  { id: 's1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', progressPercent: 75, averageScore: 80, passedTests: 5, failedTests: 1 },
  { id: 's2', firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com', progressPercent: 50, averageScore: 60, passedTests: 3, failedTests: 2 },
]

const classGroups = [
  { classId: 'cls1', className: 'Class A', students },
  { classId: 'cls2', className: 'Class B', students: [] },
]

function setup(overrides = {}) {
  mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({
      courseManagement: {
        classWithStudents: classGroups,
        loadingStudents: false,
        studentsError: null,
        searchQuery: '',
        sortField: 'name',
        sortDirection: 'asc',
        ...overrides,
      },
    })
  )
}

describe('StudentsByClass', () => {
  it('shows loading skeleton when loading', () => {
    setup({ loadingStudents: true })
    render(<StudentsByClass />)
    expect(document.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('renders Students by class heading', () => {
    setup()
    render(<StudentsByClass />)
    expect(screen.getByText('Students by class')).toBeInTheDocument()
  })

  it('renders class names', () => {
    setup()
    render(<StudentsByClass />)
    expect(screen.getByText('Class A')).toBeInTheDocument()
  })

  it('renders student names', () => {
    setup()
    render(<StudentsByClass />)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })

  it('renders student emails', () => {
    setup()
    render(<StudentsByClass />)
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
  })

  it('renders progress percentages', () => {
    setup()
    render(<StudentsByClass />)
    expect(screen.getByText('75%')).toBeInTheDocument()
  })

  it('shows empty state when no groups match', () => {
    setup({ classWithStudents: [] })
    render(<StudentsByClass />)
    expect(screen.getByText('No students available for display.')).toBeInTheDocument()
  })

  it('shows error message when studentsError is set', () => {
    setup({ studentsError: 'Failed to load students' })
    render(<StudentsByClass />)
    expect(screen.getByText('Failed to load students')).toBeInTheDocument()
  })

  it('dispatches setSearchQuery when search input changes', () => {
    setup()
    render(<StudentsByClass />)
    const input = screen.getByPlaceholderText('Search student...')
    fireEvent.change(input, { target: { value: 'Alice' } })
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('dispatches setSortField when sort select changes', () => {
    setup()
    render(<StudentsByClass />)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[0], { target: { value: 'progressPercent' } })
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('dispatches setSortDirection when direction changes', () => {
    setup()
    render(<StudentsByClass />)
    const selects = screen.getAllByRole('combobox')
    fireEvent.change(selects[1], { target: { value: 'desc' } })
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('shows total students count', () => {
    setup()
    render(<StudentsByClass />)
    expect(screen.getByText(/2 students displayed in/)).toBeInTheDocument()
  })

  it('shows dash when progress is undefined', () => {
    const studentNoPct = [{ ...students[0], progressPercent: undefined }]
    setup({ classWithStudents: [{ classId: 'cls1', className: 'Class A', students: studentNoPct }] })
    render(<StudentsByClass />)
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })

  it('filters students by search query', () => {
    setup({ searchQuery: 'Alice', classWithStudents: classGroups })
    render(<StudentsByClass />)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument()
  })
})
