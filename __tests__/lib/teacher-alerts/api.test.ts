import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchTeacherAlerts, fetchTeacherAlertContexts, fetchTeacherAlertsDashboardData } from '@/lib/teacher-alerts/api'

vi.mock('@/lib/fetchWithAuth', () => ({ fetchWithAuth: vi.fn() }))
vi.mock('@/lib/courses/api', () => ({
  fetchCourseFullView: vi.fn(),
}))

import { fetchWithAuth } from '@/lib/fetchWithAuth'
import { fetchCourseFullView } from '@/lib/courses/api'
const mockFetch = fetchWithAuth as ReturnType<typeof vi.fn>
const mockFetchCourse = fetchCourseFullView as ReturnType<typeof vi.fn>

function okRes(body: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) } as unknown as Response
}
function errRes(status: number) {
  return { ok: false, status, json: () => Promise.resolve({}) } as unknown as Response
}

beforeEach(() => vi.clearAllMocks())

describe('fetchTeacherAlerts', () => {
  it('returns mapped alerts', async () => {
    const raw = [
      { alertId: 'a1', testId: 't1', professorId: 'p1', failureThreshold: 0.5, currentFailureRate: 0.6, isActive: true },
    ]
    mockFetch.mockResolvedValueOnce(okRes(raw))
    const alerts = await fetchTeacherAlerts()
    expect(alerts).toHaveLength(1)
    expect(alerts[0].alertId).toBe('a1')
    expect(alerts[0].isActive).toBe(true)
  })

  it('filters out alerts with empty alertId or testId', async () => {
    const raw = [{ alertId: '', testId: 't1' }, { alertId: 'a2', testId: '' }]
    mockFetch.mockResolvedValueOnce(okRes(raw))
    const alerts = await fetchTeacherAlerts()
    expect(alerts).toHaveLength(0)
  })

  it('throws on 401', async () => {
    mockFetch.mockResolvedValueOnce(errRes(401))
    await expect(fetchTeacherAlerts()).rejects.toThrow('Unauthorized')
  })

  it('throws on 403', async () => {
    mockFetch.mockResolvedValueOnce(errRes(403))
    await expect(fetchTeacherAlerts()).rejects.toThrow('permission')
  })

  it('throws on other errors', async () => {
    mockFetch.mockResolvedValueOnce(errRes(500))
    await expect(fetchTeacherAlerts()).rejects.toThrow('500')
  })

  it('handles content-wrapped response', async () => {
    const raw = { content: [{ alertId: 'a1', testId: 't1', professorId: 'p1', failureThreshold: 0.5, currentFailureRate: 0.6, isActive: false }] }
    mockFetch.mockResolvedValueOnce(okRes(raw))
    const alerts = await fetchTeacherAlerts()
    expect(alerts).toHaveLength(1)
  })
})

describe('fetchTeacherAlertContexts', () => {
  it('returns empty map for empty testIds', async () => {
    const result = await fetchTeacherAlertContexts([])
    expect(result.size).toBe(0)
  })

  it('builds contexts from course data', async () => {
    // fetchTeacherCourseSummaries -> fetchWithAuth for myCourses
    mockFetch.mockResolvedValueOnce(okRes([{ id: 'c1', title: 'Course 1' }]))
    // fetchCourseFullView for c1
    mockFetchCourse.mockResolvedValueOnce({
      course: { id: 'c1', title: 'Course 1' },
      chapters: [{
        id: 'ch1',
        lessons: [{ id: 'l1', testId: 't1', title: 'Lesson 1', lessonResources: [] }],
      }],
    })
    const contexts = await fetchTeacherAlertContexts(['t1'])
    expect(contexts.has('t1')).toBe(true)
    expect(contexts.get('t1')?.courseId).toBe('c1')
  })
})

describe('fetchTeacherAlertsDashboardData', () => {
  it('returns alerts with context', async () => {
    const alertsRaw = [{ alertId: 'a1', testId: 't1', professorId: 'p1', failureThreshold: 0.5, currentFailureRate: 0.6, isActive: true }]
    // fetchTeacherAlerts
    mockFetch.mockResolvedValueOnce(okRes(alertsRaw))
    // fetchTeacherCourseSummaries (inside fetchTeacherAlertContexts)
    mockFetch.mockResolvedValueOnce(okRes([]))

    const result = await fetchTeacherAlertsDashboardData()
    expect(result).toHaveLength(1)
    expect(result[0].alertId).toBe('a1')
  })
})
