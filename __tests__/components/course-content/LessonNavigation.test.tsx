import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href }, children),
}))

import React from 'react'
import LessonNavigation from '@/components/course-content/LessonNavigation'

describe('LessonNavigation', () => {
  it('renders Previous and Next Lesson text', () => {
    render(<LessonNavigation courseId="c1" />)
    expect(screen.getByText('Previous Lesson')).toBeInTheDocument()
    expect(screen.getByText('Next Lesson')).toBeInTheDocument()
  })

  it('renders previous link when previousLessonId provided', () => {
    render(<LessonNavigation courseId="c1" previousLessonId="l0" />)
    const link = screen.getByRole('link', { name: /previous lesson/i })
    expect(link).toHaveAttribute('href', '/dashboard/student/courses/c1/lessons/l0')
  })

  it('renders next link when nextLessonId provided', () => {
    render(<LessonNavigation courseId="c1" nextLessonId="l2" />)
    const link = screen.getByRole('link', { name: /next lesson/i })
    expect(link).toHaveAttribute('href', '/dashboard/student/courses/c1/lessons/l2')
  })

  it('does not render prev link when no previousLessonId', () => {
    render(<LessonNavigation courseId="c1" />)
    const links = screen.queryAllByRole('link')
    const prevLink = links.find(l => l.getAttribute('href')?.includes('lessons'))
    expect(prevLink).toBeUndefined()
  })

  it('does not render next link when no nextLessonId', () => {
    render(<LessonNavigation courseId="c1" />)
    expect(screen.queryAllByRole('link')).toHaveLength(0)
  })
})
