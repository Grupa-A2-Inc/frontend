import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/lib/admin-dashboard/api', () => ({
  getDashboardStats: vi.fn(),
  getOrganizationById: vi.fn(),
  getOrganizationIdFromStorage: vi.fn(),
  getAccessToken: vi.fn(),
}))

vi.mock('@/components/admin-dashboard/AdminKpiGrid', () => ({
  default: () => React.createElement('div', { 'data-testid': 'kpi-grid' }),
}))

vi.mock('@/components/admin-dashboard/OrganizationSummaryCard', () => ({
  default: () => React.createElement('div', { 'data-testid': 'org-summary' }),
}))

vi.mock('@/components/admin-dashboard/AdminQuickLinks', () => ({
  default: () => React.createElement('div', { 'data-testid': 'quick-links' }),
}))

vi.mock('@/components/admin-dashboard/AdminStatusBanner', () => ({
  default: ({ variant, message }: { variant: string; message: string }) =>
    React.createElement('div', { 'data-testid': `banner-${variant}` }, message),
}))

import React from 'react'
import { getDashboardStats, getOrganizationById, getOrganizationIdFromStorage, getAccessToken } from '@/lib/admin-dashboard/api'
import AdminDashboardPage from '@/components/admin-dashboard/AdminDashboardPage'

const mockGetStats = vi.mocked(getDashboardStats)
const mockGetOrg = vi.mocked(getOrganizationById)
const mockGetOrgId = vi.mocked(getOrganizationIdFromStorage)
const mockGetToken = vi.mocked(getAccessToken)

const mockStats = {
  totalStudents: 50, totalTeachers: 10, totalClasses: 5,
  warnings: [],
}

const mockOrg = {
  id: 'org1',
  organizationName: 'Test Org',
  organizationType: 'School',
  country: 'Romania',
  city: 'Bucharest',
  address: 'Test street',
  phoneNumber: '+4000000000',
}

describe('AdminDashboardPage', () => {
  beforeEach(() => {
    mockGetToken.mockReturnValue('tok')
    mockGetOrgId.mockReturnValue('org1')
  })

  it('shows loading skeleton initially', () => {
    mockGetStats.mockReturnValue(new Promise(() => {}))
    mockGetOrg.mockReturnValue(new Promise(() => {}))
    render(<AdminDashboardPage />)
    expect(document.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('shows error when missing session data', async () => {
    mockGetToken.mockReturnValue(null)
    mockGetOrgId.mockReturnValue(null)
    mockGetStats.mockResolvedValue(mockStats)
    mockGetOrg.mockResolvedValue(mockOrg)
    render(<AdminDashboardPage />)
    expect(await screen.findByText(/Missing session data/)).toBeInTheDocument()
  })

  it('shows error message on failed load', async () => {
    mockGetStats.mockRejectedValue(new Error('API error'))
    mockGetOrg.mockRejectedValue(new Error('API error'))
    render(<AdminDashboardPage />)
    expect(await screen.findByTestId('banner-error')).toBeInTheDocument()
    expect(screen.getByText('API error')).toBeInTheDocument()
  })

  it('shows retry button in error state', async () => {
    mockGetStats.mockRejectedValue(new Error('fail'))
    mockGetOrg.mockRejectedValue(new Error('fail'))
    render(<AdminDashboardPage />)
    expect(await screen.findByText('Retry')).toBeInTheDocument()
  })

  it('renders dashboard components after loading', async () => {
    mockGetStats.mockResolvedValue(mockStats)
    mockGetOrg.mockResolvedValue(mockOrg)
    render(<AdminDashboardPage />)
    expect(await screen.findByTestId('kpi-grid')).toBeInTheDocument()
    expect(screen.getByTestId('org-summary')).toBeInTheDocument()
    expect(screen.getByTestId('quick-links')).toBeInTheDocument()
  })

  it('renders Admin Dashboard heading', async () => {
    mockGetStats.mockResolvedValue(mockStats)
    mockGetOrg.mockResolvedValue(mockOrg)
    render(<AdminDashboardPage />)
    expect(await screen.findByText('Admin Dashboard')).toBeInTheDocument()
  })

  it('shows warning banner when stats has warnings', async () => {
    mockGetStats.mockResolvedValue({ ...mockStats, warnings: ['issue1', 'issue2'] })
    mockGetOrg.mockResolvedValue(mockOrg)
    render(<AdminDashboardPage />)
    expect(await screen.findByTestId('banner-warning')).toBeInTheDocument()
    expect(screen.getByText(/2 issues/)).toBeInTheDocument()
  })

  it('retry button calls loadDashboard again', async () => {
    mockGetStats.mockRejectedValueOnce(new Error('fail'))
    mockGetOrg.mockRejectedValueOnce(new Error('fail'))
    render(<AdminDashboardPage />)
    await screen.findByText('Retry')
    mockGetStats.mockResolvedValue(mockStats)
    mockGetOrg.mockResolvedValue(mockOrg)
    fireEvent.click(screen.getByText('Retry'))
    expect(await screen.findByTestId('kpi-grid')).toBeInTheDocument()
  })
})
