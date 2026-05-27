import { describe, it, expect } from 'vitest'
import { ENDPOINTS } from '@/lib/api-endpoints'

describe('ENDPOINTS', () => {
  it('has auth endpoints', () => {
    expect(ENDPOINTS.auth.login).toBe('/api/v1/auth/login')
    expect(ENDPOINTS.auth.refresh).toBe('/api/v1/auth/refresh')
    expect(ENDPOINTS.auth.csrf).toBe('/api/v1/auth/csrf')
    expect(ENDPOINTS.auth.logout).toBe('/api/v1/auth/logout')
  })

  it('has users endpoints', () => {
    expect(ENDPOINTS.users.list).toBe('/api/v1/users')
    expect(ENDPOINTS.users.byId('u1')).toBe('/api/v1/users/u1')
    expect(ENDPOINTS.users.status('u1')).toBe('/api/v1/users/u1/status')
    expect(ENDPOINTS.users.changePassword('u1')).toBe('/api/v1/users/u1/change-password')
  })

  it('has organizations endpoints', () => {
    expect(ENDPOINTS.organizations.list).toBe('/api/v1/organizations')
    expect(ENDPOINTS.organizations.byId('o1')).toBe('/api/v1/organizations/o1')
    expect(ENDPOINTS.organizations.subscription('o1')).toBe('/api/v1/organizations/o1/subscription')
    expect(ENDPOINTS.organizations.subscriptionCheckout('o1')).toBe('/api/v1/organizations/o1/subscription/checkout')
  })

  it('has courses endpoints', () => {
    expect(ENDPOINTS.courses.public).toBe('/api/v1/courses/public')
    expect(ENDPOINTS.courses.myCourses).toBe('/api/v1/courses/my-courses')
    expect(typeof ENDPOINTS.courses.byId).toBe('function')
    expect(ENDPOINTS.courses.byId('c1')).toBe('/api/v1/courses/c1')
  })

  it('has subscriptionPlans endpoint', () => {
    expect(ENDPOINTS.subscriptionPlans).toBe('/api/v1/subscription-plans')
  })
})
