import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CoursesHeader from '@/components/teacher-courses/CoursesHeader'

describe('CoursesHeader', () => {
  it('renders "My courses" heading', () => {
    render(<CoursesHeader totalCourses={5} onCreateCourse={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'My courses' })).toBeInTheDocument()
  })

  it('shows correct count for multiple courses', () => {
    render(<CoursesHeader totalCourses={10} onCreateCourse={vi.fn()} />)
    expect(screen.getByText('10 courses')).toBeInTheDocument()
  })

  it('shows singular for one course', () => {
    render(<CoursesHeader totalCourses={1} onCreateCourse={vi.fn()} />)
    expect(screen.getByText('1 course')).toBeInTheDocument()
  })

  it('shows Create course button', () => {
    render(<CoursesHeader totalCourses={0} onCreateCourse={vi.fn()} />)
    expect(screen.getByRole('button', { name: /create course/i })).toBeInTheDocument()
  })

  it('calls onCreateCourse when button is clicked', () => {
    const onCreateCourse = vi.fn()
    render(<CoursesHeader totalCourses={0} onCreateCourse={onCreateCourse} />)
    fireEvent.click(screen.getByRole('button', { name: /create course/i }))
    expect(onCreateCourse).toHaveBeenCalled()
  })
})
