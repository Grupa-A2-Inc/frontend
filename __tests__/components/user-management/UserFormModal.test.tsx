import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockSelector = vi.fn()
vi.mock('@/store/hooks', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) => mockSelector(selector),
  useAppDispatch: () => vi.fn(),
}))

vi.mock('@/components/user-management/UsersClassSelector', () => ({
  default: ({ selectedClasses, onToggle }: { selectedClasses: string[]; onToggle: (id: string) => void }) =>
    React.createElement('div', null,
      React.createElement('button', { onClick: () => onToggle('cls1'), 'data-testid': 'toggle-class' },
        selectedClasses.includes('cls1') ? 'cls1 (checked)' : 'cls1'
      )
    ),
}))

import React from 'react'
import UserFormModal from '@/components/user-management/UserFormModal'
import type { User } from '@/store/slices/usersSlice'

function setup() {
  mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({ classes: { classrooms: [], loading: false }, auth: { accessToken: 'tok' } })
  )
}

const mockUser: User = {
  id: 'u1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@test.com',
  role: 'STUDENT',
  status: 'ACTIVE',
}

describe('UserFormModal', () => {
  it('renders Add User heading for new user', () => {
    setup()
    render(<UserFormModal user={null} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.getByRole('heading', { name: 'Add User' })).toBeInTheDocument()
  })

  it('renders Edit User heading for existing user', () => {
    setup()
    render(<UserFormModal user={mockUser} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.getByText('Edit User')).toBeInTheDocument()
  })

  it('pre-fills form fields when editing', () => {
    setup()
    render(<UserFormModal user={mockUser} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.getByDisplayValue('Alice')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Smith')).toBeInTheDocument()
    expect(screen.getByDisplayValue('alice@test.com')).toBeInTheDocument()
  })

  it('calls onClose when Cancel is clicked', () => {
    setup()
    const onClose = vi.fn()
    render(<UserFormModal user={null} onClose={onClose} onSave={vi.fn()} />)
    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('shows validation error when first name empty', async () => {
    setup()
    render(<UserFormModal user={null} onClose={vi.fn()} onSave={vi.fn()} />)
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText('First name is required.')).toBeInTheDocument()
    })
  })

  it('shows validation error when last name empty', async () => {
    setup()
    render(<UserFormModal user={null} onClose={vi.fn()} onSave={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('e.g. John'), { target: { value: 'John' } })
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText('Last name is required.')).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    setup()
    render(<UserFormModal user={null} onClose={vi.fn()} onSave={vi.fn()} />)
    fireEvent.change(screen.getByPlaceholderText('e.g. John'), { target: { value: 'John' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. Smith'), { target: { value: 'Smith' } })
    // Leave email blank to trigger "Please enter a valid email" path
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument()
    })
  })

  it('calls onSave with valid data', async () => {
    setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    render(<UserFormModal user={null} onClose={vi.fn()} onSave={onSave} />)
    fireEvent.change(screen.getByPlaceholderText('e.g. John'), { target: { value: 'John' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. Smith'), { target: { value: 'Smith' } })
    fireEvent.change(screen.getByPlaceholderText(/john\.smith/i), { target: { value: 'john@test.com' } })
    fireEvent.submit(document.querySelector('form')!)
    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@test.com',
        roleName: 'STUDENT',
        classIds: [],
      })
    })
  })

  it('shows serverError message', () => {
    setup()
    render(<UserFormModal user={null} onClose={vi.fn()} onSave={vi.fn()} serverError="Email already taken" />)
    expect(screen.getByText('Email already taken')).toBeInTheDocument()
  })

  it('shows role selector for new user', () => {
    setup()
    render(<UserFormModal user={null} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.getByText('Role')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('hides role selector when editing', () => {
    setup()
    render(<UserFormModal user={mockUser} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
  })

  it('shows class selector when teacher role selected', () => {
    setup()
    render(<UserFormModal user={null} onClose={vi.fn()} onSave={vi.fn()} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'TEACHER' } })
    expect(screen.getByTestId('toggle-class')).toBeInTheDocument()
  })

  it('toggles class selection', () => {
    setup()
    render(<UserFormModal user={null} onClose={vi.fn()} onSave={vi.fn()} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'TEACHER' } })
    fireEvent.click(screen.getByTestId('toggle-class'))
    expect(screen.getByText('1 class selected')).toBeInTheDocument()
  })

  it('shows Save Changes button for edit mode', () => {
    setup()
    render(<UserFormModal user={mockUser} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.getByText('Save Changes')).toBeInTheDocument()
  })

  it('shows password note for new user', () => {
    setup()
    render(<UserFormModal user={null} onClose={vi.fn()} onSave={vi.fn()} />)
    expect(screen.getByText(/The user will receive an email/)).toBeInTheDocument()
  })
})
