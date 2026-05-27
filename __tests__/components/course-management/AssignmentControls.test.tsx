import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockSelector = vi.fn()

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (s: unknown) => unknown) => mockSelector(selector),
}))

vi.mock('@/store/slices/courseManagementSlice', () => ({
  assignCourse: vi.fn(() => ({ type: 'assign' })),
  clearAssignState: vi.fn(() => ({ type: 'clear' })),
}))

import AssignmentControls from '@/components/course-management/AssignmentControls'

function makeState(overrides = {}) {
  return {
    classrooms: [{ id: 'cl1', name: 'Class A', description: '' }],
    loadingClassrooms: false,
    classroomsError: null,
    assigning: false,
    assignError: null,
    assignSuccess: false,
    ...overrides,
  }
}

beforeEach(() => {
  mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({ courseManagement: makeState() })
  )
})

describe('AssignmentControls', () => {
  it('renders Assignment controls heading', () => {
    render(<AssignmentControls courseId="c1" />)
    expect(screen.getByText('Assignment controls')).toBeInTheDocument()
  })

  it('renders classroom in select dropdown', () => {
    render(<AssignmentControls courseId="c1" />)
    expect(screen.getByRole('option', { name: 'Class A' })).toBeInTheDocument()
  })

  it('renders Assign course button', () => {
    render(<AssignmentControls courseId="c1" />)
    expect(screen.getByRole('button', { name: /assign course/i })).toBeInTheDocument()
  })

  it('disables Assign button when no classroom selected', () => {
    render(<AssignmentControls courseId="c1" />)
    expect(screen.getByRole('button', { name: /assign course/i })).toBeDisabled()
  })

  it('enables Assign button when classroom is selected', () => {
    render(<AssignmentControls courseId="c1" />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'cl1' } })
    expect(screen.getByRole('button', { name: /assign course/i })).not.toBeDisabled()
  })

  it('shows classroomsError when present', () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({ courseManagement: makeState({ classroomsError: 'Load failed' }) })
    )
    render(<AssignmentControls courseId="c1" />)
    expect(screen.getByText('Load failed')).toBeInTheDocument()
  })

  it('shows success message when assignSuccess is true', () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({ courseManagement: makeState({ assignSuccess: true }) })
    )
    render(<AssignmentControls courseId="c1" />)
    expect(screen.getByText('The course has been successfully assigned.')).toBeInTheDocument()
  })

  it('shows assignError when present', () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({ courseManagement: makeState({ assignError: 'Assign failed' }) })
    )
    render(<AssignmentControls courseId="c1" />)
    expect(screen.getByText('Assign failed')).toBeInTheDocument()
  })
})
