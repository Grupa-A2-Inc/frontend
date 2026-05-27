import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/lib/classes/api', () => ({
  apiFetch: vi.fn(),
}))

vi.mock('@/components/class-ui/Spinner', () => ({
  default: () => React.createElement('span', { 'data-testid': 'spinner' }),
}))

import React from 'react'
import { apiFetch } from '@/lib/classes/api'
import EditInfoPanel from '@/components/class-management/EditInfoPanel'
import type { ClassDetails } from '@/lib/classes/types'

const mockApiFetch = vi.mocked(apiFetch)

const cls: ClassDetails = {
  id: 'cls1',
  name: 'Math Class',
  description: 'A math class',
  teacherId: 't1',
  createdAt: '2024-01-01',
  members: [],
}

describe('EditInfoPanel', () => {
  beforeEach(() => {
    mockApiFetch.mockClear()
  })

  it('renders Edit class info heading', () => {
    render(<EditInfoPanel cls={cls} token="tok" onSaved={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByText('Edit class info')).toBeInTheDocument()
  })

  it('pre-fills class name and description', () => {
    render(<EditInfoPanel cls={cls} token="tok" onSaved={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByDisplayValue('Math Class')).toBeInTheDocument()
    expect(screen.getByDisplayValue('A math class')).toBeInTheDocument()
  })

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn()
    render(<EditInfoPanel cls={cls} token="tok" onSaved={vi.fn()} onCancel={onCancel} />)
    const cancelBtns = screen.getAllByText('Cancel')
    fireEvent.click(cancelBtns[0])
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows error when name is empty', async () => {
    render(<EditInfoPanel cls={{ ...cls, name: '' }} token="tok" onSaved={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Save changes'))
    await waitFor(() => {
      expect(screen.getByText('Name is required.')).toBeInTheDocument()
    })
  })

  it('calls apiFetch and onSaved on successful save', async () => {
    mockApiFetch.mockResolvedValue({})
    const onSaved = vi.fn()
    render(<EditInfoPanel cls={cls} token="tok" onSaved={onSaved} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Save changes'))
    await waitFor(() => {
      expect(onSaved).toHaveBeenCalledWith({ name: 'Math Class', description: 'A math class' })
    })
  })

  it('shows error on save failure', async () => {
    mockApiFetch.mockRejectedValue(new Error('Network error'))
    render(<EditInfoPanel cls={cls} token="tok" onSaved={vi.fn()} onCancel={vi.fn()} />)
    fireEvent.click(screen.getByText('Save changes'))
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })

  it('updates name input on change', () => {
    render(<EditInfoPanel cls={cls} token="tok" onSaved={vi.fn()} onCancel={vi.fn()} />)
    const nameInput = screen.getByDisplayValue('Math Class')
    fireEvent.change(nameInput, { target: { value: 'Science Class' } })
    expect(screen.getByDisplayValue('Science Class')).toBeInTheDocument()
  })
})
