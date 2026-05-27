import { describe, it, expect } from 'vitest'
import { API_BASE } from '@/lib/config'

describe('API_BASE', () => {
  it('is a non-empty string', () => {
    expect(typeof API_BASE).toBe('string')
    expect(API_BASE.length).toBeGreaterThan(0)
  })

  it('defaults to the production URL when env var is absent', () => {
    expect(API_BASE).toBe('https://api.adaptiveelearning.online')
  })
})
