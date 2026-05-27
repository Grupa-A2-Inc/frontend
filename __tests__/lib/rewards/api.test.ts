import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/fetchWithAuth', () => ({
  fetchWithAuth: vi.fn(),
}))

vi.stubGlobal('localStorage', {
  getItem: (key: string) => key === 'accessToken' ? 'tok' : null,
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
})

import { fetchWithAuth } from '@/lib/fetchWithAuth'
import {
  getRewardConfig,
  saveRewardConfig,
  getLatestRewardCycle,
  calculateRewardCycle,
  mintRewardCycle,
  getStudentRewardHistory,
  saveStudentWallet,
} from '@/lib/rewards/api'

const mockFetch = fetchWithAuth as ReturnType<typeof vi.fn>

function okRes(body: unknown) {
  return { ok: true, status: 200, json: () => Promise.resolve(body) } as unknown as Response
}
function errRes(status = 500, message = 'Error') {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({ message }),
  } as unknown as Response
}
function errWithError(status = 400) {
  return {
    ok: false,
    status,
    json: () => Promise.resolve({ error: 'Custom error' }),
  } as unknown as Response
}
function errBadJson(status = 500) {
  return {
    ok: false,
    status,
    json: () => Promise.reject(new Error('bad json')),
  } as unknown as Response
}

beforeEach(() => vi.clearAllMocks())

describe('getRewardConfig', () => {
  it('returns reward config on success', async () => {
    const config = { minimumScore: 60, maximumWinners: 10, enabled: true }
    mockFetch.mockResolvedValueOnce(okRes(config))
    const result = await getRewardConfig('org1')
    expect(result).toEqual(config)
  })

  it('throws on error response', async () => {
    mockFetch.mockResolvedValueOnce(errRes(500, 'Server error'))
    await expect(getRewardConfig('org1')).rejects.toThrow('Server error')
  })

  it('throws with error field on error response', async () => {
    mockFetch.mockResolvedValueOnce(errWithError(400))
    await expect(getRewardConfig('org1')).rejects.toThrow('Custom error')
  })

  it('throws with status fallback when json fails', async () => {
    mockFetch.mockResolvedValueOnce(errBadJson(503))
    await expect(getRewardConfig('org1')).rejects.toThrow('503')
  })
})

describe('saveRewardConfig', () => {
  it('returns saved config on success', async () => {
    const config = { minimumScore: 70, maximumWinners: 5, enabled: false }
    mockFetch.mockResolvedValueOnce(okRes(config))
    const result = await saveRewardConfig('org1', { minimumScore: 70, maximumWinners: 5, distributionPeriod: 'MONTHLY', enabled: false })
    expect(result).toEqual(config)
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(400, 'Bad request'))
    await expect(saveRewardConfig('org1', { minimumScore: 0, maximumWinners: 1, distributionPeriod: 'MONTHLY', enabled: true })).rejects.toThrow('Bad request')
  })
})

describe('getLatestRewardCycle', () => {
  it('returns reward cycle on success', async () => {
    const cycle = { id: 'c1', status: 'MINTED' }
    mockFetch.mockResolvedValueOnce(okRes(cycle))
    const result = await getLatestRewardCycle('org1')
    expect(result).toEqual(cycle)
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(404, 'Not found'))
    await expect(getLatestRewardCycle('org1')).rejects.toThrow('Not found')
  })
})

describe('calculateRewardCycle', () => {
  it('returns calculated cycle on success', async () => {
    const cycle = { id: 'c2', status: 'DRAFT' }
    mockFetch.mockResolvedValueOnce(okRes(cycle))
    const result = await calculateRewardCycle('org1', { startDate: '2024-01-01', endDate: '2024-01-31' })
    expect(result).toEqual(cycle)
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(500))
    await expect(calculateRewardCycle('org1', { startDate: '2024-01-01', endDate: '2024-01-31' })).rejects.toThrow()
  })
})

describe('mintRewardCycle', () => {
  it('returns minted cycle on success', async () => {
    const cycle = { id: 'c3', status: 'MINTED' }
    mockFetch.mockResolvedValueOnce(okRes(cycle))
    const result = await mintRewardCycle('c3')
    expect(result).toEqual(cycle)
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(500))
    await expect(mintRewardCycle('c3')).rejects.toThrow()
  })
})

describe('getStudentRewardHistory', () => {
  it('returns student rewards on success', async () => {
    const rewards = [{ id: 'r1', amount: 5 }]
    mockFetch.mockResolvedValueOnce(okRes(rewards))
    const result = await getStudentRewardHistory('s1')
    expect(result).toEqual(rewards)
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(403, 'Forbidden'))
    await expect(getStudentRewardHistory('s1')).rejects.toThrow('Forbidden')
  })
})

describe('saveStudentWallet', () => {
  it('returns wallet response on success', async () => {
    const wallet = { walletAddress: '0xabc' }
    mockFetch.mockResolvedValueOnce(okRes(wallet))
    const result = await saveStudentWallet('0xabc')
    expect(result).toEqual(wallet)
  })

  it('throws on error', async () => {
    mockFetch.mockResolvedValueOnce(errRes(400, 'Invalid address'))
    await expect(saveStudentWallet('invalid')).rejects.toThrow('Invalid address')
  })
})
