import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href }, children),
}))

vi.mock('@/lib/courses/api', () => ({
  fetchCourseFullView: vi.fn(),
  fetchTestsForLessons: vi.fn(),
}))

import React from 'react'
import { fetchCourseFullView, fetchTestsForLessons } from '@/lib/courses/api'
import ContentTree from '@/components/course-management/ContentTree'

const mockFetchCourse = vi.mocked(fetchCourseFullView)
const mockFetchTests = vi.mocked(fetchTestsForLessons)

const chapters = [
  {
    id: 'ch1', title: 'Chapter One', orderIndex: 0,
    lessons: [
      { id: 'l1', title: 'Lesson One', contentMarkdown: '', orderIndex: 0, lessonResources: [], testId: undefined },
      { id: 'l2', title: 'Lesson Two', contentMarkdown: '', orderIndex: 1, lessonResources: [] },
    ],
  },
  {
    id: 'ch2', title: 'Chapter Two', orderIndex: 1,
    lessons: [],
  },
]

describe('course-management ContentTree', () => {
  it('shows loading state initially', () => {
    mockFetchCourse.mockReturnValue(new Promise(() => {}))
    render(<ContentTree courseId="c1" />)
    expect(document.querySelector('.animate-pulse, .animate-spin') || screen.queryByText(/loading/i)).toBeTruthy()
  })

  it('shows error on fetch failure', async () => {
    mockFetchCourse.mockRejectedValue(new Error('Fetch failed'))
    render(<ContentTree courseId="c1" />)
    expect(await screen.findByText('Fetch failed')).toBeInTheDocument()
  })

  it('renders chapter titles after loading', async () => {
    mockFetchCourse.mockResolvedValue({ course: { id: 'c1', title: 'Course', description: '', category: '', status: 'PUBLISHED', visibility: 'PUBLIC' }, chapters })
    mockFetchTests.mockResolvedValue([])
    render(<ContentTree courseId="c1" />)
    expect(await screen.findByText('Chapter One')).toBeInTheDocument()
    expect(screen.getByText('Chapter Two')).toBeInTheDocument()
  })

  it('expands chapter to show lessons on click', async () => {
    mockFetchCourse.mockResolvedValue({ course: { id: 'c1', title: 'Course', description: '', category: '', status: 'PUBLISHED', visibility: 'PUBLIC' }, chapters })
    mockFetchTests.mockResolvedValue([])
    render(<ContentTree courseId="c1" />)
    await screen.findByText('Chapter One')
    fireEvent.click(screen.getByText('Chapter One'))
    expect(await screen.findByText('Lesson One')).toBeInTheDocument()
  })

  it('renders with test icon for lesson with testId', async () => {
    const chaptersWithTest = [{
      ...chapters[0],
      lessons: [{ id: 'l1', title: 'L1', contentMarkdown: '', orderIndex: 0, lessonResources: [], testId: 'tst1' }],
    }]
    mockFetchCourse.mockResolvedValue({ course: { id: 'c1', title: '', description: '', category: '', status: 'PUBLISHED', visibility: 'PUBLIC' }, chapters: chaptersWithTest })
    mockFetchTests.mockResolvedValue([{ id: 'tst1', title: 'Test', lessonId: 'l1', questions: [], timeLimit: 0, passingScore: 0 }])
    render(<ContentTree courseId="c1" />)
    await screen.findByText('Chapter One')
    fireEvent.click(screen.getByText('Chapter One'))
    expect(await screen.findByText('L1')).toBeInTheDocument()
  })
})
