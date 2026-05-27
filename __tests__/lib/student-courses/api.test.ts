import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchPublicCourses, fetchMyCourses, enrollInCourse, unenrollFromCourse } from '@/lib/student-courses/api'

vi.mock('@/lib/fetchWithAuth', () => ({ fetchWithAuth: vi.fn() }))
import { fetchWithAuth } from '@/lib/fetchWithAuth'
const mockFetch = fetchWithAuth as ReturnType<typeof vi.fn>

function okRes(body: unknown, status = 200) {
  return { ok: true, status, json: () => Promise.resolve(body) } as unknown as Response
}
function errRes(status: number) {
  return { ok: false, status, json: () => Promise.resolve({ message: `Error ${status}` }) } as unknown as Response
}

beforeEach(() => vi.clearAllMocks())

const pageData = {
  content: [{ id: 'c1', title: 'Course 1', description: 'D', category: 'Web', status: 'PUBLISHED', visibility: 'PUBLIC', createdBy: 'teacher1' }],
  totalPages: 1, totalElements: 1, numberOfElements: 1, size: 10, number: 0, first: true, last: true, empty: false,
}

describe('fetchPublicCourses', () => {
  it('maps and returns paginated courses', async () => {
    mockFetch.mockResolvedValueOnce(okRes(pageData))
    const result = await fetchPublicCourses('tok')
    expect(result.content).toHaveLength(1)
    expect(result.content[0].id).toBe('c1')
  })

  it('throws on error response', async () => {
    mockFetch.mockResolvedValueOnce(errRes(401))
    await expect(fetchPublicCourses('tok')).rejects.toThrow()
  })

  it('filters out courses with empty id', async () => {
    const data = { ...pageData, content: [{ id: '', title: 'Bad', description: '', category: 'X', status: 'PUBLISHED', visibility: 'PUBLIC', createdBy: '' }] }
    mockFetch.mockResolvedValueOnce(okRes(data))
    const result = await fetchPublicCourses('tok')
    expect(result.content).toHaveLength(0)
  })
})

describe('fetchMyCourses', () => {
  it('maps enrolled courses', async () => {
    const enrolledData = {
      content: [{ enrollmentId: 'e1', courseId: 'c1', courseTitle: 'My Course', courseCategory: 'Web', enrolledAt: '2024-01-01', progressPercent: 50 }],
      totalPages: 1, totalElements: 1, numberOfElements: 1, size: 10, number: 0, first: true, last: true, empty: false,
    }
    mockFetch.mockResolvedValueOnce(okRes(enrolledData))
    const result = await fetchMyCourses('tok')
    expect(result.content[0].title).toBe('My Course')
    expect(result.content[0].progressPercent).toBe(50)
  })

  it('throws on error response', async () => {
    mockFetch.mockResolvedValueOnce(errRes(500))
    await expect(fetchMyCourses('tok')).rejects.toThrow()
  })
})

describe('enrollInCourse', () => {
  it('resolves on 200', async () => {
    mockFetch.mockResolvedValueOnce(okRes(null, 200))
    await expect(enrollInCourse('tok', 'c1')).resolves.not.toThrow()
  })

  it('resolves on 409 (already enrolled)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 409, json: () => Promise.resolve(null) } as unknown as Response)
    await expect(enrollInCourse('tok', 'c1')).resolves.not.toThrow()
  })

  it('throws on other error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(400))
    await expect(enrollInCourse('tok', 'c1')).rejects.toThrow()
  })
})

describe('unenrollFromCourse', () => {
  it('resolves on success', async () => {
    mockFetch.mockResolvedValueOnce(okRes(null, 200))
    await expect(unenrollFromCourse('tok', 'c1')).resolves.not.toThrow()
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(404))
    await expect(unenrollFromCourse('tok', 'c1')).rejects.toThrow()
  })
})

describe('fetchPublicCourses null-fallback branches', () => {
  it('uses fallback values when fields are missing', async () => {
    const sparseData = {
      content: [{ id: 'c1' }], // missing title, description, category, status, visibility, createdBy
    }
    mockFetch.mockResolvedValueOnce(okRes(sparseData))
    const result = await fetchPublicCourses('tok')
    expect(result.content[0].title).toBe('Untitled course')
    expect(result.content[0].category).toBe('Uncategorized')
  })

  it('uses fallback pagination values when fields are null', async () => {
    const sparseData = {
      content: [{ id: 'c2', title: 'X', description: '', category: 'C', status: 'PUBLISHED', visibility: 'PUBLIC', createdBy: '' }],
      // missing totalPages, totalElements, etc.
    }
    mockFetch.mockResolvedValueOnce(okRes(sparseData))
    const result = await fetchPublicCourses('tok')
    expect(result.totalPages).toBe(0)
    expect(result.first).toBe(true)
    expect(result.last).toBe(true)
  })
})

describe('fetchMyCourses null-fallback branches', () => {
  it('uses fallback values when enrolled course fields are missing', async () => {
    const sparseEnrolled = {
      content: [{ courseId: 'c1', enrollmentId: 'e1' }], // missing courseTitle, courseCategory, etc.
    }
    mockFetch.mockResolvedValueOnce(okRes(sparseEnrolled))
    const result = await fetchMyCourses('tok')
    expect(result.content[0].title).toBe('Untitled course')
    expect(result.content[0].progressPercent).toBe(0)
  })

  it('uses unrollmentId when enrollmentId is missing', async () => {
    const data = {
      content: [{ unrollmentId: 'u1', courseId: 'c1', courseTitle: 'X', courseCategory: 'C', enrolledAt: '2024-01-01', progressPercent: 0 }],
    }
    mockFetch.mockResolvedValueOnce(okRes(data))
    const result = await fetchMyCourses('tok')
    expect(result.content[0].enrollmentId).toBe('u1')
  })
})
