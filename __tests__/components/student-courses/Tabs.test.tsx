import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CoursesTabs from '@/components/student-courses/Tabs'

describe('CoursesTabs', () => {
  it('renders My Courses and Discover tabs', () => {
    render(<CoursesTabs activeTab="my" onTabChange={vi.fn()} />)
    expect(screen.getByText('My Courses')).toBeInTheDocument()
    expect(screen.getByText('Discover')).toBeInTheDocument()
  })

  it('calls onTabChange with "my" when My Courses is clicked', () => {
    const onTabChange = vi.fn()
    render(<CoursesTabs activeTab="discover" onTabChange={onTabChange} />)
    fireEvent.click(screen.getByText('My Courses'))
    expect(onTabChange).toHaveBeenCalledWith('my')
  })

  it('calls onTabChange with "discover" when Discover is clicked', () => {
    const onTabChange = vi.fn()
    render(<CoursesTabs activeTab="my" onTabChange={onTabChange} />)
    fireEvent.click(screen.getByText('Discover'))
    expect(onTabChange).toHaveBeenCalledWith('discover')
  })

  it('highlights active tab', () => {
    render(<CoursesTabs activeTab="my" onTabChange={vi.fn()} />)
    const myCoursesBtn = screen.getByText('My Courses')
    expect(myCoursesBtn.className).toContain('bg-brand-card')
  })

  it('does not highlight inactive tab', () => {
    render(<CoursesTabs activeTab="my" onTabChange={vi.fn()} />)
    const discoverBtn = screen.getByText('Discover')
    expect(discoverBtn.className).not.toContain('bg-brand-card')
  })
})
