import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

const mockSelector = vi.fn()

vi.mock('@/store/hooks', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) => mockSelector(selector),
}))

vi.mock('@/lib/rewards/api', () => ({
  getStudentRewardHistory: vi.fn(),
  saveStudentWallet: vi.fn(),
}))

vi.mock('@/components/rewards/rewardFormat', () => ({
  formatDate: (v: string) => v ?? '-',
  formatTai: (v: number) => `${v ?? 0} TAI`,
  shortAddress: (v: string) => v ? v.slice(0, 6) + '...' + v.slice(-4) : '-',
  statusClass: () => 'bg-green-500/10',
}))

import { getStudentRewardHistory, saveStudentWallet } from '@/lib/rewards/api'
import StudentRewardsPage from '@/components/rewards/StudentRewardsPage'

const mockGetHistory = vi.mocked(getStudentRewardHistory)
const mockSaveWallet = vi.mocked(saveStudentWallet)

const mockUser = { id: 'u1', role: 'STUDENT', firstName: 'Student', lastName: 'Test' }

const mockReward = {
  id: 'r1',
  rank: 1,
  score: 95.5,
  rewardAmount: 10.5,
  status: 'MINTED',
  createdAt: '2024-01-15',
  txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({ auth: { user: mockUser } })
  )
})

describe('StudentRewardsPage', () => {
  it('shows loading state initially', () => {
    mockGetHistory.mockReturnValue(new Promise(() => {}))
    render(<StudentRewardsPage />)
    expect(screen.getByText(/Loading rewards/i)).toBeInTheDocument()
  })

  it('renders My Rewards heading after loading', async () => {
    mockGetHistory.mockResolvedValue([])
    render(<StudentRewardsPage />)
    expect(await screen.findByText('My Rewards')).toBeInTheDocument()
  })

  it('shows empty state message when no rewards', async () => {
    mockGetHistory.mockResolvedValue([])
    render(<StudentRewardsPage />)
    await screen.findByText('My Rewards')
    expect(screen.getByText('No rewards yet.')).toBeInTheDocument()
  })

  it('shows error when loading fails', async () => {
    mockGetHistory.mockRejectedValue(new Error('Load failed'))
    render(<StudentRewardsPage />)
    expect(await screen.findByText('Load failed')).toBeInTheDocument()
  })

  it('renders reward row when rewards are loaded', async () => {
    mockGetHistory.mockResolvedValue([mockReward])
    render(<StudentRewardsPage />)
    await screen.findByText('My Rewards')
    expect(screen.getByText('MINTED')).toBeInTheDocument()
    expect(screen.getByText('#1')).toBeInTheDocument()
  })

  it('renders wallet section', async () => {
    mockGetHistory.mockResolvedValue([])
    render(<StudentRewardsPage />)
    await screen.findByText('My Rewards')
    expect(screen.getByText('Wallet')).toBeInTheDocument()
    expect(screen.getByText('Save wallet')).toBeInTheDocument()
  })

  it('shows validation error for invalid wallet address', async () => {
    mockGetHistory.mockResolvedValue([])
    render(<StudentRewardsPage />)
    await screen.findByText('My Rewards')
    const input = screen.getByPlaceholderText('0x...')
    fireEvent.change(input, { target: { value: 'invalid-address' } })
    fireEvent.submit(input.closest('form')!)
    expect(await screen.findByText(/valid EVM address/i)).toBeInTheDocument()
  })

  it('saves wallet successfully', async () => {
    mockGetHistory.mockResolvedValue([])
    mockSaveWallet.mockResolvedValue({ walletAddress: '0xabc123def456abc123def456abc123def456abc1' } as never)
    render(<StudentRewardsPage />)
    await screen.findByText('My Rewards')
    const input = screen.getByPlaceholderText('0x...')
    fireEvent.change(input, { target: { value: '0xabc123def456abc123def456abc123def456abc1' } })
    fireEvent.submit(input.closest('form')!)
    await waitFor(() => {
      expect(mockSaveWallet).toHaveBeenCalled()
    })
  })

  it('shows save error when wallet save fails', async () => {
    mockGetHistory.mockResolvedValue([])
    mockSaveWallet.mockRejectedValue(new Error('Save failed'))
    render(<StudentRewardsPage />)
    await screen.findByText('My Rewards')
    const input = screen.getByPlaceholderText('0x...')
    fireEvent.change(input, { target: { value: '0xabc123def456abc123def456abc123def456abc1' } })
    fireEvent.submit(input.closest('form')!)
    expect(await screen.findByText('Save failed')).toBeInTheDocument()
  })

  it('renders without user (no history loaded)', async () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({ auth: { user: null } })
    )
    mockGetHistory.mockResolvedValue([])
    render(<StudentRewardsPage />)
    expect(await screen.findByText('My Rewards')).toBeInTheDocument()
  })
})
