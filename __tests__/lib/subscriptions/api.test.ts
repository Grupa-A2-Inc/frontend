import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getSubscriptionPlans, getCurrentOrganizationSubscription, createSubscriptionCheckoutSession, changeOrganizationSubscriptionPlan } from '@/lib/subscriptions/api'

vi.mock('@/lib/fetchWithAuth', () => ({ fetchWithAuth: vi.fn() }))
import { fetchWithAuth } from '@/lib/fetchWithAuth'
const mockFetch = fetchWithAuth as ReturnType<typeof vi.fn>

const mockGlobalFetch = vi.fn()
vi.stubGlobal('fetch', mockGlobalFetch)

function okRes(body: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) } as unknown as Response
}
function errRes(status: number) {
  return { ok: false, status, json: () => Promise.resolve({ message: `Error ${status}` }) } as unknown as Response
}

const validPlan = {
  id: 'p1', code: 'BASIC', displayName: 'Basic', maxUsers: 10, maxClassrooms: 5,
  maxCourses: 20, hasPremiumFeatures: false, priceMonthly: 9.99, currency: 'EUR',
}

beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
})

describe('getSubscriptionPlans', () => {
  it('returns valid plans without token', async () => {
    mockGlobalFetch.mockResolvedValueOnce(okRes([validPlan]))
    const plans = await getSubscriptionPlans()
    expect(plans).toHaveLength(1)
    expect(plans[0].id).toBe('p1')
  })

  it('uses fetchWithAuth when token is available', async () => {
    localStorage.setItem('accessToken', 'tok')
    mockFetch.mockResolvedValueOnce(okRes([validPlan]))
    const plans = await getSubscriptionPlans()
    expect(plans).toHaveLength(1)
  })

  it('filters out invalid plan objects', async () => {
    mockGlobalFetch.mockResolvedValueOnce(okRes([validPlan, { id: 'bad' }]))
    const plans = await getSubscriptionPlans()
    expect(plans).toHaveLength(1)
  })

  it('throws when response is not array', async () => {
    mockGlobalFetch.mockResolvedValueOnce(okRes({ plans: [] }))
    await expect(getSubscriptionPlans()).rejects.toThrow('unexpected format')
  })

  it('throws on HTTP error', async () => {
    mockGlobalFetch.mockResolvedValueOnce(errRes(500))
    await expect(getSubscriptionPlans()).rejects.toThrow()
  })
})

describe('getCurrentOrganizationSubscription', () => {
  beforeEach(() => localStorage.setItem('accessToken', 'tok'))

  it('returns subscription status on success', async () => {
    const sub = { status: 'ACTIVE', planCode: 'BASIC' }
    mockFetch.mockResolvedValueOnce(okRes(sub))
    const result = await getCurrentOrganizationSubscription('o1')
    expect(result).toMatchObject({ status: 'ACTIVE' })
  })

  it('throws when no access token', async () => {
    localStorage.clear()
    await expect(getCurrentOrganizationSubscription('o1')).rejects.toThrow('Access token')
  })

  it('throws on HTTP error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(403))
    await expect(getCurrentOrganizationSubscription('o1')).rejects.toThrow()
  })
})

describe('createSubscriptionCheckoutSession', () => {
  beforeEach(() => localStorage.setItem('accessToken', 'tok'))

  it('returns checkout session on success', async () => {
    const session = { sessionId: 'sess1', url: 'https://checkout.example.com' }
    mockFetch.mockResolvedValueOnce(okRes(session))
    const result = await createSubscriptionCheckoutSession('o1', { planId: 'p1' })
    expect(result.sessionId).toBe('sess1')
  })

  it('throws when no access token', async () => {
    localStorage.clear()
    await expect(createSubscriptionCheckoutSession('o1', { planId: 'p1' })).rejects.toThrow()
  })
})

describe('changeOrganizationSubscriptionPlan', () => {
  beforeEach(() => localStorage.setItem('accessToken', 'tok'))

  it('returns updated subscription on success', async () => {
    const sub = { id: 'sub1', planId: 'p2' }
    mockFetch.mockResolvedValueOnce(okRes(sub))
    const result = await changeOrganizationSubscriptionPlan('o1', 'p2')
    expect(result).toMatchObject({ id: 'sub1' })
  })
})
