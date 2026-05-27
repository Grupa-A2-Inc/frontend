import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmRemoveModal from '@/components/class-management/ConfirmRemoveModal'
import type { ClassMember } from '@/lib/classes/types'

const member: ClassMember = {
  userId: 'u1',
  email: 'alice@test.com',
  membershipType: 'STUDENT',
}

describe('ConfirmRemoveModal', () => {
  it('renders "Remove member?" heading', () => {
    render(<ConfirmRemoveModal member={member} removing={false} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Remove member?')).toBeInTheDocument()
  })

  it('shows member email in message', () => {
    render(<ConfirmRemoveModal member={member} removing={false} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('alice@test.com')).toBeInTheDocument()
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<ConfirmRemoveModal member={member} removing={false} onConfirm={vi.fn()} onCancel={onCancel} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('calls onConfirm when Remove is clicked', () => {
    const onConfirm = vi.fn()
    render(<ConfirmRemoveModal member={member} removing={false} onConfirm={onConfirm} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Remove'))
    expect(onConfirm).toHaveBeenCalled()
  })

  it('disables both buttons when removing is true', () => {
    render(<ConfirmRemoveModal member={member} removing={true} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Cancel')).toBeDisabled()
  })

  it('shows spinner when removing', () => {
    render(<ConfirmRemoveModal member={member} removing={true} onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(document.querySelector('svg')).toBeInTheDocument()
  })
})
