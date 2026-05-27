import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  apiGetTestForLesson,
  apiGetTestDetails,
  apiCreateLessonTest,
  apiUpdateTest,
  apiPublishTest,
  apiGetQuestionsForTest,
  apiGetEditableQuestionsForTest,
  apiCreateQuestion,
  apiUpdateQuestion,
  apiDeleteQuestion,
} from '@/lib/tests/api'

vi.mock('@/lib/fetchWithAuth', () => ({
  fetchWithAuth: vi.fn(),
  getStoredAccessToken: vi.fn().mockReturnValue('tok'),
  refreshAccessToken: vi.fn(),
}))

import { fetchWithAuth } from '@/lib/fetchWithAuth'
const mockFetch = fetchWithAuth as ReturnType<typeof vi.fn>

function okRes(body: unknown, status = 200) {
  return { ok: true, status, json: () => Promise.resolve(body), headers: new Headers() } as unknown as Response
}
function noContentRes() {
  return { ok: true, status: 204, json: () => Promise.resolve(null) } as unknown as Response
}
function notFoundRes() {
  return { ok: false, status: 404, json: () => Promise.resolve({ message: 'not found' }) } as unknown as Response
}
function errRes(status: number) {
  return { ok: false, status, json: () => Promise.resolve({ message: `Error ${status}` }) } as unknown as Response
}

const rawTest = { id: 't1', lessonId: 'l1', title: 'Test 1', description: 'Desc', timeLimitSec: 120, status: 'DRAFT', aiEnabled: false, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
const rawQuestion = { id: 1, questionType: 'SINGLE_CHOICE', content: 'Q?', difficulty: 'EASY', options: [{ id: 1, text: 'A', displayOrder: 1, isCorrect: true }] }

beforeEach(() => vi.clearAllMocks())

describe('apiGetTestForLesson', () => {
  it('returns normalized test', async () => {
    mockFetch.mockResolvedValueOnce(okRes(rawTest))
    const result = await apiGetTestForLesson('l1')
    expect(result?.id).toBe('t1')
    expect(result?.title).toBe('Test 1')
  })

  it('returns null on 404 (allowNotFound)', async () => {
    mockFetch.mockResolvedValueOnce(notFoundRes())
    const result = await apiGetTestForLesson('l1')
    expect(result).toBeNull()
  })
})

describe('apiGetTestDetails', () => {
  it('returns test details', async () => {
    mockFetch.mockResolvedValueOnce(okRes(rawTest))
    const result = await apiGetTestDetails('t1')
    expect(result.id).toBe('t1')
    expect(result.status).toBe('DRAFT')
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(500))
    await expect(apiGetTestDetails('t1')).rejects.toThrow()
  })
})

describe('apiCreateLessonTest', () => {
  it('creates and returns test', async () => {
    mockFetch.mockResolvedValueOnce(okRes(rawTest))
    const payload = { title: 'New Test', timeLimitSec: 60, aiEnabled: false }
    const result = await apiCreateLessonTest('l1', payload)
    expect(result.title).toBe('Test 1')
  })
})

describe('apiUpdateTest', () => {
  it('updates and returns test', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ ...rawTest, title: 'Updated' }))
    const result = await apiUpdateTest('t1', { title: 'Updated' })
    expect(result.title).toBe('Updated')
  })
})

describe('apiPublishTest', () => {
  it('publishes and returns test', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ ...rawTest, status: 'PUBLISHED' }))
    const result = await apiPublishTest('t1')
    expect(result.status).toBe('PUBLISHED')
  })
})

describe('apiGetQuestionsForTest', () => {
  it('returns normalized questions', async () => {
    mockFetch.mockResolvedValueOnce(okRes([rawQuestion]))
    const result = await apiGetQuestionsForTest('t1')
    expect(result).toHaveLength(1)
    expect(result[0].questionType).toBe('SINGLE_CHOICE')
    expect(result[0].options[0].isCorrect).toBe(true)
  })

  it('normalizes MULTIPLE_CHOICE to MULTI_CHOICE', async () => {
    mockFetch.mockResolvedValueOnce(okRes([{ ...rawQuestion, questionType: 'MULTIPLE_CHOICE' }]))
    const result = await apiGetQuestionsForTest('t1')
    expect(result[0].questionType).toBe('MULTI_CHOICE')
  })

  it('handles empty array', async () => {
    mockFetch.mockResolvedValueOnce(okRes([]))
    const result = await apiGetQuestionsForTest('t1')
    expect(result).toHaveLength(0)
  })
})

describe('apiGetEditableQuestionsForTest', () => {
  it('returns questions from primary endpoint', async () => {
    mockFetch.mockResolvedValueOnce(okRes([rawQuestion]))
    const result = await apiGetEditableQuestionsForTest('t1')
    expect(result).toHaveLength(1)
  })

  it('falls back to secondary endpoint on 401', async () => {
    mockFetch.mockResolvedValueOnce(errRes(401))
    mockFetch.mockResolvedValueOnce(okRes([rawQuestion]))
    const result = await apiGetEditableQuestionsForTest('t1')
    expect(result).toHaveLength(1)
  })
})

describe('apiCreateQuestion', () => {
  it('creates and returns question', async () => {
    mockFetch.mockResolvedValueOnce(okRes(rawQuestion))
    const result = await apiCreateQuestion('t1', {
      clientId: 'q-new', questionType: 'SINGLE_CHOICE', content: 'Q?',
      options: [{ clientId: 'o-new', text: 'A', displayOrder: 1, isCorrect: true }],
    })
    expect(result.content).toBe('Q?')
  })

  it('falls back to secondary endpoint on 401', async () => {
    mockFetch.mockResolvedValueOnce(errRes(401))
    mockFetch.mockResolvedValueOnce(okRes(rawQuestion))
    const result = await apiCreateQuestion('t1', {
      clientId: 'q-new', questionType: 'SINGLE_CHOICE', content: 'Q?', options: [],
    })
    expect(result).toBeDefined()
  })
})

describe('apiUpdateQuestion', () => {
  it('updates existing question (has id)', async () => {
    mockFetch.mockResolvedValueOnce(okRes(rawQuestion))
    const result = await apiUpdateQuestion('t1', {
      id: 1, clientId: 'q-1', questionType: 'SINGLE_CHOICE', content: 'Updated?',
      options: [],
    })
    expect(result).toBeDefined()
  })

  it('creates question when id is undefined', async () => {
    mockFetch.mockResolvedValueOnce(okRes(rawQuestion))
    const result = await apiUpdateQuestion('t1', {
      clientId: 'q-new', questionType: 'SINGLE_CHOICE', content: 'New Q?', options: [],
    })
    expect(result).toBeDefined()
  })
})

describe('apiDeleteQuestion', () => {
  it('resolves on 204', async () => {
    mockFetch.mockResolvedValueOnce(noContentRes())
    await expect(apiDeleteQuestion('t1', 1)).resolves.not.toThrow()
  })
})
