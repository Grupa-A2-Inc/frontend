import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}))
vi.mock('@/components/student-courses/CertificateDownloadAction', () => ({
  default: () => <div data-testid="certificate-action">Certificate</div>,
}))

import CourseCard from '@/components/student-courses/CourseCard'
import type { StudentCourse } from '@/lib/student-courses/types'

const baseCourse: StudentCourse = {
  id: 'c1',
  title: 'React Fundamentals',
  description: 'Learn React from scratch',
  category: 'Web',
  status: 'PUBLISHED',
  visibility: 'PUBLIC',
  createdBy: 'teacher1',
}

describe('CourseCard', () => {
  it('renders course title and description', () => {
    render(<CourseCard course={baseCourse} />)
    expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
    expect(screen.getByText('Learn React from scratch')).toBeInTheDocument()
  })

  it('renders category', () => {
    render(<CourseCard course={baseCourse} />)
    expect(screen.getAllByText('Web').length).toBeGreaterThan(0)
  })

  it('shows View arrow for "my" variant', () => {
    render(<CourseCard course={baseCourse} variant="my" />)
    expect(screen.getByText('View →')).toBeInTheDocument()
  })

  it('shows enroll button for "discover" variant', () => {
    render(<CourseCard course={baseCourse} variant="discover" />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('renders progress bar when progressPercent is provided', () => {
    render(<CourseCard course={{ ...baseCourse, progressPercent: 50 }} />)
    expect(screen.getByText('Progress')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
  })

  it('calls onEnroll when enroll button is clicked for discover variant', () => {
    const onEnroll = vi.fn()
    render(<CourseCard course={baseCourse} variant="discover" isEnrolled={false} onEnroll={onEnroll} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onEnroll).toHaveBeenCalledWith('c1')
  })

  it('disables enroll button when isEnrolled is true', () => {
    render(<CourseCard course={baseCourse} variant="discover" isEnrolled={true} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows "Enrolled" status label when enrolled', () => {
    render(<CourseCard course={baseCourse} variant="discover" isEnrolled={true} />)
    expect(screen.getAllByText('Enrolled').length).toBeGreaterThan(0)
  })

  it('shows certificate action for completed courses in my variant', () => {
    const completedCourse = { ...baseCourse, progressPercent: 100, enrollmentId: 'e1' }
    render(<CourseCard course={completedCourse} variant="my" token="tok" />)
    expect(screen.getByTestId('certificate-action')).toBeInTheDocument()
  })

  it('renders course card for my variant without crash', () => {
    render(<CourseCard course={baseCourse} variant="my" />)
    expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
  })

  it('shows Web emoji for Web category', () => {
    render(<CourseCard course={baseCourse} />)
    expect(screen.getByText('🌐')).toBeInTheDocument()
  })

  it('shows fallback emoji for unknown category', () => {
    render(<CourseCard course={{ ...baseCourse, category: 'Unknown' }} />)
    expect(screen.getByText('📚')).toBeInTheDocument()
  })
})
