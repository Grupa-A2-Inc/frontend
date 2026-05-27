import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getStoredUser,
  getAccessToken,
  getOrganizationIdFromStorage,
  getOrganizationById,
  updateOrganizationById,
  getDashboardStats,
} from '@/lib/admin-dashboard/api'

vi.mock('@/lib/fetchWithAuth', () => ({ fetchWithAuth: vi.fn() }))
import { fetchWithAuth } from '@/lib/fetchWithAuth'
const mockFetch = fetchWithAuth as ReturnType<typeof vi.fn>

function okRes(body: unknown, status = 200) {
  return { ok: true, status, json: () => Promise.resolve(body) } as unknown as Response
}
function errRes(status: number) {
  return { ok: false, status, json: () => Promise.resolve(null) } as unknown as Response
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('getStoredUser', () => {
  it('returns null when localStorage is empty', () => {
    expect(getStoredUser()).toBeNull()
  })

  it('returns parsed user', () => {
    localStorage.setItem('user', JSON.stringify({ id: 'u1', organizationId: 'o1' }))
    expect(getStoredUser()).toMatchObject({ id: 'u1' })
  })

  it('returns null for invalid JSON', () => {
    localStorage.setItem('user', '{bad json')
    expect(getStoredUser()).toBeNull()
  })
})

describe('getAccessToken', () => {
  it('returns null when not set', () => {
    expect(getAccessToken()).toBeNull()
  })

  it('returns stored token', () => {
    localStorage.setItem('accessToken', 'tok123')
    expect(getAccessToken()).toBe('tok123')
  })
})

describe('getOrganizationIdFromStorage', () => {
  it('returns null when no user', () => {
    expect(getOrganizationIdFromStorage()).toBeNull()
  })

  it('returns orgId from stored user', () => {
    localStorage.setItem('user', JSON.stringify({ organizationId: 42 }))
    expect(getOrganizationIdFromStorage()).toBe('42')
  })
})

describe('getOrganizationById', () => {
  beforeEach(() => localStorage.setItem('accessToken', 'tok'))

  it('maps and returns organization on success', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ id: 1, name: 'Acme', organizationType: 'Edu', country: 'RO', city: 'BUC', address: 'Str', phoneNumber: '123' }))
    const org = await getOrganizationById('o1')
    expect(org.id).toBe('1')
    expect(org.organizationName).toBe('Acme')
  })

  it('throws when no access token', async () => {
    localStorage.clear()
    await expect(getOrganizationById('o1')).rejects.toThrow('Access token')
  })

  it('throws on 401', async () => {
    mockFetch.mockResolvedValueOnce(errRes(401))
    await expect(getOrganizationById('o1')).rejects.toThrow('Unauthorized')
  })

  it('throws on 403', async () => {
    mockFetch.mockResolvedValueOnce(errRes(403))
    await expect(getOrganizationById('o1')).rejects.toThrow('permission')
  })

  it('throws on 404', async () => {
    mockFetch.mockResolvedValueOnce(errRes(404))
    await expect(getOrganizationById('o1')).rejects.toThrow('not found')
  })
})

describe('updateOrganizationById', () => {
  const payload = { name: 'Acme', organizationType: 'Edu', country: 'RO', city: 'BUC', address: 'Str', phoneNumber: '123' }
  beforeEach(() => localStorage.setItem('accessToken', 'tok'))

  it('resolves on success', async () => {
    mockFetch.mockResolvedValueOnce(okRes(null, 200))
    await expect(updateOrganizationById('o1', payload)).resolves.not.toThrow()
  })

  it('throws when no token', async () => {
    localStorage.clear()
    await expect(updateOrganizationById('o1', payload)).rejects.toThrow('Access token')
  })

  it('throws on 401', async () => {
    mockFetch.mockResolvedValueOnce(errRes(401))
    await expect(updateOrganizationById('o1', payload)).rejects.toThrow('Unauthorized')
  })

  it('throws on 403', async () => {
    mockFetch.mockResolvedValueOnce(errRes(403))
    await expect(updateOrganizationById('o1', payload)).rejects.toThrow('permission')
  })
})

describe('getDashboardStats', () => {
  beforeEach(() => localStorage.setItem('accessToken', 'tok'))

  it('throws when no token', async () => {
    localStorage.clear()
    await expect(getDashboardStats()).rejects.toThrow('Access token')
  })

  it('returns organization-scoped student, teacher, and class counts', async () => {
    const students = [{ id: 's1', roleName: 'STUDENT' }, { id: 's2', roleName: 'STUDENT' }]
    const teachers = [{ id: 't1', roleName: 'TEACHER' }]
    const classrooms = [{ id: 'cl1' }]

    mockFetch.mockResolvedValueOnce(okRes({ content: students, totalElements: 2 }))
    mockFetch.mockResolvedValueOnce(okRes({ content: teachers, totalElements: 1 }))
    mockFetch.mockResolvedValueOnce(okRes({ classrooms, totalElements: 1 }))

    const stats = await getDashboardStats()
    expect(stats.totalStudents).toBe(2)
    expect(stats.totalTeachers).toBe(1)
    expect(stats.totalClasses).toBe(1)
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining('/api/v1/users/organization?role=STUDENT'),
      'tok',
      expect.any(Object)
    )
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/api/v1/users/organization?role=TEACHER'),
      'tok',
      expect.any(Object)
    )
  })

  it('uses paginated totalElements when the API returns pagination metadata', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ content: [], totalElements: 42 }))
    mockFetch.mockResolvedValueOnce(okRes({ content: [], totalElements: 7 }))
    mockFetch.mockResolvedValueOnce(okRes({ content: [], totalElements: 4 }))

    const stats = await getDashboardStats()
    expect(stats.totalStudents).toBe(42)
    expect(stats.totalTeachers).toBe(7)
    expect(stats.totalClasses).toBe(4)
  })

  it('walks plain array pages and counts unique records', async () => {
    const firstStudentPage = Array.from({ length: 1000 }, (_, index) => ({ id: `s${index}` }))

    mockFetch.mockResolvedValueOnce(okRes(firstStudentPage))
    mockFetch.mockResolvedValueOnce(okRes({ content: [], totalElements: 3 }))
    mockFetch.mockResolvedValueOnce(okRes({ content: [], totalElements: 2 }))
    mockFetch.mockResolvedValueOnce(okRes([{ id: 's1000' }]))
    mockFetch.mockResolvedValueOnce(okRes([]))

    const stats = await getDashboardStats()
    expect(stats.totalStudents).toBe(1001)
  })

  it('hides unavailable counts and returns warnings when responses are not ok', async () => {
    mockFetch.mockResolvedValueOnce(errRes(500))
    mockFetch.mockResolvedValueOnce(errRes(500))
    mockFetch.mockResolvedValueOnce(errRes(500))

    const stats = await getDashboardStats()
    expect(stats.totalStudents).toBeNull()
    expect(stats.totalTeachers).toBeNull()
    expect(stats.totalClasses).toBeNull()
    expect(stats.warnings).toHaveLength(3)
  })
})
