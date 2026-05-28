import { describe, expect, it } from 'vitest'

import {
  countCourseTests,
  resolveStudentTestTotals,
} from '@/lib/analytics/courseStats'

describe('countCourseTests', () => {
  it('counts unique lesson test ids', () => {
    const course = {
      chapters: [
        {
          lessons: [
            { testId: 't1' },
            { testId: 't2' },
            { testId: null },
          ],
        },
        {
          lessons: [
            { testId: 't2' },
            { testId: 't3' },
          ],
        },
      ],
    }

    expect(countCourseTests(course)).toBe(3)
  })

  it('returns zero for courses without tests', () => {
    expect(countCourseTests({ chapters: [{ lessons: [{ testId: null }] }] })).toBe(0)
    expect(countCourseTests(null)).toBe(0)
  })
})

describe('resolveStudentTestTotals', () => {
  const stats = {
    totalTestCount: 26,
    totalTestDone: 3,
    totalTestPassed: 2,
  }

  it('prefers the real course test count when available', () => {
    expect(resolveStudentTestTotals(stats, 1)).toEqual({
      total: 1,
      done: 1,
      passed: 1,
    })
  })

  it('falls back to backend totals when course test count is unavailable', () => {
    expect(resolveStudentTestTotals(stats, 0)).toEqual({
      total: 26,
      done: 3,
      passed: 2,
    })
  })
})
