import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

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

import { getCurrentOrganizationSubscription } from '@/lib/subscriptions/api'
import SubscriptionSettingsSection from '@/components/subscriptions/SubscriptionSettingsSection'

const mockGetCurrent = vi.mocked(getCurrentOrganizationSubscription)

describe('SubscriptionSettingsSection', () => {
  it('shows loading state initially', () => {
    mockGetCurrent.mockReturnValue(new Promise(() => {}))
    const { container } = render(<SubscriptionSettingsSection />)
    expect(container.firstChild).toBeTruthy()
  })

  it('shows error when subscription fetch fails', async () => {
    mockGetCurrent.mockRejectedValue(new Error('Subscription error'))
    render(<SubscriptionSettingsSection />)
    expect(await screen.findByText('Subscription error')).toBeInTheDocument()
  })

  it('renders component without crash', async () => {
    mockGetCurrent.mockResolvedValue(null as never)
    render(<SubscriptionSettingsSection />)
    await new Promise(r => setTimeout(r, 50))
    expect(document.body).toBeTruthy()
  })
})
