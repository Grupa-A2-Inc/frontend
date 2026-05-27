import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CourseMetaForm } from '@/components/course-editor/CourseMetaForm'

const baseProps = {
  title: 'My Course',
  description: 'Some description',
  category: 'Web',
  status: 'DRAFT' as const,
  onTitleChange: vi.fn(),
  onDescriptionChange: vi.fn(),
  onCategoryChange: vi.fn(),
  onStatusChange: vi.fn(),
}

describe('CourseMetaForm', () => {
  it('renders title input with current value', () => {
    render(<CourseMetaForm {...baseProps} />)
    expect(screen.getByDisplayValue('My Course')).toBeInTheDocument()
  })

  it('renders description textarea with current value', () => {
    render(<CourseMetaForm {...baseProps} />)
    expect(screen.getByDisplayValue('Some description')).toBeInTheDocument()
  })

  it('renders category input with current value', () => {
    render(<CourseMetaForm {...baseProps} />)
    expect(screen.getByDisplayValue('Web')).toBeInTheDocument()
  })

  it('calls onTitleChange when title input changes', () => {
    const onTitleChange = vi.fn()
    render(<CourseMetaForm {...baseProps} onTitleChange={onTitleChange} />)
    fireEvent.change(screen.getByDisplayValue('My Course'), { target: { value: 'New Title' } })
    expect(onTitleChange).toHaveBeenCalledWith('New Title')
  })

  it('calls onDescriptionChange when textarea changes', () => {
    const onDescriptionChange = vi.fn()
    render(<CourseMetaForm {...baseProps} onDescriptionChange={onDescriptionChange} />)
    fireEvent.change(screen.getByDisplayValue('Some description'), { target: { value: 'Updated desc' } })
    expect(onDescriptionChange).toHaveBeenCalledWith('Updated desc')
  })

  it('calls onCategoryChange when category changes', () => {
    const onCategoryChange = vi.fn()
    render(<CourseMetaForm {...baseProps} onCategoryChange={onCategoryChange} />)
    fireEvent.change(screen.getByDisplayValue('Web'), { target: { value: 'Mobile' } })
    expect(onCategoryChange).toHaveBeenCalledWith('Mobile')
  })

  it('calls onStatusChange with PUBLISHED when Published button clicked', () => {
    const onStatusChange = vi.fn()
    render(<CourseMetaForm {...baseProps} onStatusChange={onStatusChange} />)
    fireEvent.click(screen.getByText('Published'))
    expect(onStatusChange).toHaveBeenCalledWith('PUBLISHED')
  })

  it('calls onStatusChange with DRAFT when Draft button clicked', () => {
    const onStatusChange = vi.fn()
    render(<CourseMetaForm {...baseProps} status="PUBLISHED" onStatusChange={onStatusChange} />)
    fireEvent.click(screen.getByText('Draft'))
    expect(onStatusChange).toHaveBeenCalledWith('DRAFT')
  })

  it('renders Course Details section label', () => {
    render(<CourseMetaForm {...baseProps} />)
    expect(screen.getByText('Course Details')).toBeInTheDocument()
  })
})
