import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '@/components/student-courses/Header'

describe('Header', () => {
  it('renders Courses heading', () => {
    render(<Header totalCourses={5} />)
    expect(screen.getByRole('heading', { name: 'Courses' })).toBeInTheDocument()
  })

  it('shows plural "courses" for multiple', () => {
    render(<Header totalCourses={10} />)
    expect(screen.getByText(/10 courses available/)).toBeInTheDocument()
  })

  it('shows singular "course" for one', () => {
    render(<Header totalCourses={1} />)
    expect(screen.getByText(/1 course available/)).toBeInTheDocument()
  })

  it('shows 0 courses', () => {
    render(<Header totalCourses={0} />)
    expect(screen.getByText(/0 courses available/)).toBeInTheDocument()
  })
})
