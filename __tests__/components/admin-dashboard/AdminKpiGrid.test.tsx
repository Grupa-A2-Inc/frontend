import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminKpiGrid from '@/components/admin-dashboard/AdminKpiGrid'

const stats = { totalStudents: 10, totalTeachers: 5, totalClasses: 3, totalCourses: 8 }

describe('AdminKpiGrid', () => {
  it('renders all four KPI cards', () => {
    render(<AdminKpiGrid stats={stats} />)
    expect(screen.getByText('Total Students')).toBeInTheDocument()
    expect(screen.getByText('Total Teachers')).toBeInTheDocument()
    expect(screen.getByText('Total Classes')).toBeInTheDocument()
    expect(screen.getByText('Total Courses')).toBeInTheDocument()
  })

  it('renders stat values', () => {
    render(<AdminKpiGrid stats={stats} />)
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('renders null when stats is falsy', () => {
    const { container } = render(<AdminKpiGrid stats={null as any} />)
    expect(container.firstChild).toBeNull()
  })
})
