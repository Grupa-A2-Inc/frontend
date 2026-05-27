import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href }, children),
}))

import React from 'react'
import { CourseEditorHeader } from '@/components/course-editor/CourseEditorHeader'

const baseProps = {
  mode: 'edit' as const,
  courseId: 'c1',
  title: 'React Course',
  saving: false,
  saveOk: false,
  saveErr: null,
  onSave: vi.fn(),
}

describe('CourseEditorHeader', () => {
  it('renders course title in edit mode', () => {
    render(<CourseEditorHeader {...baseProps} />)
    expect(screen.getByText('React Course')).toBeInTheDocument()
  })

  it('renders "New Course" in create mode', () => {
    render(<CourseEditorHeader {...baseProps} mode="create" title="" />)
    expect(screen.getByText('New Course')).toBeInTheDocument()
  })

  it('renders Save Course button', () => {
    render(<CourseEditorHeader {...baseProps} />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('calls onSave when button is clicked', () => {
    const onSave = vi.fn()
    render(<CourseEditorHeader {...baseProps} onSave={onSave} />)
    fireEvent.click(screen.getByRole('button'))
    expect(onSave).toHaveBeenCalled()
  })

  it('disables save button when saving', () => {
    render(<CourseEditorHeader {...baseProps} saving={true} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('shows saveErr message', () => {
    render(<CourseEditorHeader {...baseProps} saveErr="Failed to save" />)
    expect(screen.getByText('Failed to save')).toBeInTheDocument()
  })

  it('shows Saved indicator when saveOk', () => {
    render(<CourseEditorHeader {...baseProps} saveOk={true} />)
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('links to course page in edit mode', () => {
    render(<CourseEditorHeader {...baseProps} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/dashboard/teacher/courses/c1')
  })

  it('links to my courses in create mode', () => {
    render(<CourseEditorHeader {...baseProps} mode="create" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/dashboard/teacher')
  })
})
