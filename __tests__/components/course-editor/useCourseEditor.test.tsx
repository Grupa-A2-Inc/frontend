import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

import { useCourseEditor } from '@/components/course-editor/useCourseEditor'

const { push, createLesson, updateLesson, fetchCourseForEditor } = vi.hoisted(() => ({
  push: vi.fn(),
  createLesson: vi.fn(),
  updateLesson: vi.fn(),
  fetchCourseForEditor: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: push, prefetch: vi.fn() }),
}))

vi.mock('@/lib/courses/editorApi', () => ({
  createChapter: vi.fn(),
  createCourse: vi.fn(),
  createLesson,
  createResource: vi.fn(),
  deleteChapter: vi.fn(),
  deleteLesson: vi.fn(),
  deleteResource: vi.fn(),
  fetchCourseForEditor,
  updateChapter: vi.fn(),
  updateCourse: vi.fn(),
  updateLesson,
  updateResource: vi.fn(),
}))

describe('useCourseEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not send a metadata reorder request right after creating a lesson', async () => {
    fetchCourseForEditor.mockResolvedValue({
      id: 'course-1',
      title: 'Course',
      description: 'Desc',
      category: 'Cat',
      status: 'DRAFT',
      chapters: [
        {
          id: 'chapter-1',
          title: 'Chapter 1',
          orderIndex: 1,
          lessons: [],
        },
      ],
    })
    createLesson.mockResolvedValue({ id: 'lesson-1' })

    const { result } = renderHook(() => useCourseEditor({ mode: 'edit', courseId: 'course-1' }))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
      expect(result.current.chapters).toHaveLength(1)
    })

    act(() => {
      result.current.openAddLesson('chapter-1')
      result.current.setAddForm({
        title: 'Lesson 1',
        contentMarkdown: '# Hello',
        url: '',
      })
    })

    await act(async () => {
      await result.current.handleAddEntity()
    })

    expect(createLesson).toHaveBeenCalledWith('chapter-1', {
      title: 'Lesson 1',
      contentMarkdown: '# Hello',
    })
    expect(updateLesson).not.toHaveBeenCalled()
    expect(result.current.chapters[0]?.lessons).toHaveLength(1)
    expect(result.current.chapters[0]?.lessons[0]?.orderIndex).toBe(0)
  })
})
