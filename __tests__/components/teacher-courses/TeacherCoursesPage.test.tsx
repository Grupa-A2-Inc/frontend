import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (s: unknown) => unknown) =>
    selector({ courses: { courses: [], loading: false, error: null }, auth: { accessToken: 'tok' } }),
}))

vi.mock('@/store/slices/coursesSlice', () => ({
  fetchCourses: vi.fn(() => ({ type: 'courses/fetchCourses' })),
}))

import TeacherCoursesPage from '@/components/teacher-courses/TeacherCoursesPage'

describe('TeacherCoursesPage', () => {
  it('renders My courses heading', () => {
    render(<TeacherCoursesPage />)
    expect(screen.getByRole('heading', { name: 'My courses' })).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<TeacherCoursesPage />)
    expect(screen.getByPlaceholderText('Search courses...')).toBeInTheDocument()
  })

  it('renders status filter buttons', () => {
    render(<TeacherCoursesPage />)
    expect(screen.getAllByText('All').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Published').length).toBeGreaterThan(0)
  })
})
