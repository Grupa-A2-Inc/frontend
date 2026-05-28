import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/subscriptions/api', () => ({
  getSubscriptionPlans: vi.fn(),
}))

import { getSubscriptionPlans } from '@/lib/subscriptions/api'
import PlanSelector from '@/components/subscriptions/PlanSelector'
import type { SubscriptionPlan } from '@/lib/subscriptions/types'

const mockGetPlans = vi.mocked(getSubscriptionPlans)

const plans: SubscriptionPlan[] = [
  { id: 'p1', code: 'FREE', displayName: 'Free', priceMonthly: 0, currency: 'USD', maxUsers: 10, maxClassrooms: 2, maxCourses: 5, hasPremiumFeatures: false },
  { id: 'p2', code: 'PRO', displayName: 'Pro', priceMonthly: 49, currency: 'USD', maxUsers: 100, maxClassrooms: 20, maxCourses: 50, hasPremiumFeatures: true },
]

const fourPlans: SubscriptionPlan[] = [
  ...plans,
  { id: 'p3', code: 'SCALE', displayName: 'Scale', priceMonthly: 99, currency: 'USD', maxUsers: 500, maxClassrooms: 100, maxCourses: 250, hasPremiumFeatures: true },
  { id: 'p4', code: 'ENTERPRISE', displayName: 'Enterprise', priceMonthly: null, currency: 'USD', maxUsers: null, maxClassrooms: null, maxCourses: null, hasPremiumFeatures: true },
]

describe('PlanSelector', () => {
  it('shows loading skeleton initially', () => {
    mockGetPlans.mockReturnValue(new Promise(() => {}))
    const { container } = render(<PlanSelector />)
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders plan cards after loading', async () => {
    mockGetPlans.mockResolvedValue(plans)
    render(<PlanSelector />)
    expect((await screen.findAllByText('Free')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Pro').length).toBeGreaterThan(0)
  })

  it('renders all four backend plans including custom enterprise plans', async () => {
    mockGetPlans.mockResolvedValue(fourPlans)
    render(<PlanSelector />)

    expect(await screen.findByRole('heading', { name: 'Free' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pro' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Scale' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Enterprise' })).toBeInTheDocument()
  })

  it('shows error when fetch fails', async () => {
    mockGetPlans.mockRejectedValue(new Error('Failed to load'))
    render(<PlanSelector />)
    expect(await screen.findByText('Failed to load')).toBeInTheDocument()
  })

  it('shows empty state when no plans', async () => {
    mockGetPlans.mockResolvedValue([])
    render(<PlanSelector />)
    expect(await screen.findByText('No subscription plans are available.')).toBeInTheDocument()
  })

  it('marks currentPlanId as current', async () => {
    mockGetPlans.mockResolvedValue(plans)
    render(<PlanSelector currentPlanId="p1" />)
    expect(await screen.findByText('Current plan')).toBeInTheDocument()
  })
})
