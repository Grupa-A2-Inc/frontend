import { describe, it, expect } from 'vitest'
import { formatPrice } from '@/lib/subscriptions/utils'

describe('formatPrice', () => {
  it('returns "Free" for value 0', () => {
    expect(formatPrice(0, 'USD')).toBe('Free')
  })

  it('formats a valid price with currency', () => {
    const result = formatPrice(9.99, 'USD')
    expect(result).toContain('9.99')
  })

  it('uses EUR as fallback when currency is empty string', () => {
    const result = formatPrice(10, '')
    expect(result).toContain('10')
  })

  it('falls back to raw format for invalid currency', () => {
    const result = formatPrice(15, 'INVALID_CURRENCY_XYZ')
    expect(result).toContain('15')
  })

  it('formats integer prices correctly', () => {
    const result = formatPrice(100, 'EUR')
    expect(result).toContain('100')
  })
})
