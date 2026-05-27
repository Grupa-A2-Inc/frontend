import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiFetch } from '@/lib/classes/api'

vi.mock('@/lib/fetchWithAuth', () => ({ fetchWithAuth: vi.fn() }))
import { fetchWithAuth } from '@/lib/fetchWithAuth'
const mockFetch = fetchWithAuth as ReturnType<typeof vi.fn>

function okRes(body: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) } as unknown as Response
}
function errRes(status: number) {
  return { ok: false, status, json: () => Promise.resolve({ message: `Error ${status}` }) } as unknown as Response
}

beforeEach(() => vi.clearAllMocks())

describe('apiFetch', () => {
  it('returns JSON on success', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ id: 'x' }))
    const result = await apiFetch('/api/v1/test', 'tok')
    expect(result).toEqual({ id: 'x' })
  })

  it('throws with error message on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce(errRes(404))
    await expect(apiFetch('/api/v1/test', 'tok')).rejects.toThrow('Error 404')
  })

  it('throws with fallback message when json parse fails', async () => {
    const failRes = {
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error('bad json')),
    } as unknown as Response
    mockFetch.mockResolvedValueOnce(failRes)
    await expect(apiFetch('/api/v1/test', 'tok')).rejects.toThrow('Request failed: 500')
  })

  it('passes additional options to fetchWithAuth', async () => {
    mockFetch.mockResolvedValueOnce(okRes({}))
    await apiFetch('/api/v1/test', 'tok', { method: 'POST', body: JSON.stringify({ a: 1 }) })
    const call = mockFetch.mock.calls[0]
    expect(call[2].method).toBe('POST')
  })
})
