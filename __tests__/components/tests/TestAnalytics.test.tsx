import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/lib/tests/api', () => ({
  apiGetTestAnalytics: vi.fn(),
}))

import { apiGetTestAnalytics } from '@/lib/tests/api'
import TestAnalytics from '@/components/tests/TestAnalytics'

const mockAnalytics = vi.mocked(apiGetTestAnalytics)

const analyticsData = {
  title: 'Test Analytics Report',
  attemptsCount: 42,
  averageScore: 75.5,
  passRate: 80,
  failureRate: 20,
  classAverage: 72,
  bestScore: 100,
  worstScore: 30,
  passedCount: 34,
  failedCount: 8,
}

describe('TestAnalytics', () => {
  it('shows loading state initially', () => {
    mockAnalytics.mockReturnValue(new Promise(() => {}))
    render(<TestAnalytics testId="t1" />)
    expect(screen.getByText('Loading analytics...')).toBeInTheDocument()
  })

  it('renders analytics data after loading', async () => {
    mockAnalytics.mockResolvedValue(analyticsData)
    render(<TestAnalytics testId="t1" />)
    expect(await screen.findByText('Test Analytics Report')).toBeInTheDocument()
  })

  it('renders attempts count', async () => {
    mockAnalytics.mockResolvedValue(analyticsData)
    render(<TestAnalytics testId="t1" />)
    expect(await screen.findByText('42')).toBeInTheDocument()
  })

  it('renders pass rate', async () => {
    mockAnalytics.mockResolvedValue(analyticsData)
    render(<TestAnalytics testId="t1" />)
    await screen.findByText('Test Analytics Report')
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('renders passed and failed counts', async () => {
    mockAnalytics.mockResolvedValue(analyticsData)
    render(<TestAnalytics testId="t1" />)
    expect(await screen.findByText('34')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('shows error state on failure', async () => {
    mockAnalytics.mockRejectedValue(new Error('Network error'))
    render(<TestAnalytics testId="t1" />)
    expect(await screen.findByText('Failed to load analytics')).toBeInTheDocument()
    expect(screen.getByText('Network error')).toBeInTheDocument()
  })
})
