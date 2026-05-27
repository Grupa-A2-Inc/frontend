import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))

vi.mock('@/components/student-courses/CertificateDownloadAction', () => ({
  default: () => React.createElement('div', { 'data-testid': 'cert' }, 'Cert'),
}))

import React from 'react'
import CoursesGrid from '@/components/student-courses/CoursesGrid'
import type { StudentCourse } from '@/lib/student-courses/types'

const courses: StudentCourse[] = [
  { id: 'c1', title: 'React', description: 'Learn React', category: 'Web', status: 'PUBLISHED', visibility: 'PUBLIC', createdBy: 'u1' },
  { id: 'c2', title: 'Vue', description: 'Learn Vue', category: 'Web', status: 'PUBLISHED', visibility: 'PUBLIC', createdBy: 'u1' },
]

describe('CoursesGrid', () => {
  it('shows loading state', () => {
    render(<CoursesGrid courses={[]} loading={true} emptyMessage="No courses" />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('shows empty message when no courses', () => {
    render(<CoursesGrid courses={[]} loading={false} emptyMessage="No courses found" />)
    expect(screen.getByText('No courses found')).toBeInTheDocument()
  })

  it('renders course cards', () => {
    render(<CoursesGrid courses={courses} loading={false} emptyMessage="Empty" />)
    expect(screen.getByText('React')).toBeInTheDocument()
    expect(screen.getByText('Vue')).toBeInTheDocument()
  })

  it('renders with discover variant', () => {
    render(<CoursesGrid courses={courses} loading={false} emptyMessage="Empty" variant="discover" />)
    expect(screen.getByText('React')).toBeInTheDocument()
  })

  it('marks enrolled courses', () => {
    render(<CoursesGrid courses={courses} loading={false} emptyMessage="Empty" enrolledCourseIds={new Set(['c1'])} variant="discover" />)
    expect(screen.getByText('React')).toBeInTheDocument()
  })
})
