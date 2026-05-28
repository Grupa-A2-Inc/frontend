import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import PlanCard from '@/components/subscriptions/PlanCard'
import type { SubscriptionPlan } from '@/lib/subscriptions/types'

const plan: SubscriptionPlan = {
  id: 'p1',
  code: 'BASIC',
  displayName: 'Basic Plan',
  priceMonthly: 29,
  currency: 'USD',
  maxUsers: 50,
  maxClassrooms: 10,
  maxCourses: 20,
  hasPremiumFeatures: false,
}

const premiumPlan: SubscriptionPlan = { ...plan, id: 'p2', displayName: 'Premium Plan', hasPremiumFeatures: true, priceMonthly: 0 }

describe('PlanCard', () => {
  it('renders plan name', () => {
    render(<PlanCard plan={plan} />)
    expect(screen.getByText('Basic Plan')).toBeInTheDocument()
  })

  it('renders plan price', () => {
    render(<PlanCard plan={plan} />)
    expect(screen.getByText('$29.00')).toBeInTheDocument()
  })

  it('renders Free for 0 price', () => {
    render(<PlanCard plan={premiumPlan} />)
    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('renders Premium badge for premium plan', () => {
    render(<PlanCard plan={premiumPlan} />)
    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('does not render Premium badge for non-premium', () => {
    render(<PlanCard plan={plan} />)
    expect(screen.queryByText('Premium')).not.toBeInTheDocument()
  })

  it('shows Choose plan button by default', () => {
    render(<PlanCard plan={plan} />)
    expect(screen.getByRole('button', { name: 'Choose plan' })).toBeInTheDocument()
  })

  it('shows Current plan when current=true', () => {
    render(<PlanCard plan={plan} selected={true} current={true} />)
    expect(screen.getByRole('button', { name: 'Current plan' })).toBeInTheDocument()
  })

  it('disables button when the selected plan is current', () => {
    render(<PlanCard plan={plan} selected={true} current={true} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not style an unselected current plan as selected', () => {
    const { container } = render(<PlanCard plan={plan} current={true} />)
    expect(container.querySelector('article')).not.toHaveClass('bg-brand-primary/10')
    expect(screen.getByRole('button', { name: 'Select current plan' })).toBeEnabled()
  })

  it('calls onSelect when button clicked', () => {
    const onSelect = vi.fn()
    render(<PlanCard plan={plan} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onSelect).toHaveBeenCalledWith(plan)
  })

  it('renders user/classroom/course limits', () => {
    render(<PlanCard plan={plan} />)
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('renders custom pricing and unlimited limits', () => {
    render(
      <PlanCard
        plan={{
          ...premiumPlan,
          priceMonthly: null,
          maxUsers: null,
          maxClassrooms: null,
          maxCourses: null,
        }}
      />
    )

    expect(screen.getByText('Custom')).toBeInTheDocument()
    expect(screen.getAllByText('Unlimited')).toHaveLength(3)
  })
})
