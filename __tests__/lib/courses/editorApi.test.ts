import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createCourse,
  updateCourse,
  fetchCourseForEditor,
  createChapter,
  updateChapter,
  deleteChapter,
  createLesson,
  updateLesson,
  deleteLesson,
  createResource,
  updateResource,
  deleteResource,
} from '@/lib/courses/editorApi'

vi.mock('@/lib/fetchWithAuth', () => ({ fetchWithAuth: vi.fn() }))
import { fetchWithAuth } from '@/lib/fetchWithAuth'
const mockFetch = fetchWithAuth as ReturnType<typeof vi.fn>

function okRes(body: unknown, status = 200) {
  return { ok: true, status, json: () => Promise.resolve(body) } as unknown as Response
}
function noContentRes() {
  return { ok: true, status: 204, json: () => Promise.resolve(null) } as unknown as Response
}
function errRes(status: number) {
  return { ok: false, status, json: () => Promise.resolve({ message: `Error ${status}` }) } as unknown as Response
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  localStorage.setItem('accessToken', 'tok')
})

const courseDto = { id: 'c1', title: 'Course', description: 'D', category: 'Web', status: 'DRAFT', chapters: [] }

describe('createCourse', () => {
  it('posts and returns course', async () => {
    mockFetch.mockResolvedValueOnce(okRes(courseDto))
    const result = await createCourse({ title: 'Course', description: 'D', category: 'Web', status: 'DRAFT', chapters: [] })
    expect(result.id).toBe('c1')
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(400))
    await expect(createCourse({ title: 'Course', description: 'D', category: 'Web', status: 'DRAFT', chapters: [] })).rejects.toThrow()
  })
})

describe('updateCourse', () => {
  it('sends PUT and resolves', async () => {
    mockFetch.mockResolvedValueOnce(noContentRes())
    await expect(updateCourse('c1', { title: 'Updated', description: 'D', category: 'Web', status: 'DRAFT' })).resolves.not.toThrow()
  })
})

describe('fetchCourseForEditor', () => {
  it('returns merged course with category', async () => {
    // fullView call
    mockFetch.mockResolvedValueOnce(okRes({ ...courseDto, category: 'Web' }))
    // fetchCourseSummaryForEditor -> myCourses
    mockFetch.mockResolvedValueOnce(okRes([{ id: 'c1', category: 'Web' }]))
    const result = await fetchCourseForEditor('c1')
    expect(result.id).toBe('c1')
  })

  it('falls back to summary category when fullView category is empty', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ ...courseDto, category: null }))
    mockFetch.mockResolvedValueOnce(okRes([{ id: 'c1', category: 'Science' }]))
    const result = await fetchCourseForEditor('c1')
    expect(result.category).toBe('Science')
  })
})

describe('createChapter', () => {
  it('posts and returns chapter id', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ id: 'ch1' }))
    const result = await createChapter('c1', 'Chapter 1')
    expect(result.id).toBe('ch1')
  })
})

describe('updateChapter', () => {
  it('patches chapter', async () => {
    mockFetch.mockResolvedValueOnce(noContentRes())
    await expect(updateChapter('ch1', { title: 'Updated' })).resolves.not.toThrow()
  })
})

describe('deleteChapter', () => {
  it('deletes chapter', async () => {
    mockFetch.mockResolvedValueOnce(noContentRes())
    await expect(deleteChapter('ch1')).resolves.not.toThrow()
  })
})

describe('createLesson', () => {
  it('posts and returns lesson id', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ id: 'l1' }))
    const result = await createLesson('ch1', { title: 'Lesson 1' })
    expect(result.id).toBe('l1')
  })
})

describe('updateLesson', () => {
  it('patches lesson metadata', async () => {
    mockFetch.mockResolvedValueOnce(noContentRes())
    await expect(updateLesson('l1', { title: 'Updated' })).resolves.not.toThrow()
  })

  it('patches lesson content', async () => {
    mockFetch.mockResolvedValueOnce(noContentRes())
    await expect(updateLesson('l1', { contentMarkdown: '# Hello' })).resolves.not.toThrow()
  })

  it('patches both title and content', async () => {
    mockFetch.mockResolvedValueOnce(noContentRes())
    mockFetch.mockResolvedValueOnce(noContentRes())
    await expect(updateLesson('l1', { title: 'Updated', contentMarkdown: '# Hello' })).resolves.not.toThrow()
  })
})

describe('deleteLesson', () => {
  it('deletes lesson', async () => {
    mockFetch.mockResolvedValueOnce(noContentRes())
    await expect(deleteLesson('l1')).resolves.not.toThrow()
  })
})

describe('createResource', () => {
  it('posts and returns resource id', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ id: 'r1' }))
    const result = await createResource('l1', { title: 'PDF', url: 'http://example.com/a.pdf' })
    expect(result.id).toBe('r1')
  })
})

describe('updateResource', () => {
  it('patches resource', async () => {
    mockFetch.mockResolvedValueOnce(noContentRes())
    await expect(updateResource('l1', 'r1', { title: 'Updated PDF', url: 'http://example.com/b.pdf' })).resolves.not.toThrow()
  })
})

describe('deleteResource', () => {
  it('deletes resource', async () => {
    mockFetch.mockResolvedValueOnce(noContentRes())
    await expect(deleteResource('l1', 'r1')).resolves.not.toThrow()
  })
})
