import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchCourseFullView,
  fetchTestForLesson,
  fetchTestsForLessons,
  fetchClassrooms,
  fetchClassroomStudents,
  fetchStudentsProgress,
  fetchStudentAverages,
  assignCourseToClassroom,
  fetchOrganizationStudents,
  fetchTeacherStudentDirectory,
} from '@/lib/courses/api'

vi.mock('@/lib/fetchWithAuth', () => ({
  fetchWithAuth: vi.fn(),
}))

import { fetchWithAuth } from '@/lib/fetchWithAuth'
const mockFetch = fetchWithAuth as ReturnType<typeof vi.fn>

function okResponse(body: unknown, status = 200) {
  return { ok: true, status, json: () => Promise.resolve(body) } as unknown as Response
}

function errResponse(status: number) {
  return { ok: false, status, json: () => Promise.resolve(null) } as unknown as Response
}

beforeEach(() => vi.clearAllMocks())

describe('fetchCourseFullView', () => {
  it('fetches and maps course full view', async () => {
    const raw = {
      id: 'c1', title: 'T', description: 'D', category: 'Web', status: 'PUBLISHED',
      visibility: 'PUBLIC', createdAt: '2024-01-01', chapters: [],
    }
    mockFetch.mockResolvedValueOnce(okResponse(raw))
    const result = await fetchCourseFullView('c1')
    expect(result.course.id).toBe('c1')
    expect(result.chapters).toHaveLength(0)
  })

  it('throws on 401', async () => {
    mockFetch.mockResolvedValueOnce(errResponse(401))
    await expect(fetchCourseFullView('c1')).rejects.toThrow('Unauthorized')
  })

  it('throws on 403', async () => {
    mockFetch.mockResolvedValueOnce(errResponse(403))
    await expect(fetchCourseFullView('c1')).rejects.toThrow('permission')
  })

  it('throws on 404', async () => {
    mockFetch.mockResolvedValueOnce(errResponse(404))
    await expect(fetchCourseFullView('c1')).rejects.toThrow('not found')
  })

  it('throws on other error status', async () => {
    mockFetch.mockResolvedValueOnce(errResponse(500))
    await expect(fetchCourseFullView('c1')).rejects.toThrow('500')
  })
})

describe('fetchTestForLesson', () => {
  it('returns mapped test on success', async () => {
    const raw = { id: 't1', title: 'Test', status: 'ACTIVE', createdAt: '2024-01-01' }
    mockFetch.mockResolvedValueOnce(okResponse(raw))
    const result = await fetchTestForLesson('l1')
    expect(result?.id).toBe('t1')
  })

  it('returns null when 404 not found error', async () => {
    mockFetch.mockResolvedValueOnce(errResponse(404))
    const result = await fetchTestForLesson('l1')
    expect(result).toBeNull()
  })

  it('re-throws non-404 errors', async () => {
    mockFetch.mockResolvedValueOnce(errResponse(500))
    await expect(fetchTestForLesson('l1')).rejects.toThrow()
  })
})

describe('fetchTestsForLessons', () => {
  it('returns all fulfilled tests', async () => {
    const raw = { id: 't1', title: 'Test', status: 'ACTIVE', createdAt: '2024-01-01' }
    mockFetch.mockResolvedValueOnce(okResponse(raw))
    mockFetch.mockResolvedValueOnce(okResponse(raw))
    const results = await fetchTestsForLessons(['l1', 'l2'])
    expect(results).toHaveLength(2)
  })

  it('filters out null results', async () => {
    mockFetch.mockResolvedValueOnce(errResponse(404))
    mockFetch.mockResolvedValueOnce(okResponse({ id: 't2', title: 'T', status: 'A', createdAt: '2024-01-01' }))
    const results = await fetchTestsForLessons(['l1', 'l2'])
    expect(results).toHaveLength(1)
  })

  it('returns empty for empty input', async () => {
    const results = await fetchTestsForLessons([])
    expect(results).toHaveLength(0)
  })
})

describe('fetchClassrooms', () => {
  it('maps classrooms from content array', async () => {
    const raw = { content: [{ id: 'cl1', organizationId: 'o1', name: 'Class A', createdAt: '2024-01-01' }] }
    mockFetch.mockResolvedValueOnce(okResponse(raw))
    const result = await fetchClassrooms()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('cl1')
  })

  it('handles array response', async () => {
    const raw = [{ id: 'cl1', organizationId: 'o1', name: 'Class A', createdAt: '2024-01-01' }]
    mockFetch.mockResolvedValueOnce(okResponse(raw))
    const result = await fetchClassrooms()
    expect(result).toHaveLength(1)
  })
})

describe('fetchClassroomStudents', () => {
  it('maps students from members array', async () => {
    const raw = { members: [{ userId: 'u1', email: 'a@b.com', membershipType: 'STUDENT' }] }
    mockFetch.mockResolvedValueOnce(okResponse(raw))
    const result = await fetchClassroomStudents('cl1')
    expect(result).toHaveLength(1)
    expect(result[0].userId).toBe('u1')
  })
})

describe('fetchStudentsProgress', () => {
  it('maps progress from content array', async () => {
    const raw = { content: [{ studentId: 's1', enrolledAt: '2024-01-01', progressPercent: 50 }] }
    mockFetch.mockResolvedValueOnce(okResponse(raw))
    const result = await fetchStudentsProgress('c1')
    expect(result).toHaveLength(1)
    expect(result[0].progressPercent).toBe(50)
  })
})

describe('fetchStudentAverages', () => {
  it('maps averages from content array', async () => {
    const raw = { content: [{ studentId: 's1', averageScore: 80, minScore: 60, maxScore: 100, testCount: 5, passedTests: 4, failedTests: 1 }] }
    mockFetch.mockResolvedValueOnce(okResponse(raw))
    const result = await fetchStudentAverages('c1')
    expect(result).toHaveLength(1)
    expect(result[0].averageScore).toBe(80)
  })
})

describe('assignCourseToClassroom', () => {
  it('posts and maps the response', async () => {
    const raw = { id: 'a1', classroomId: 'cl1', courseId: 'c1', assignedAt: '2024-01-01' }
    mockFetch.mockResolvedValueOnce(okResponse(raw))
    const result = await assignCourseToClassroom('cl1', 'c1')
    expect(result.id).toBe('a1')
  })
})

describe('fetchOrganizationStudents', () => {
  it('maps students from content', async () => {
    const raw = { content: [{ id: 'u1', email: 'a@b.com' }] }
    mockFetch.mockResolvedValueOnce(okResponse(raw))
    const result = await fetchOrganizationStudents()
    expect(result).toHaveLength(1)
  })
})

describe('fetchTeacherStudentDirectory', () => {
  it('deduplicates students across classrooms', async () => {
    // fetchClassrooms
    mockFetch.mockResolvedValueOnce(okResponse([{ id: 'cl1', organizationId: 'o1', name: 'Class A', createdAt: '2024-01-01' }]))
    // fetchClassroomStudents for cl1
    mockFetch.mockResolvedValueOnce(okResponse({ members: [
      { userId: 'u1', email: 'a@b.com', membershipType: 'STUDENT' },
    ]}))
    const result = await fetchTeacherStudentDirectory()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('u1')
  })

  it('returns empty when no classrooms', async () => {
    mockFetch.mockResolvedValueOnce(okResponse([]))
    const result = await fetchTeacherStudentDirectory()
    expect(result).toHaveLength(0)
  })
})
