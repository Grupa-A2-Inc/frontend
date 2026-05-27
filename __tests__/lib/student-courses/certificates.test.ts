import { describe, it, expect, vi, beforeEach } from 'vitest'
import { downloadCertificatePdf, fetchCertificateCourseVisibility, findEnrollmentForCourse } from '@/lib/student-courses/certificates'

vi.mock('@/lib/fetchWithAuth', () => ({ fetchWithAuth: vi.fn() }))
vi.mock('@/lib/student-courses/api', () => ({ fetchMyCourses: vi.fn() }))

import { fetchWithAuth } from '@/lib/fetchWithAuth'
import { fetchMyCourses } from '@/lib/student-courses/api'
const mockFetch = fetchWithAuth as ReturnType<typeof vi.fn>
const mockFetchMyCourses = fetchMyCourses as ReturnType<typeof vi.fn>

function okRes(body: unknown, status = 200) {
  return { ok: true, status, json: () => Promise.resolve(body), blob: () => Promise.resolve(new Blob(['PDF'])) } as unknown as Response
}
function errRes(status: number) {
  return { ok: false, status, json: () => Promise.resolve({}) } as unknown as Response
}

beforeEach(() => vi.clearAllMocks())

describe('downloadCertificatePdf', () => {
  it('returns a Blob on success', async () => {
    mockFetch.mockResolvedValueOnce(okRes(null))
    const result = await downloadCertificatePdf('tok', 'e1')
    expect(result).toBeInstanceOf(Blob)
  })

  it('throws on 403', async () => {
    mockFetch.mockResolvedValueOnce(errRes(403))
    await expect(downloadCertificatePdf('tok', 'e1')).rejects.toThrow('not available')
  })

  it('throws on 404', async () => {
    mockFetch.mockResolvedValueOnce(errRes(404))
    await expect(downloadCertificatePdf('tok', 'e1')).rejects.toThrow('enrollment')
  })

  it('throws with body message on other error', async () => {
    const res = { ok: false, status: 500, json: () => Promise.resolve({ message: 'Server error' }) } as unknown as Response
    mockFetch.mockResolvedValueOnce(res)
    await expect(downloadCertificatePdf('tok', 'e1')).rejects.toThrow('Server error')
  })
})

describe('fetchCertificateCourseVisibility', () => {
  it('returns PUBLIC visibility', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ visibility: 'PUBLIC' }))
    const result = await fetchCertificateCourseVisibility('tok', 'c1')
    expect(result).toBe('PUBLIC')
  })

  it('returns PRIVATE visibility', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ visibility: 'PRIVATE' }))
    const result = await fetchCertificateCourseVisibility('tok', 'c1')
    expect(result).toBe('PRIVATE')
  })

  it('throws on invalid visibility', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ visibility: 'UNKNOWN' }))
    await expect(fetchCertificateCourseVisibility('tok', 'c1')).rejects.toThrow('availability')
  })

  it('throws on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(errRes(404))
    await expect(fetchCertificateCourseVisibility('tok', 'c1')).rejects.toThrow('availability')
  })
})

describe('findEnrollmentForCourse', () => {
  const course = { id: 'c1', title: 'Course', description: 'D', category: 'Web', status: 'PUBLISHED' as const, visibility: 'PUBLIC' as const, createdBy: '' }

  it('returns enrollment when found on first page', async () => {
    mockFetchMyCourses.mockResolvedValueOnce({ content: [course], last: true, totalPages: 1 })
    const result = await findEnrollmentForCourse('tok', 'c1')
    expect(result?.id).toBe('c1')
  })

  it('returns null when course not found', async () => {
    mockFetchMyCourses.mockResolvedValueOnce({ content: [], last: true, totalPages: 1 })
    const result = await findEnrollmentForCourse('tok', 'c1')
    expect(result).toBeNull()
  })

  it('paginates to find enrollment', async () => {
    const otherCourse = { ...course, id: 'other' }
    mockFetchMyCourses.mockResolvedValueOnce({ content: [otherCourse], last: false, totalPages: 2 })
    mockFetchMyCourses.mockResolvedValueOnce({ content: [course], last: true, totalPages: 2 })
    const result = await findEnrollmentForCourse('tok', 'c1')
    expect(result?.id).toBe('c1')
  })
})
