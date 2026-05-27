import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getXsrfHeaders,
  getStoredAccessToken,
  storeAccessToken,
  clearStoredAccessToken,
  clearStoredCsrfToken,
  refreshCsrfToken,
  getCsrfToken,
  getXsrfHeadersAsync,
  fetchWithAuth,
  refreshAccessToken,
  SESSION_EXPIRED_EVENT,
  ACCESS_TOKEN_REFRESHED_EVENT,
} from '@/lib/fetchWithAuth'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
    headers: new Headers(),
  } as unknown as Response
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  clearStoredCsrfToken()
  clearStoredAccessToken()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getStoredAccessToken / storeAccessToken / clearStoredAccessToken', () => {
  it('returns null when no token stored', () => {
    expect(getStoredAccessToken()).toBeNull()
  })

  it('stores and retrieves access token', () => {
    storeAccessToken('test-token')
    expect(getStoredAccessToken()).toBe('test-token')
  })

  it('dispatches ACCESS_TOKEN_REFRESHED_EVENT on store', () => {
    const handler = vi.fn()
    window.addEventListener(ACCESS_TOKEN_REFRESHED_EVENT, handler)
    storeAccessToken('tok')
    expect(handler).toHaveBeenCalled()
    window.removeEventListener(ACCESS_TOKEN_REFRESHED_EVENT, handler)
  })

  it('clears token from localStorage', () => {
    storeAccessToken('tok')
    clearStoredAccessToken()
    expect(getStoredAccessToken()).toBeNull()
  })
})

describe('getXsrfHeaders', () => {
  it('returns empty object when no token available', () => {
    const headers = getXsrfHeaders()
    expect(Object.keys(headers)).toHaveLength(0)
  })

  it('reads token from XSRF-TOKEN cookie', () => {
    document.cookie = 'XSRF-TOKEN=my-csrf-token; path=/'
    const headers = getXsrfHeaders() as Record<string, string>
    expect(headers['X-XSRF-TOKEN']).toBe('my-csrf-token')
  })
})

describe('getCsrfToken', () => {
  it('returns null in server environment (no window)', async () => {
    // Already in browser env, so just check it fetches
    mockFetch.mockResolvedValueOnce(mockResponse({ csrfToken: 'tok', headerName: 'X-CSRF' }))
    const token = await getCsrfToken()
    expect(token).not.toBeNull()
    expect(token?.token).toBe('tok')
    expect(token?.headerName).toBe('X-CSRF')
  })

  it('returns cached token on second call without refetch', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ csrfToken: 'cached' }))
    await getCsrfToken()
    await getCsrfToken()
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('returns null when csrf endpoint returns non-ok', async () => {
    clearStoredCsrfToken()
    mockFetch.mockResolvedValueOnce(mockResponse(null, 500))
    const token = await getCsrfToken()
    expect(token).toBeNull()
  })

  it('returns null when response has no csrfToken field', async () => {
    clearStoredCsrfToken()
    mockFetch.mockResolvedValueOnce(mockResponse({}))
    const token = await getCsrfToken()
    expect(token).toBeNull()
  })
})

describe('refreshCsrfToken', () => {
  it('clears cache and re-fetches', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ csrfToken: 'first' }))
    await getCsrfToken()
    mockFetch.mockResolvedValueOnce(mockResponse({ csrfToken: 'second' }))
    const token = await refreshCsrfToken()
    expect(token?.token).toBe('second')
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

describe('getXsrfHeadersAsync', () => {
  it('returns headers from cached csrf token', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ csrfToken: 'async-tok', headerName: 'X-CSRF-Custom' }))
    const headers = await getXsrfHeadersAsync() as Record<string, string>
    expect(headers['X-CSRF-Custom']).toBe('async-tok')
  })

  it('force refreshes when forceRefresh is true', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ csrfToken: 'tok1' }))
    await getCsrfToken()
    mockFetch.mockResolvedValueOnce(mockResponse({ csrfToken: 'tok2' }))
    await getXsrfHeadersAsync({ forceRefresh: true })
    expect(mockFetch).toHaveBeenCalledTimes(2)
  })
})

describe('fetchWithAuth', () => {
  it('makes a request with authorization header when token provided', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ ok: true }))
    storeAccessToken('my-token')
    await fetchWithAuth('https://api.example.com/resource')
    const call = mockFetch.mock.calls[0]
    const headers = call[1].headers as Headers
    expect(headers.get('Authorization')).toBe('Bearer my-token')
  })

  it('returns response directly for non-401 status', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse({ data: 'ok' }, 200))
    const response = await fetchWithAuth('https://api.example.com/resource', null)
    expect(response.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('returns 403 response without retry', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(null, 403))
    const response = await fetchWithAuth('https://api.example.com/resource', null)
    expect(response.status).toBe(403)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('returns 401 response without retry when skipAuthRefresh is true', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(null, 401))
    const response = await fetchWithAuth('https://api.example.com/resource', null, { skipAuthRefresh: true })
    expect(response.status).toBe(401)
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('retries with refreshed token on 401', async () => {
    storeAccessToken('old-token')
    // First call: 401
    mockFetch.mockResolvedValueOnce(mockResponse(null, 401))
    // CSRF fetch for refresh
    mockFetch.mockResolvedValueOnce(mockResponse({ csrfToken: 'csrf' }))
    // Refresh token call
    mockFetch.mockResolvedValueOnce(mockResponse({ accessToken: 'new-token' }))
    // Retry call
    mockFetch.mockResolvedValueOnce(mockResponse({ data: 'retried' }, 200))

    const response = await fetchWithAuth('https://api.example.com/resource', null)
    expect(response.status).toBe(200)
    expect(mockFetch).toHaveBeenCalledTimes(4)
  })

  it('dispatches SESSION_EXPIRED_EVENT when refresh returns 401', async () => {
    storeAccessToken('old-token')
    const handler = vi.fn()
    window.addEventListener(SESSION_EXPIRED_EVENT, handler)

    mockFetch.mockResolvedValueOnce(mockResponse(null, 401))
    mockFetch.mockResolvedValueOnce(mockResponse({ csrfToken: 'csrf' }))
    mockFetch.mockResolvedValueOnce(mockResponse(null, 401))

    await fetchWithAuth('https://api.example.com/resource', null)
    expect(handler).toHaveBeenCalled()
    window.removeEventListener(SESSION_EXPIRED_EVENT, handler)
  })
})

describe('refreshAccessToken', () => {
  it('returns null on network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))
    const token = await refreshAccessToken(null)
    expect(token).toBeNull()
  })

  it('stores and returns new token on success', async () => {
    clearStoredCsrfToken()
    mockFetch.mockResolvedValueOnce(mockResponse({ csrfToken: 'csrf' }))
    mockFetch.mockResolvedValueOnce(mockResponse({ accessToken: 'fresh-token' }))
    const token = await refreshAccessToken(null)
    expect(token).toBe('fresh-token')
    expect(getStoredAccessToken()).toBe('fresh-token')
  })
})
