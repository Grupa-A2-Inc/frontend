import { describe, it, expect } from 'vitest'
import { mapOrganizationResponse, mapUpdateOrganizationPayload } from '@/lib/admin-dashboard/mappers'

describe('mapOrganizationResponse', () => {
  const rawData = {
    id: 1,
    name: 'Acme Corp',
    organizationType: 'Education',
    country: 'Romania',
    city: 'Bucharest',
    address: '123 Main St',
    phoneNumber: '+40123456789',
  }

  it('maps all fields correctly', () => {
    const result = mapOrganizationResponse(rawData)
    expect(result.id).toBe('1')
    expect(result.organizationName).toBe('Acme Corp')
    expect(result.organizationType).toBe('Education')
    expect(result.country).toBe('Romania')
    expect(result.city).toBe('Bucharest')
    expect(result.address).toBe('123 Main St')
    expect(result.phoneNumber).toBe('+40123456789')
  })

  it('defaults to empty strings for missing fields', () => {
    const result = mapOrganizationResponse({})
    expect(result.id).toBe('')
    expect(result.organizationName).toBe('')
    expect(result.country).toBe('')
  })

  it('handles null data gracefully', () => {
    const result = mapOrganizationResponse(null)
    expect(result.id).toBe('')
  })
})

describe('mapUpdateOrganizationPayload', () => {
  const profile = {
    id: '1',
    organizationName: '  Acme Corp  ',
    organizationType: '  Education  ',
    country: '  Romania  ',
    city: '  Bucharest  ',
    address: '  123 Main St  ',
    phoneNumber: '  +40123456789  ',
  }

  it('trims all string fields', () => {
    const result = mapUpdateOrganizationPayload(profile)
    expect(result.name).toBe('Acme Corp')
    expect(result.organizationType).toBe('Education')
    expect(result.country).toBe('Romania')
    expect(result.city).toBe('Bucharest')
    expect(result.address).toBe('123 Main St')
    expect(result.phoneNumber).toBe('+40123456789')
  })

  it('maps organizationName to name field', () => {
    const result = mapUpdateOrganizationPayload(profile)
    expect(result.name).toBeDefined()
    expect('organizationName' in result).toBe(false)
  })
})
