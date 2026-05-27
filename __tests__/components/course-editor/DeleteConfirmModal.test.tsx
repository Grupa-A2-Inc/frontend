import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DeleteConfirmModal } from '@/components/course-editor/DeleteConfirmModal'
import type { DeleteTarget } from '@/components/course-editor/types'

const deleteTarget: DeleteTarget = {
  label: 'Chapter 1',
  onConfirm: vi.fn().mockResolvedValue(undefined),
}

const baseProps = {
  deleteTarget,
  deleting: false,
  deleteErr: null,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
}

describe('DeleteConfirmModal', () => {
  it('renders delete target label', () => {
    render(<DeleteConfirmModal {...baseProps} />)
    expect(screen.getByText('Delete Chapter 1?')).toBeInTheDocument()
  })

  it('renders "This cannot be undone" message', () => {
    render(<DeleteConfirmModal {...baseProps} />)
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
  })

  it('renders Cancel and Delete buttons', () => {
    render(<DeleteConfirmModal {...baseProps} />)
    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    const onClose = vi.fn()
    render(<DeleteConfirmModal {...baseProps} onClose={onClose} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls onConfirm when Delete is clicked', () => {
    const onConfirm = vi.fn()
    render(<DeleteConfirmModal {...baseProps} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByText('Delete'))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('disables Delete button when deleting is true', () => {
    render(<DeleteConfirmModal {...baseProps} deleting={true} />)
    expect(screen.getByText('Deleting...')).toBeDisabled()
  })

  it('shows error message when deleteErr is set', () => {
    render(<DeleteConfirmModal {...baseProps} deleteErr="Failed to delete" />)
    expect(screen.getByText('Failed to delete')).toBeInTheDocument()
  })
})
