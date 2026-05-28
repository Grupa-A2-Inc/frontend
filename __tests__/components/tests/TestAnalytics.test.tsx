import { beforeEach, describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

vi.mock('@/lib/tests/api', () => ({
  apiGetTestAnalytics: vi.fn(),
  apiGetTestFailureRate: vi.fn(),
  apiSetTestAlertThreshold: vi.fn(),
}))

import {
  apiGetTestAnalytics,
  apiGetTestFailureRate,
  apiSetTestAlertThreshold,
} from '@/lib/tests/api'
import TestAnalytics from '@/components/tests/TestAnalytics'

const mockAnalytics = vi.mocked(apiGetTestAnalytics)
const mockFailureRate = vi.mocked(apiGetTestFailureRate)
const mockSetThreshold = vi.mocked(apiSetTestAlertThreshold)

const analyticsData = {
  testId: 't1',
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

const failureRateData = {
  failureRate: 20,
  threshold: 50,
  alertTriggered: false,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockFailureRate.mockResolvedValue(failureRateData)
  mockSetThreshold.mockResolvedValue({
    alertId: 'a1',
    testId: 't1',
    professorId: 'p1',
    failureThreshold: 55,
    currentFailureRate: 60,
    isActive: true,
  })
})

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

  it('renders alert threshold controls', async () => {
    mockAnalytics.mockResolvedValue(analyticsData)
    render(<TestAnalytics testId="t1" />)

    expect(await screen.findByText('Failure alert threshold')).toBeInTheDocument()
    expect(screen.getByLabelText('Failure threshold (%)')).toHaveValue(50)
    expect(screen.getByText('Within threshold')).toBeInTheDocument()
  })

  it('saves alert threshold', async () => {
    mockAnalytics.mockResolvedValue(analyticsData)
    render(<TestAnalytics testId="t1" />)

    const input = await screen.findByLabelText('Failure threshold (%)')
    fireEvent.change(input, { target: { value: '55' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save threshold' }))

    await waitFor(() => {
      expect(mockSetThreshold).toHaveBeenCalledWith('t1', 55)
    })
    expect(await screen.findByText('Alert threshold saved.')).toBeInTheDocument()
    expect(screen.getByText('Triggered')).toBeInTheDocument()
  })

  it('validates threshold range before saving', async () => {
    mockAnalytics.mockResolvedValue(analyticsData)
    render(<TestAnalytics testId="t1" />)

    const input = await screen.findByLabelText('Failure threshold (%)')
    fireEvent.change(input, { target: { value: '120' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save threshold' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Threshold must be between 0 and 100.')
    expect(mockSetThreshold).not.toHaveBeenCalled()
  })
})
