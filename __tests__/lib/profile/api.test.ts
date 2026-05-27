import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchUserProfile, updateUserProfile, changeUserPassword, fetchProfileOrganization, updateProfileOrganization } from '@/lib/profile/api'

vi.mock('@/lib/fetchWithAuth', () => ({
  fetchWithAuth: vi.fn(),
  getXsrfHeadersAsync: vi.fn().mockResolvedValue({}),
}))
import { fetchWithAuth } from '@/lib/fetchWithAuth'
const mockFetch = fetchWithAuth as ReturnType<typeof vi.fn>

function okRes(body: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) } as unknown as Response
}
function errRes(status: number) {
  return { ok: false, status, json: () => Promise.resolve({ message: `Error ${status}` }) } as unknown as Response
}

beforeEach(() => vi.clearAllMocks())

describe('fetchUserProfile', () => {
  it('returns profile data on success', async () => {
    const profile = { id: 'u1', email: 'a@b.com', firstName: 'John', lastName: 'Doe' }
    mockFetch.mockResolvedValueOnce(okRes(profile))
    const result = await fetchUserProfile('u1', 'tok')
    expect(result).toMatchObject({ id: 'u1' })
  })

  it('throws on 401', async () => {
    mockFetch.mockResolvedValueOnce(errRes(401))
    await expect(fetchUserProfile('u1', 'tok')).rejects.toThrow()
  })

  it('throws on 403 with correct message', async () => {
    const failRes = { ok: false, status: 403, json: () => Promise.resolve({}) } as unknown as Response
    mockFetch.mockResolvedValueOnce(failRes)
    await expect(fetchUserProfile('u1', 'tok')).rejects.toThrow('permission')
  })

  it('throws on 404', async () => {
    const failRes = { ok: false, status: 404, json: () => Promise.resolve({}) } as unknown as Response
    mockFetch.mockResolvedValueOnce(failRes)
    await expect(fetchUserProfile('u1', 'tok')).rejects.toThrow('not found')
  })
})

describe('updateUserProfile', () => {
  const payload = { firstName: 'Jane', lastName: 'Doe' }

  it('resolves on success', async () => {
    mockFetch.mockResolvedValueOnce(okRes(null))
    await expect(updateUserProfile('u1', payload, 'tok')).resolves.not.toThrow()
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(400))
    await expect(updateUserProfile('u1', payload, 'tok')).rejects.toThrow()
  })
})

describe('changeUserPassword', () => {
  const payload = { currentPassword: 'old', newPassword: 'new123', confirmPassword: 'new123' }

  it('resolves on success', async () => {
    mockFetch.mockResolvedValueOnce(okRes(null))
    await expect(changeUserPassword('u1', payload, 'tok')).resolves.not.toThrow()
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(400))
    await expect(changeUserPassword('u1', payload, 'tok')).rejects.toThrow()
  })
})

describe('fetchProfileOrganization', () => {
  it('returns org data on success', async () => {
    const org = { id: 'o1', name: 'Acme' }
    mockFetch.mockResolvedValueOnce(okRes(org))
    const result = await fetchProfileOrganization('o1', 'tok')
    expect(result).toMatchObject({ id: 'o1' })
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(404))
    await expect(fetchProfileOrganization('o1', 'tok')).rejects.toThrow()
  })
})

describe('updateProfileOrganization', () => {
  it('resolves on success', async () => {
    mockFetch.mockResolvedValueOnce(okRes(null))
    await expect(updateProfileOrganization('o1', { name: 'New Name', organizationType: 'Edu', country: 'RO', city: 'BUC', address: 'Str', phoneNumber: '123' }, 'tok')).resolves.not.toThrow()
  })
})
