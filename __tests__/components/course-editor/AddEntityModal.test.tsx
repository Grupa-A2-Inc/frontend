import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AddEntityModal } from '@/components/course-editor/AddEntityModal'
import type { AddTarget, EditorForm } from '@/components/course-editor/types'

const emptyForm: EditorForm = { title: '', contentMarkdown: '', url: '' }
const filledForm: EditorForm = { title: 'My Chapter', contentMarkdown: '', url: '' }

const baseProps = {
  addTarget: { kind: 'chapter' } as AddTarget,
  addForm: filledForm,
  adding: false,
  error: null,
  onClose: vi.fn(),
  onFormChange: vi.fn(),
  onAdd: vi.fn(),
}

describe('AddEntityModal', () => {
  it('renders Add Chapter heading', () => {
    render(<AddEntityModal {...baseProps} />)
    expect(screen.getByRole('heading', { name: /add chapter/i })).toBeInTheDocument()
  })

  it('renders Add Lesson heading for lesson target', () => {
    render(<AddEntityModal {...baseProps} addTarget={{ kind: 'lesson', chapterId: 'ch1' }} />)
    expect(screen.getByRole('heading', { name: /add lesson/i })).toBeInTheDocument()
  })

  it('renders Cancel button', () => {
    render(<AddEntityModal {...baseProps} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(<AddEntityModal {...baseProps} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onAdd when Add button is clicked with valid form', () => {
    const onAdd = vi.fn()
    render(<AddEntityModal {...baseProps} onAdd={onAdd} />)
    fireEvent.click(screen.getAllByText('Add Chapter')[1])
    expect(onAdd).toHaveBeenCalled()
  })

  it('disables Add button when title is empty', () => {
    render(<AddEntityModal {...baseProps} addForm={emptyForm} />)
    const addBtns = screen.getAllByText('Add Chapter')
    expect(addBtns[1].closest('button')).toBeDisabled()
  })

  it('shows error message when error is set', () => {
    render(<AddEntityModal {...baseProps} error="Something went wrong" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('shows resource URL field for resource target', () => {
    render(<AddEntityModal
      {...baseProps}
      addTarget={{ kind: 'resource', chapterId: 'ch1', lessonId: 'l1' }}
      addForm={{ title: 'My Resource', contentMarkdown: '', url: 'https://example.com' }}
    />)
    expect(screen.getByPlaceholderText('https://example.com/resource')).toBeInTheDocument()
  })

  it('shows content textarea for lesson target', () => {
    render(<AddEntityModal
      {...baseProps}
      addTarget={{ kind: 'lesson', chapterId: 'ch1' }}
    />)
    expect(screen.getByPlaceholderText('Start writing lesson content...')).toBeInTheDocument()
  })

  it('shows Adding... text when adding is true', () => {
    render(<AddEntityModal {...baseProps} adding={true} />)
    expect(screen.getByText('Adding...')).toBeInTheDocument()
  })
})
