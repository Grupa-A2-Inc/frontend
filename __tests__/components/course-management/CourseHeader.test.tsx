import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/courses/api', () => ({
  fetchCourseFullView: vi.fn(),
  fetchTestsForLessons: vi.fn(),
}))

import { fetchCourseFullView, fetchTestsForLessons } from '@/lib/courses/api'
import CourseHeader from '@/components/course-management/CourseHeader'

const mockFetchCourseFullView = vi.mocked(fetchCourseFullView)
const mockFetchTestsForLessons = vi.mocked(fetchTestsForLessons)

describe('CourseHeader', () => {
  it('shows loading state initially', () => {
    mockFetchCourseFullView.mockReturnValue(new Promise(() => {}))
    render(<CourseHeader courseId="c1" />)
    expect(screen.getByText('Loading course details...')).toBeInTheDocument()
  })

  it('shows error state on failure', async () => {
    mockFetchCourseFullView.mockRejectedValue(new Error('Network error'))
    render(<CourseHeader courseId="c1" />)
    expect(await screen.findByText('Network error')).toBeInTheDocument()
  })

  it('renders course title after loading', async () => {
    mockFetchCourseFullView.mockResolvedValue({
      course: { id: 'c1', title: 'React Basics', description: 'Learn React', category: 'Web', status: 'PUBLISHED', visibility: 'PUBLIC' },
      chapters: [{ id: 'ch1', title: 'Ch1', orderIndex: 0, lessons: [{ id: 'l1', title: 'L1', contentMarkdown: '', orderIndex: 0, testId: 'tst1', resources: [] }] }],
    })
    mockFetchTestsForLessons.mockResolvedValue([{ id: 'tst1', title: 'Test 1', lessonId: 'l1', questions: [], timeLimit: 0, passingScore: 0 }])
    render(<CourseHeader courseId="c1" />)
    expect(await screen.findByText('React Basics')).toBeInTheDocument()
  })

  it('shows stats after loading', async () => {
    mockFetchCourseFullView.mockResolvedValue({
      course: { id: 'c1', title: 'Course', description: '', category: 'Web', status: 'PUBLISHED', visibility: 'PUBLIC' },
      chapters: [{ id: 'ch1', title: 'Ch1', orderIndex: 0, lessons: [{ id: 'l1', title: 'L1', contentMarkdown: '', orderIndex: 0, resources: [] }] }],
    })
    mockFetchTestsForLessons.mockResolvedValue([])
    render(<CourseHeader courseId="c1" />)
    expect(await screen.findByText('Chapters')).toBeInTheDocument()
    expect(screen.getByText('Lessons')).toBeInTheDocument()
  })
})
