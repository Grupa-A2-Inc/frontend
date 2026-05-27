import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href }, children),
}))

import React from 'react'
import LessonSidebar from '@/components/course-content/LessonSidebar'

const chapters = [
  {
    id: 'ch1',
    title: 'Chapter 1',
    lessons: [
      { id: 'l1', title: 'Lesson One' },
      { id: 'l2', title: 'Lesson Two' },
    ],
  },
]

describe('LessonSidebar', () => {
  it('renders Course Content heading', () => {
    render(<LessonSidebar chapters={chapters} courseId="c1" activeLessonId="l1" />)
    expect(screen.getByText('Course Content')).toBeInTheDocument()
  })

  it('renders chapter title', () => {
    render(<LessonSidebar chapters={chapters} courseId="c1" activeLessonId="l1" />)
    expect(screen.getByText('Chapter 1')).toBeInTheDocument()
  })

  it('renders lesson links', () => {
    render(<LessonSidebar chapters={chapters} courseId="c1" activeLessonId="l1" />)
    expect(screen.getByText(/Lesson One/)).toBeInTheDocument()
    expect(screen.getByText(/Lesson Two/)).toBeInTheDocument()
  })

  it('lesson links point to correct href', () => {
    render(<LessonSidebar chapters={chapters} courseId="c1" activeLessonId="l1" />)
    const links = screen.getAllByRole('link')
    expect(links[0]).toHaveAttribute('href', '/dashboard/student/courses/c1/lessons/l1')
    expect(links[1]).toHaveAttribute('href', '/dashboard/student/courses/c1/lessons/l2')
  })

  it('shows lesson number prefix', () => {
    render(<LessonSidebar chapters={chapters} courseId="c1" activeLessonId="l1" />)
    expect(screen.getByText(/1\. Lesson One/)).toBeInTheDocument()
    expect(screen.getByText(/2\. Lesson Two/)).toBeInTheDocument()
  })
})
