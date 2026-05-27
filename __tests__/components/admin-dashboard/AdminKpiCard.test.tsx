import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminKpiCard from '@/components/admin-dashboard/AdminKpiCard'

describe('AdminKpiCard', () => {
  it('renders label and value', () => {
    render(<AdminKpiCard label="Total Students" value={42} />)
    expect(screen.getByText('Total Students')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('shows helperText when provided', () => {
    render(<AdminKpiCard label="Test" value={0} helperText="From API data" />)
    expect(screen.getByText('From API data')).toBeInTheDocument()
  })

  it('does not show helperText when not provided', () => {
    render(<AdminKpiCard label="Test" value={0} />)
    expect(screen.queryByText('From API data')).not.toBeInTheDocument()
  })

  it('renders value 0', () => {
    render(<AdminKpiCard label="Test" value={0} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
