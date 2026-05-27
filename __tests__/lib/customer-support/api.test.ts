import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiSendSupportMessage } from '@/lib/customer-support/api'

const mockGlobalFetch = vi.fn()
vi.stubGlobal('fetch', mockGlobalFetch)

function okRes(body: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) } as unknown as Response
}
function errRes(status: number, body: unknown = null) {
  return { ok: false, status, json: () => Promise.resolve(body) } as unknown as Response
}

beforeEach(() => vi.clearAllMocks())

describe('apiSendSupportMessage', () => {
  it('returns response on success', async () => {
    const response = { reply: 'Thank you for your message.' }
    mockGlobalFetch.mockResolvedValueOnce(okRes(response))
    const result = await apiSendSupportMessage({ message: 'Hello', userId: 'u1' })
    expect(result.reply).toBe('Thank you for your message.')
  })

  it('posts to /api/customer-support', async () => {
    mockGlobalFetch.mockResolvedValueOnce(okRes({ reply: 'ok' }))
    await apiSendSupportMessage({ message: 'test', userId: 'u1' })
    expect(mockGlobalFetch).toHaveBeenCalledWith('/api/customer-support', expect.objectContaining({ method: 'POST' }))
  })

  it('throws with error message from response', async () => {
    mockGlobalFetch.mockResolvedValueOnce(errRes(500, { error: 'Server down' }))
    await expect(apiSendSupportMessage({ message: 'test', userId: 'u1' })).rejects.toThrow('Server down')
  })

  it('throws with fallback message when no error field', async () => {
    mockGlobalFetch.mockResolvedValueOnce(errRes(500))
    await expect(apiSendSupportMessage({ message: 'test', userId: 'u1' })).rejects.toThrow('Could not send message')
  })
})
