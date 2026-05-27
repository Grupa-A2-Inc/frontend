import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/lib/courses/api', () => ({
  fetchClassrooms: vi.fn(),
  assignCourseToClassroom: vi.fn(),
}))

import { fetchClassrooms, assignCourseToClassroom } from '@/lib/courses/api'
import AssignStudentsModal from '@/components/course-management/AssignStudentsModal'

const mockFetch = vi.mocked(fetchClassrooms)
const mockAssign = vi.mocked(assignCourseToClassroom)

const classrooms = [
  { id: 'cl1', name: 'Class Alpha', description: 'First class' },
  { id: 'cl2', name: 'Class Beta', description: 'Second class' },
]

describe('AssignStudentsModal', () => {
  it('shows loading initially', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<AssignStudentsModal courseId="c1" onChanged={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByText(/loading classrooms/i)).toBeInTheDocument()
  })

  it('renders classroom list after loading', async () => {
    mockFetch.mockResolvedValue(classrooms)
    render(<AssignStudentsModal courseId="c1" onChanged={vi.fn()} onClose={vi.fn()} />)
    expect(await screen.findByText('Class Alpha')).toBeInTheDocument()
    expect(screen.getByText('Class Beta')).toBeInTheDocument()
  })

  it('shows empty state when no classrooms', async () => {
    mockFetch.mockResolvedValue([])
    render(<AssignStudentsModal courseId="c1" onChanged={vi.fn()} onClose={vi.fn()} />)
    expect(await screen.findByText('No classrooms found.')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    mockFetch.mockResolvedValue([])
    const onClose = vi.fn()
    render(<AssignStudentsModal courseId="c1" onChanged={vi.fn()} onClose={onClose} />)
    fireEvent.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders search input', () => {
    mockFetch.mockReturnValue(new Promise(() => {}))
    render(<AssignStudentsModal courseId="c1" onChanged={vi.fn()} onClose={vi.fn()} />)
    expect(screen.getByPlaceholderText('Search classrooms...')).toBeInTheDocument()
  })

  it('filters classrooms by search query', async () => {
    mockFetch.mockResolvedValue(classrooms)
    render(<AssignStudentsModal courseId="c1" onChanged={vi.fn()} onClose={vi.fn()} />)
    await screen.findByText('Class Alpha')
    fireEvent.change(screen.getByPlaceholderText('Search classrooms...'), { target: { value: 'Alpha' } })
    expect(screen.getByText('Class Alpha')).toBeInTheDocument()
    expect(screen.queryByText('Class Beta')).not.toBeInTheDocument()
  })

  it('shows error on fetch failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    render(<AssignStudentsModal courseId="c1" onChanged={vi.fn()} onClose={vi.fn()} />)
    expect(await screen.findByText('Network error')).toBeInTheDocument()
  })

  it('calls onChanged after successful assignment', async () => {
    mockFetch.mockResolvedValue(classrooms)
    mockAssign.mockResolvedValue(undefined)
    const onChanged = vi.fn()
    render(<AssignStudentsModal courseId="c1" onChanged={onChanged} onClose={vi.fn()} />)
    await screen.findByText('Class Alpha')
    fireEvent.click(screen.getAllByRole('button', { name: /assign course/i })[0])
    await screen.findByText('Assigned')
    expect(onChanged).toHaveBeenCalled()
  })
})
