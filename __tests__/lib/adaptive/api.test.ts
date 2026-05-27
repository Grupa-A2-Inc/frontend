import { describe, it, expect, vi, beforeEach } from 'vitest'
import { startAdaptiveSession, submitAdaptiveSession } from '@/lib/adaptive/api'

vi.mock('@/lib/fetchWithAuth', () => ({ fetchWithAuth: vi.fn() }))
import { fetchWithAuth } from '@/lib/fetchWithAuth'
const mockFetch = fetchWithAuth as ReturnType<typeof vi.fn>

function okRes(body: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(body), text: () => Promise.resolve('') } as unknown as Response
}
function errRes(status: number, text = '') {
  return { ok: false, status, statusText: 'Error', text: () => Promise.resolve(text), json: () => Promise.resolve({}) } as unknown as Response
}

beforeEach(() => vi.clearAllMocks())

describe('startAdaptiveSession', () => {
  it('normalizes MULTIPLE_CHOICE to MULTI_CHOICE', async () => {
    const raw = {
      sessionId: 's1',
      exercises: [{ id: 'e1', type: 'MULTIPLE_CHOICE', question: 'Q', options: [] }],
    }
    mockFetch.mockResolvedValueOnce(okRes(raw))
    const result = await startAdaptiveSession('tok', { lessonId: 'l1', difficulty: 'MEDIUM' })
    expect(result.exercises[0].type).toBe('MULTI_CHOICE')
  })

  it('normalizes MULTI_CHOICE stays as MULTI_CHOICE', async () => {
    const raw = { exercises: [{ type: 'MULTI_CHOICE' }] }
    mockFetch.mockResolvedValueOnce(okRes(raw))
    const result = await startAdaptiveSession('tok', { lessonId: 'l1', difficulty: 'MEDIUM' })
    expect(result.exercises[0].type).toBe('MULTI_CHOICE')
  })

  it('normalizes TRUE_FALSE stays as TRUE_FALSE', async () => {
    const raw = { exercises: [{ type: 'TRUE_FALSE' }] }
    mockFetch.mockResolvedValueOnce(okRes(raw))
    const result = await startAdaptiveSession('tok', { lessonId: 'l1', difficulty: 'MEDIUM' })
    expect(result.exercises[0].type).toBe('TRUE_FALSE')
  })

  it('defaults unknown type to SINGLE_CHOICE', async () => {
    const raw = { exercises: [{ type: 'UNKNOWN' }] }
    mockFetch.mockResolvedValueOnce(okRes(raw))
    const result = await startAdaptiveSession('tok', { lessonId: 'l1', difficulty: 'MEDIUM' })
    expect(result.exercises[0].type).toBe('SINGLE_CHOICE')
  })

  it('handles missing exercises array', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ sessionId: 's1' }))
    const result = await startAdaptiveSession('tok', { lessonId: 'l1', difficulty: 'MEDIUM' })
    expect(result.exercises).toHaveLength(0)
  })

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(500, 'Server Error'))
    await expect(startAdaptiveSession('tok', { lessonId: 'l1', difficulty: 'MEDIUM' })).rejects.toThrow('HTTP 500')
  })
})

describe('submitAdaptiveSession', () => {
  it('returns result on success', async () => {
    const raw = { score: 90, passed: true }
    mockFetch.mockResolvedValueOnce(okRes(raw))
    const result = await submitAdaptiveSession('tok', 's1', { answers: [] })
    expect(result.score).toBe(90)
  })

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(400, 'Bad Request'))
    await expect(submitAdaptiveSession('tok', 's1', { answers: [] })).rejects.toThrow('HTTP 400')
  })
})
