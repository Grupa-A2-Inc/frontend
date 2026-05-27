import { describe, it, expect } from 'vitest'
import { dashboardStatsFallback } from '@/lib/admin-dashboard/mock'

describe('dashboardStatsFallback', () => {
  it('has all numeric fields initialized to 0', () => {
    expect(dashboardStatsFallback.totalStudents).toBe(0)
    expect(dashboardStatsFallback.totalTeachers).toBe(0)
    expect(dashboardStatsFallback.totalClasses).toBe(0)
  })
})
