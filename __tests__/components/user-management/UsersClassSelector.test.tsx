import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockSelector = vi.fn()

vi.mock('@/store/hooks', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) => mockSelector(selector),
}))

import ClassSelector from '@/components/user-management/UsersClassSelector'

function makeState(classrooms: { id: string; name: string; description: string }[]) {
  return { classes: { classrooms } }
}

describe('UsersClassSelector', () => {
  it('renders class checkboxes', () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector(makeState([
        { id: 'cl1', name: 'Class Alpha', description: '' },
        { id: 'cl2', name: 'Class Beta', description: '' },
      ]))
    )
    render(<ClassSelector selectedClasses={[]} onToggle={vi.fn()} />)
    expect(screen.getByText('Class Alpha')).toBeInTheDocument()
    expect(screen.getByText('Class Beta')).toBeInTheDocument()
  })

  it('calls onToggle when class label is clicked', () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector(makeState([{ id: 'cl1', name: 'Class Alpha', description: '' }]))
    )
    const onToggle = vi.fn()
    render(<ClassSelector selectedClasses={[]} onToggle={onToggle} />)
    fireEvent.click(screen.getByText('Class Alpha'))
    expect(onToggle).toHaveBeenCalledWith('cl1')
  })

  it('shows no classes available when empty', () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector(makeState([]))
    )
    render(<ClassSelector selectedClasses={[]} onToggle={vi.fn()} />)
    expect(screen.getByText('No classes available yet.')).toBeInTheDocument()
  })

  it('shows checkmark for selected class', () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector(makeState([{ id: 'cl1', name: 'Class Alpha', description: '' }]))
    )
    render(<ClassSelector selectedClasses={['cl1']} onToggle={vi.fn()} />)
    expect(screen.getByText('check')).toBeInTheDocument()
  })
})
