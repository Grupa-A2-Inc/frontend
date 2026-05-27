import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

const mockSelector = vi.fn()

vi.mock('@/store/hooks', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) => mockSelector(selector),
}))

vi.mock('@/lib/rewards/api', () => ({
  getRewardConfig: vi.fn(),
  saveRewardConfig: vi.fn(),
  getLatestRewardCycle: vi.fn(),
  calculateRewardCycle: vi.fn(),
  mintRewardCycle: vi.fn(),
}))

vi.mock('@/components/rewards/rewardFormat', () => ({
  formatDate: (v: string) => v ?? '-',
  formatTai: (v: number) => `${v ?? 0} TAI`,
  formatMoney: (v: number) => (v != null ? `€${v}` : '-'),
  shortAddress: (v: string) => v ? v.slice(0, 6) + '...' + v.slice(-4) : '-',
  statusClass: () => 'bg-green-500/10',
}))

import {
  getRewardConfig,
  saveRewardConfig,
  getLatestRewardCycle,
  calculateRewardCycle,
  mintRewardCycle,
} from '@/lib/rewards/api'
import AdminRewardsPage from '@/components/rewards/AdminRewardsPage'

const mockGetConfig = vi.mocked(getRewardConfig)
const mockSaveConfig = vi.mocked(saveRewardConfig)
const mockGetCycle = vi.mocked(getLatestRewardCycle)
const mockCalculate = vi.mocked(calculateRewardCycle)
const mockMint = vi.mocked(mintRewardCycle)

const mockAdminUser = { id: 'u1', role: 'ADMIN', organizationId: 'org1' }

const mockConfig = {
  minimumScore: 60,
  maximumWinners: 10,
  distributionPeriod: 'MONTHLY' as const,
  enabled: true,
}

const mockCycle = {
  id: 'c1',
  status: 'DRAFT' as const,
  subscriptionAmount: 100,
  rewardPoolAmount: 10,
  rewards: [
    { id: 'r1', studentId: 's1', rank: 1, score: 95, rewardAmount: 5, status: 'DRAFT' as const, createdAt: '2024-01-15', txHash: null },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({ auth: { user: mockAdminUser, organization: { id: 'org1' } } })
  )
})

describe('AdminRewardsPage', () => {
  it('shows loading state initially', () => {
    mockGetConfig.mockReturnValue(new Promise(() => {}))
    mockGetCycle.mockReturnValue(new Promise(() => {}))
    render(<AdminRewardsPage />)
    expect(screen.getByText(/Loading rewards/i)).toBeInTheDocument()
  })

  it('renders Rewards heading after loading', async () => {
    mockGetConfig.mockResolvedValue(mockConfig as never)
    mockGetCycle.mockResolvedValue(mockCycle as never)
    render(<AdminRewardsPage />)
    expect(await screen.findByText('Rewards')).toBeInTheDocument()
  })

  it('renders Organization Rules section', async () => {
    mockGetConfig.mockResolvedValue(mockConfig as never)
    mockGetCycle.mockResolvedValue(mockCycle as never)
    render(<AdminRewardsPage />)
    await screen.findByText('Rewards')
    expect(screen.getByText('Organization Rules')).toBeInTheDocument()
  })

  it('shows message when no organization is found', async () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({ auth: { user: { ...mockAdminUser, organizationId: '' }, organization: null } })
    )
    mockGetConfig.mockResolvedValue(mockConfig as never)
    mockGetCycle.mockResolvedValue(mockCycle as never)
    render(<AdminRewardsPage />)
    expect(await screen.findByText(/Organization was not found/i)).toBeInTheDocument()
  })

  it('saves config on form submit', async () => {
    mockGetConfig.mockResolvedValue(mockConfig as never)
    mockGetCycle.mockResolvedValue(mockCycle as never)
    mockSaveConfig.mockResolvedValue(mockConfig as never)
    render(<AdminRewardsPage />)
    await screen.findByText('Rewards')
    const form = document.querySelector('form')!
    fireEvent.submit(form)
    await waitFor(() => {
      expect(mockSaveConfig).toHaveBeenCalled()
    })
  })

  it('shows error when config save fails', async () => {
    mockGetConfig.mockResolvedValue(mockConfig as never)
    mockGetCycle.mockResolvedValue(mockCycle as never)
    mockSaveConfig.mockRejectedValue(new Error('Save failed'))
    render(<AdminRewardsPage />)
    await screen.findByText('Rewards')
    fireEvent.submit(document.querySelector('form')!)
    expect(await screen.findByText('Save failed')).toBeInTheDocument()
  })

  it('calculates reward cycle on button click', async () => {
    mockGetConfig.mockResolvedValue(mockConfig as never)
    mockGetCycle.mockResolvedValue(mockCycle as never)
    mockCalculate.mockResolvedValue(mockCycle as never)
    render(<AdminRewardsPage />)
    await screen.findByText('Rewards')
    fireEvent.click(screen.getByText('Calculate'))
    await waitFor(() => {
      expect(mockCalculate).toHaveBeenCalled()
    })
  })

  it('shows mint button for ADMIN user with a cycle', async () => {
    mockGetConfig.mockResolvedValue(mockConfig as never)
    mockGetCycle.mockResolvedValue(mockCycle as never)
    render(<AdminRewardsPage />)
    await screen.findByText('Rewards')
    expect(screen.getByText('Mint')).toBeInTheDocument()
  })

  it('mints rewards on button click', async () => {
    mockGetConfig.mockResolvedValue(mockConfig as never)
    mockGetCycle.mockResolvedValue(mockCycle as never)
    mockMint.mockResolvedValue({ ...mockCycle, status: 'MINTED' } as never)
    render(<AdminRewardsPage />)
    await screen.findByText('Rewards')
    fireEvent.click(screen.getByText('Mint'))
    await waitFor(() => {
      expect(mockMint).toHaveBeenCalled()
    })
  })

  it('renders reward table rows when cycle has rewards', async () => {
    mockGetConfig.mockResolvedValue(mockConfig as never)
    mockGetCycle.mockResolvedValue(mockCycle as never)
    render(<AdminRewardsPage />)
    await screen.findByText('Rewards')
    expect(screen.getByText('#1')).toBeInTheDocument()
  })
})
