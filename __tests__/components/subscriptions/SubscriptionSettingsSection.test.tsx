import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/lib/subscriptions/api', () => ({
  getSubscriptionPlans: vi.fn().mockReturnValue(new Promise(() => {})),
  getCurrentOrganizationSubscription: vi.fn(),
  createSubscriptionCheckoutSession: vi.fn(),
  changeOrganizationSubscriptionPlan: vi.fn(),
}))

vi.mock('@/store/hooks', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) =>
    selector({ auth: { accessToken: 'tok', organization: { id: 'org1' }, user: { organizationId: 'org1' } } }),
}))

vi.mock('@/components/subscriptions/PlanSelector', () => ({
  default: ({ onPlanSelect }: { onPlanSelect: (plan: unknown, meta: { source: string }) => void; compact?: boolean; selectedPlanId?: string; currentPlanId?: string; actionLabel?: string }) =>
    React.createElement('div', null,
      React.createElement('button', {
        'data-testid': 'select-plan',
        onClick: () => onPlanSelect({ id: 'plan-pro', displayName: 'Pro', priceMonthly: 29, currency: 'USD' }, { source: 'user' }),
      }, 'Select Pro Plan'),
    ),
}))

import React from 'react'
import {
  getCurrentOrganizationSubscription,
  changeOrganizationSubscriptionPlan,
  createSubscriptionCheckoutSession,
} from '@/lib/subscriptions/api'
import SubscriptionSettingsSection from '@/components/subscriptions/SubscriptionSettingsSection'

const mockGetCurrent = vi.mocked(getCurrentOrganizationSubscription)
const mockChangePlan = vi.mocked(changeOrganizationSubscriptionPlan)
const mockCheckout = vi.mocked(createSubscriptionCheckoutSession)

const mockSubscription = {
  plan: { id: 'plan-free', displayName: 'Free', priceMonthly: 0, currency: 'USD' },
  status: 'ACTIVE',
  currentPeriodStart: '2024-01-01',
  currentPeriodEnd: '2024-12-31',
}

describe('SubscriptionSettingsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    mockGetCurrent.mockReturnValue(new Promise(() => {}))
    render(<SubscriptionSettingsSection />)
    expect(screen.getByText('Loading current subscription...')).toBeInTheDocument()
  })

  it('shows error when subscription fetch fails', async () => {
    mockGetCurrent.mockRejectedValue(new Error('Subscription error'))
    render(<SubscriptionSettingsSection />)
    expect(await screen.findByText('Subscription error')).toBeInTheDocument()
  })

  it('renders subscription plan heading', async () => {
    mockGetCurrent.mockResolvedValue(mockSubscription)
    render(<SubscriptionSettingsSection />)
    expect(await screen.findByText('Subscription Plan')).toBeInTheDocument()
  })

  it('shows current plan info after loading', async () => {
    mockGetCurrent.mockResolvedValue(mockSubscription)
    render(<SubscriptionSettingsSection />)
    expect(await screen.findByText('Free')).toBeInTheDocument()
    expect(screen.getByText(/Status: ACTIVE/)).toBeInTheDocument()
  })

  it('shows action buttons after loading', async () => {
    mockGetCurrent.mockResolvedValue(mockSubscription)
    render(<SubscriptionSettingsSection />)
    await screen.findByText('Subscription Plan')
    expect(screen.getByText('Checkout')).toBeInTheDocument()
    expect(screen.getByText('Change plan')).toBeInTheDocument()
  })

  it('shows no subscription message when null', async () => {
    mockGetCurrent.mockResolvedValue(null as never)
    render(<SubscriptionSettingsSection />)
    await screen.findByText('Subscription Plan')
    expect(screen.getByText('No current subscription loaded.')).toBeInTheDocument()
  })

  it('opens action modal when Checkout clicked', async () => {
    mockGetCurrent.mockResolvedValue(mockSubscription)
    render(<SubscriptionSettingsSection />)
    await screen.findByText('Checkout')
    fireEvent.click(screen.getAllByText('Checkout')[0])
    expect(screen.getByLabelText('Close subscription action')).toBeInTheDocument()
  })

  it('closes action modal when Close is clicked', async () => {
    mockGetCurrent.mockResolvedValue(mockSubscription)
    render(<SubscriptionSettingsSection />)
    await screen.findByText('Checkout')
    fireEvent.click(screen.getAllByText('Checkout')[0])
    expect(screen.getByLabelText('Close subscription action')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Close subscription action'))
    expect(screen.queryByLabelText('Close subscription action')).not.toBeInTheDocument()
  })

  it('opens Change plan modal and shows confirm button', async () => {
    mockGetCurrent.mockResolvedValue(mockSubscription)
    render(<SubscriptionSettingsSection />)
    await screen.findByText('Change plan')
    fireEvent.click(screen.getAllByText('Change plan')[0])
    expect(screen.getByText('Confirm change')).toBeInTheDocument()
  })

  it('shows plan notice when user selects a plan', async () => {
    mockGetCurrent.mockResolvedValue(mockSubscription)
    render(<SubscriptionSettingsSection />)
    await screen.findByText('Subscription Plan')
    fireEvent.click(screen.getByTestId('select-plan'))
    await waitFor(() => {
      expect(screen.getByText(/Plan selected/)).toBeInTheDocument()
    })
  })

  it('handles plan change successfully', async () => {
    mockGetCurrent.mockResolvedValue(mockSubscription)
    mockChangePlan.mockResolvedValue(undefined as never)
    render(<SubscriptionSettingsSection />)
    await screen.findByText('Change plan')
    fireEvent.click(screen.getByTestId('select-plan'))
    fireEvent.click(screen.getByText('Change plan'))
    const confirmBtn = screen.getByText('Confirm change')
    fireEvent.click(confirmBtn)
    await waitFor(() => {
      expect(mockChangePlan).toHaveBeenCalled()
    })
  })
})
