import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminKpiGrid from '@/components/admin-dashboard/AdminKpiGrid'
import type { AdminDashboardStats } from '@/lib/admin-dashboard/types'

const stats = { totalStudents: 10, totalTeachers: 5, totalClasses: 3 }

describe('AdminKpiGrid', () => {
  it('renders organization-scoped KPI cards', () => {
    render(<AdminKpiGrid stats={stats} />)
    expect(screen.getByText('Total Students')).toBeInTheDocument()
    expect(screen.getByText('Total Teachers')).toBeInTheDocument()
    expect(screen.getByText('Total Classes')).toBeInTheDocument()
    expect(screen.queryByText('Total Courses')).not.toBeInTheDocument()
  })

  it('renders stat values', () => {
    render(<AdminKpiGrid stats={stats} />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('does not show a metric that could not be counted', () => {
    render(<AdminKpiGrid stats={{ ...stats, totalTeachers: null }} />)
    expect(screen.queryByText('Total Teachers')).not.toBeInTheDocument()
  })

  it('renders null when stats is falsy', () => {
    const { container } = render(<AdminKpiGrid stats={null as unknown as AdminDashboardStats} />)
    expect(container.firstChild).toBeNull()
  })
})
