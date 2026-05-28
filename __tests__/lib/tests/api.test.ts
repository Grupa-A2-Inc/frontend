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

import {
  apiGenerateAndInjectQuestions,
  apiStartTestSession,
  apiSubmitTest,
  apiGetTestResult,
  apiGetStudentProgress,
  apiGetTestAnalytics,
  apiGetTestFailureRate,
  apiSetTestAlertThreshold,
  apiGetTestsForCourse,
  apiGetMyAttempts,
} from '@/lib/tests/api'

const rawSession = {
  attemptId: 'a1',
  attemptNumber: 1,
  startedAt: '2024-01-01',
  timeLimitSec: 120,
  test: { id: 't1', title: 'Test' },
  questions: [{ questionId: 1, questionType: 'SINGLE_CHOICE', content: 'Q?', difficulty: 'EASY', options: [{ optionId: 1, text: 'A', displayOrder: 1 }] }],
}

const rawResult = {
  attemptId: 'a1', testId: 't1', score: 80, passed: true, maxScore: 100,
  startedAt: '2024-01-01', submittedAt: '2024-01-01',
  questions: [{ questionId: 1, prompt: 'Q?', options: [], isCorrect: true }],
}

describe('apiStartTestSession', () => {
  it('returns normalized session', async () => {
    mockFetch.mockResolvedValueOnce(okRes(rawSession))
    const result = await apiStartTestSession('t1')
    expect(result.attemptId).toBe('a1')
    expect(result.questions[0].prompt).toBe('Q?')
  })
})

describe('apiSubmitTest', () => {
  it('submits and returns result', async () => {
    mockFetch.mockResolvedValueOnce(okRes(rawResult))
    const result = await apiSubmitTest('a1', {
      answers: [{ questionId: 1, selectedOptionIds: [1] }],
    })
    expect(result.passed).toBe(true)
    expect(result.score).toBe(80)
  })

  it('uses matchesCorrectOptions when isCorrect and correct fields absent', async () => {
    const resultWithMatchedOptions = {
      ...rawResult,
      questions: [{
        questionId: 1, prompt: 'Q?', options: [],
        selectedOptionIds: [1, 2], correctOptionIds: [1, 2],
        // no 'correct' or 'isCorrect' fields
      }],
    }
    mockFetch.mockResolvedValueOnce(okRes(resultWithMatchedOptions))
    const result = await apiSubmitTest('a1', { answers: [] })
    expect(result.questions[0].isCorrect).toBe(true)
  })

  it('covers data.question fallback (singular)', async () => {
    const resultWithQuestion = {
      ...rawResult,
      questions: undefined,
      question: [{ questionId: 1, prompt: 'Q?', options: [], isCorrect: false }],
    }
    mockFetch.mockResolvedValueOnce(okRes(resultWithQuestion))
    const result = await apiSubmitTest('a1', { answers: [] })
    expect(result.questions).toHaveLength(1)
  })
})

describe('apiGetTestResult', () => {
  it('returns result without fetching questions when all have options', async () => {
    const resultWithOptions = { ...rawResult, questions: [{ questionId: 1, prompt: 'Q?', options: [{ id: 1, label: 'A', order: 1, isCorrect: true }], isCorrect: true }] }
    mockFetch.mockResolvedValueOnce(okRes(resultWithOptions))
    const result = await apiGetTestResult('a1')
    expect(result.passed).toBe(true)
  })

  it('fetches questions when testId provided and questions lack options', async () => {
    mockFetch.mockResolvedValueOnce(okRes(rawResult))
    mockFetch.mockResolvedValueOnce(okRes([rawQuestion]))
    const result = await apiGetTestResult('a1', 't1')
    expect(result).toBeDefined()
  })
})

describe('apiGetStudentProgress', () => {
  it('returns student progress', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ progressPercent: 75, completedLessons: 3, totalLessons: 4 }))
    const result = await apiGetStudentProgress('c1')
    expect(result).toBeDefined()
  })
})

describe('apiGetTestAnalytics', () => {
  it('returns test analytics', async () => {
    mockFetch.mockResolvedValueOnce(okRes({
      averageScore: 75, totalAttempts: 10, passRate: 80, passed: 8, failed: 2,
      passThreshold: 70, totalQuestions: 10,
    }))
    const result = await apiGetTestAnalytics('t1')
    expect(result.classAverage).toBe(75)
  })
})

describe('apiGetTestFailureRate', () => {
  it('returns failure rate data', async () => {
    mockFetch.mockResolvedValueOnce(okRes({
      failureRate: 60,
      threshold: 50,
      alertTriggered: true,
    }))

    const result = await apiGetTestFailureRate('t1')

    expect(result.failureRate).toBe(60)
    expect(result.threshold).toBe(50)
    expect(result.alertTriggered).toBe(true)
  })
})

describe('apiSetTestAlertThreshold', () => {
  it('posts threshold and returns alert data', async () => {
    mockFetch.mockResolvedValueOnce(okRes({
      alertId: 'a1',
      testId: 't1',
      professorId: 'p1',
      failureThreshold: 45,
      currentFailureRate: 60,
      isActive: true,
    }))

    const result = await apiSetTestAlertThreshold('t1', 45)

    expect(result.failureThreshold).toBe(45)
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/tests/t1/analytics/alerts'),
      undefined,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ failureThreshold: 45 }),
      })
    )
  })
})

describe('apiGetTestsForCourse', () => {
  it('returns array of tests', async () => {
    mockFetch.mockResolvedValueOnce(okRes([{ id: 't1' }]))
    const result = await apiGetTestsForCourse('c1')
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('apiGetMyAttempts', () => {
  it('returns array of attempts', async () => {
    mockFetch.mockResolvedValueOnce(okRes([{ attemptId: 'a1' }]))
    const result = await apiGetMyAttempts('t1')
    expect(Array.isArray(result)).toBe(true)
  })
})

describe('apiGenerateAndInjectQuestions', () => {
  it('generates and injects questions successfully', async () => {
    const aiResponse = { requestId: 'req1', status: 'PENDING' }
    const aiStatus = { requestId: 'req1', status: 'DONE' }
    const injection = { testId: 't1', injected: 5, skipped: 0, requestId: 'req1' }
    mockFetch
      .mockResolvedValueOnce(okRes(aiResponse))     // initiate
      .mockResolvedValueOnce(okRes(aiStatus))        // poll
      .mockResolvedValueOnce(okRes(injection))       // inject
      .mockResolvedValueOnce(okRes(rawTest))          // getTestDetails
      .mockResolvedValueOnce(okRes([rawQuestion]))   // getEditableQuestions

    const { refreshAccessToken } = await import('@/lib/fetchWithAuth')
    vi.mocked(refreshAccessToken).mockResolvedValue(undefined as never)

    const result = await apiGenerateAndInjectQuestions('l1', { questionCount: 5, difficulty: 'MEDIUM', language: 'en' })
    expect(result.test.id).toBe('t1')
    expect(result.questions).toHaveLength(1)
  })

  it('throws when AI generation fails immediately', async () => {
    mockFetch.mockResolvedValueOnce(okRes({ requestId: 'req1', status: 'FAILED' }))
    await expect(
      apiGenerateAndInjectQuestions('l1', { questionCount: 5, difficulty: 'MEDIUM', language: 'en' })
    ).rejects.toThrow('AI generation failed')
  })

  it('throws when poll returns FAILED status with error message', async () => {
    const aiResponse = { requestId: 'req1', status: 'PENDING' }
    const aiStatus = { requestId: 'req1', status: 'FAILED', error: 'Poll failed reason' }
    mockFetch
      .mockResolvedValueOnce(okRes(aiResponse))  // initiate
      .mockResolvedValueOnce(okRes(aiStatus))    // poll returns FAILED
    await expect(
      apiGenerateAndInjectQuestions('l1', { questionCount: 5, difficulty: 'MEDIUM', language: 'en' })
    ).rejects.toThrow('Poll failed reason')
  })

  it('throws when poll returns FAILED with no error message', async () => {
    const aiResponse = { requestId: 'req1', status: 'PENDING' }
    const aiStatus = { requestId: 'req1', status: 'FAILED' }
    mockFetch
      .mockResolvedValueOnce(okRes(aiResponse))  // initiate
      .mockResolvedValueOnce(okRes(aiStatus))    // poll returns FAILED, no error field
    await expect(
      apiGenerateAndInjectQuestions('l1', { questionCount: 5, difficulty: 'MEDIUM', language: 'en' })
    ).rejects.toThrow('AI generation failed')
  })

  it('polls multiple times before DONE', async () => {
    vi.useFakeTimers()
    const aiResponse = { requestId: 'req1', status: 'PENDING' }
    const pendingStatus = { requestId: 'req1', status: 'PENDING' }
    const aiStatus = { requestId: 'req1', status: 'DONE' }
    const injection = { testId: 't1', injected: 5, skipped: 0, requestId: 'req1' }
    mockFetch
      .mockResolvedValueOnce(okRes(aiResponse))   // initiate
      .mockResolvedValueOnce(okRes(pendingStatus)) // poll 1 - PENDING
      .mockResolvedValueOnce(okRes(aiStatus))      // poll 2 - DONE
      .mockResolvedValueOnce(okRes(injection))     // inject
      .mockResolvedValueOnce(okRes(rawTest))        // getTestDetails
      .mockResolvedValueOnce(okRes([rawQuestion])) // getEditableQuestions

    const { refreshAccessToken } = await import('@/lib/fetchWithAuth')
    vi.mocked(refreshAccessToken).mockResolvedValue(undefined as never)

    const resultPromise = apiGenerateAndInjectQuestions('l1', { questionCount: 5, difficulty: 'MEDIUM', language: 'en' })
    // Advance all timers to handle the sleep
    await vi.runAllTimersAsync()
    const result = await resultPromise
    expect(result.test.id).toBe('t1')
    vi.useRealTimers()
  })
})
