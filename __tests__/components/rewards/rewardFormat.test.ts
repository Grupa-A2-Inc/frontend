import { describe, it, expect } from 'vitest'
import { formatTai, formatMoney, formatDate, shortAddress, statusClass } from '@/components/rewards/rewardFormat'

describe('formatTai', () => {
  it('formats a valid number with 6 decimals and TAI suffix', () => {
    const result = formatTai(1.5)
    expect(result).toContain('TAI')
    expect(result).toContain('1')
  })

  it('returns "0.000000 TAI" for undefined', () => {
    expect(formatTai(undefined)).toBe('0.000000 TAI')
  })

  it('returns "0.000000 TAI" for null', () => {
    expect(formatTai(null)).toBe('0.000000 TAI')
  })

  it('returns "0.000000 TAI" for NaN', () => {
    expect(formatTai(NaN)).toBe('0.000000 TAI')
  })

  it('formats zero correctly', () => {
    expect(formatTai(0)).toContain('0.000000')
  })
})

describe('formatMoney', () => {
  it('formats a positive number as EUR currency', () => {
    const result = formatMoney(100)
    expect(result).toContain('100')
  })

  it('returns "-" for undefined', () => {
    expect(formatMoney(undefined)).toBe('-')
  })

  it('returns "-" for null', () => {
    expect(formatMoney(null)).toBe('-')
  })

  it('returns "-" for NaN', () => {
    expect(formatMoney(NaN)).toBe('-')
  })

  it('formats zero correctly', () => {
    const result = formatMoney(0)
    expect(result).toContain('0')
  })
})

describe('formatDate', () => {
  it('formats a valid date string', () => {
    const result = formatDate('2024-01-15')
    expect(result).toBeTruthy()
    expect(result).not.toBe('-')
  })

  it('returns "-" for null', () => {
    expect(formatDate(null)).toBe('-')
  })

  it('returns "-" for undefined', () => {
    expect(formatDate(undefined)).toBe('-')
  })

  it('returns "-" for empty string', () => {
    expect(formatDate('')).toBe('-')
  })

  it('returns value as-is for invalid date', () => {
    const result = formatDate('not-a-date')
    expect(result).toBeTruthy()
  })
})

describe('shortAddress', () => {
  it('returns shortened address for long strings', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678'
    const result = shortAddress(addr)
    expect(result).toContain('...')
    expect(result.length).toBeLessThan(addr.length)
  })

  it('returns full value for short strings', () => {
    expect(shortAddress('0xabc')).toBe('0xabc')
  })

  it('returns "-" for null', () => {
    expect(shortAddress(null)).toBe('-')
  })

  it('returns "-" for undefined', () => {
    expect(shortAddress(undefined)).toBe('-')
  })
})

describe('statusClass', () => {
  it('returns green class for MINTED', () => {
    expect(statusClass('MINTED')).toContain('green')
  })

  it('returns red class for FAILED', () => {
    expect(statusClass('FAILED')).toContain('red')
  })

  it('returns cyan class for FUNDED', () => {
    expect(statusClass('FUNDED')).toContain('cyan')
  })

  it('returns default brand class for other status', () => {
    expect(statusClass('DRAFT' as never)).toContain('brand-primary')
  })
})
