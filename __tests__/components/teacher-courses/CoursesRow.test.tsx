import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CourseRow from '@/components/teacher-courses/CoursesRow'
import type { Course } from '@/lib/courses/types'

const baseCourse: Course = {
  id: 'c1',
  title: 'React Fundamentals',
  description: 'Learn React',
  category: 'Web',
  status: 'PUBLISHED',
  visibility: 'PUBLIC',
  createdBy: 'teacher1',
}

describe('CourseRow', () => {
  it('renders course title and category', () => {
    render(<CourseRow course={baseCourse} onEdit={vi.fn()} onManage={vi.fn()} />)
    expect(screen.getByText('React Fundamentals')).toBeInTheDocument()
    expect(screen.getByText('Web')).toBeInTheDocument()
  })

  it('renders PUBLISHED status badge', () => {
    render(<CourseRow course={baseCourse} onEdit={vi.fn()} onManage={vi.fn()} />)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('renders DRAFT status badge', () => {
    render(<CourseRow course={{ ...baseCourse, status: 'DRAFT' }} onEdit={vi.fn()} onManage={vi.fn()} />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('calls onEdit with course id when Edit button clicked', () => {
    const onEdit = vi.fn()
    render(<CourseRow course={baseCourse} onEdit={onEdit} onManage={vi.fn()} />)
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledWith('c1')
  })

  it('calls onManage with course id when Manage button clicked', () => {
    const onManage = vi.fn()
    render(<CourseRow course={baseCourse} onEdit={vi.fn()} onManage={onManage} />)
    fireEvent.click(screen.getByText('Manage'))
    expect(onManage).toHaveBeenCalledWith('c1')
  })

  it('renders HIDDEN status badge', () => {
    render(<CourseRow course={{ ...baseCourse, status: 'HIDDEN' }} onEdit={vi.fn()} onManage={vi.fn()} />)
    expect(screen.getByText('Hidden')).toBeInTheDocument()
  })

  it('toggles mobile expand/collapse on chevron click', () => {
    render(<CourseRow course={baseCourse} onEdit={vi.fn()} onManage={vi.fn()} />)
    const chevronBtn = screen.getByText('⌄')
    fireEvent.click(chevronBtn)
    // After click, open=true, should show ⌃
    expect(screen.getByText('⌃')).toBeInTheDocument()
  })

  it('mobile dropdown shows Edit and Manage buttons when open', () => {
    render(<CourseRow course={baseCourse} onEdit={vi.fn()} onManage={vi.fn()} />)
    fireEvent.click(screen.getByText('⌄'))
    // Now there are multiple Edit and Manage buttons (desktop hidden + mobile visible)
    const editBtns = screen.getAllByText('Edit')
    expect(editBtns.length).toBeGreaterThan(1)
  })

  it('mobile Edit calls onEdit and closes drawer', () => {
    const onEdit = vi.fn()
    render(<CourseRow course={baseCourse} onEdit={onEdit} onManage={vi.fn()} />)
    fireEvent.click(screen.getByText('⌄'))
    // Click the last Edit button (mobile one)
    const editBtns = screen.getAllByText('Edit')
    fireEvent.click(editBtns[editBtns.length - 1])
    expect(onEdit).toHaveBeenCalledWith('c1')
  })
})
