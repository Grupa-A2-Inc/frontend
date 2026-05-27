import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockDispatch = vi.fn(() => Promise.resolve({ type: 'test' }))
const mockSelector = vi.fn()

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => mockSelector(selector),
}))

vi.mock('@/store/slices/usersSlice', () => ({
  fetchUsers: vi.fn(() => ({ type: 'users/fetchUsers' })),
  fetchUserRoleCounts: vi.fn(() => ({ type: 'users/fetchUserRoleCounts' })),
  createUser: vi.fn(() => ({ type: 'users/createUser' })),
  updateUser: vi.fn(() => ({ type: 'users/updateUser' })),
  toggleUserStatus: vi.fn(() => ({ type: 'users/toggleUserStatus' })),
  deleteUser: vi.fn(() => ({ type: 'users/deleteUser' })),
  uploadUsersCsv: vi.fn(),
  importUsersCsvStarted: vi.fn(() => ({ type: 'users/importStarted' })),
  importUsersCsvSucceeded: vi.fn(() => ({ type: 'users/importSucceeded' })),
  importUsersCsvFailed: vi.fn(() => ({ type: 'users/importFailed' })),
}))

vi.mock('@/store/slices/classesSlice', () => ({
  fetchClassrooms: vi.fn(() => ({ type: 'classes/fetchClassrooms' })),
}))

vi.mock('@/lib/fetchWithAuth', () => ({
  fetchWithAuth: vi.fn(),
}))

vi.mock('@/lib/config', () => ({ API_BASE: 'http://localhost' }))
vi.mock('@/lib/api-endpoints', () => ({ ENDPOINTS: { classrooms: { members: (id: string) => `/classrooms/${id}/members` } } }))

vi.mock('@/components/user-management/UsersHeader', () => ({
  default: ({ totalUsers, onAddUser, importing }: { totalUsers: number; onAddUser: () => void; importing: boolean; onImportCsv: (f: File) => void }) => (
    <div>
      <span data-testid="total-users">{totalUsers}</span>
      <button onClick={onAddUser}>Add User</button>
      {importing && <span>Importing...</span>}
    </div>
  ),
}))

vi.mock('@/components/user-management/UsersToolbar', () => ({
  default: ({ search, onSearchChange, onRoleFilterChange, onStatusFilterChange }: {
    search: string; onSearchChange: (v: string) => void;
    onRoleFilterChange: (v: string) => void; onStatusFilterChange: (v: string) => void;
    roleFilter: string; statusFilter: string; roleCounts: unknown;
  }) => (
    <div>
      <input
        data-testid="search"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <button onClick={() => onRoleFilterChange('STUDENT')}>Filter Student</button>
      <button onClick={() => onStatusFilterChange('ACTIVE')}>Filter Active</button>
    </div>
  ),
}))

vi.mock('@/components/user-management/UsersTable', () => ({
  default: ({ filtered, onEdit }: { filtered: unknown[]; onEdit: (u: unknown) => void; search: string; roleFilter: string; statusFilter: string; onToggleStatus: (id: string) => void; onDelete: (id: string) => void; currentUserId?: string }) => (
    <div data-testid="users-table">
      {(filtered as { id: string; firstName: string; lastName: string }[]).map(u => (
        <div key={u.id}>
          <span>{u.firstName} {u.lastName}</span>
          <button onClick={() => onEdit(u)}>Edit</button>
        </div>
      ))}
    </div>
  ),
}))

vi.mock('@/components/user-management/UsersPagination', () => ({
  default: () => <div data-testid="pagination" />,
}))

vi.mock('@/components/user-management/UserFormModal', () => ({
  default: ({ onClose, onSave, user }: { onClose: () => void; onSave: (d: unknown) => void; user: unknown; serverError: string | null }) => (
    <div data-testid="user-form-modal">
      <span>{user ? 'Edit User' : 'Add User'}</span>
      <button onClick={onClose}>Cancel</button>
      <button onClick={() => onSave({ firstName: 'New', lastName: 'User', email: 'new@test.com', roleName: 'STUDENT' })}>
        Save
      </button>
    </div>
  ),
}))

import UsersPage from '@/components/user-management/UsersPage'

const defaultUsersState = {
  users: [
    { id: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', role: 'STUDENT', status: 'ACTIVE' },
    { id: 'u2', firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com', role: 'TEACHER', status: 'ACTIVE' },
  ],
  roleCounts: { all: 2, STUDENT: 1, TEACHER: 1, ADMIN: 0, ORGANIZATION_ADMIN: 0, PARENT: 0 },
  loading: false,
  initialized: true,
  error: null,
  createError: null,
  importing: false,
  importError: null,
  importResult: null,
  pagination: { totalElements: 2, totalPages: 1, number: 0, size: 10, numberOfElements: 2, first: true, last: true },
}

const defaultAuthState = {
  accessToken: 'tok',
  user: { id: 'admin1', role: 'ADMIN', organizationId: 'org1' },
}

function setup(usersOverride = {}, authOverride = {}) {
  mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({
      users: { ...defaultUsersState, ...usersOverride },
      auth: { ...defaultAuthState, ...authOverride },
    })
  )
}

describe('UsersPage', () => {
  beforeEach(() => {
    mockDispatch.mockClear()
  })

  it('renders user list', () => {
    setup()
    render(<UsersPage />)
    expect(screen.getByText('Alice Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Jones')).toBeInTheDocument()
  })

  it('shows loading skeleton when loading and not initialized', () => {
    setup({ loading: true, initialized: false })
    render(<UsersPage />)
    expect(document.querySelector('.animate-pulse')).toBeTruthy()
  })

  it('shows error state with retry button', () => {
    setup({ error: 'Failed to load users', initialized: true })
    render(<UsersPage />)
    expect(screen.getByText('Failed to load users')).toBeInTheDocument()
    expect(screen.getByText('Retry')).toBeInTheDocument()
  })

  it('retry button dispatches fetchUsers', () => {
    setup({ error: 'err', initialized: true })
    render(<UsersPage />)
    fireEvent.click(screen.getByText('Retry'))
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('shows pagination', () => {
    setup()
    render(<UsersPage />)
    expect(screen.getByTestId('pagination')).toBeInTheDocument()
  })

  it('opens add user modal on Add User click', () => {
    setup()
    render(<UsersPage />)
    fireEvent.click(screen.getByText('Add User'))
    expect(screen.getByTestId('user-form-modal')).toBeInTheDocument()
    expect(screen.getByText('Add User', { selector: 'span' })).toBeInTheDocument()
  })

  it('opens edit user modal on Edit click', () => {
    setup()
    render(<UsersPage />)
    const editButtons = screen.getAllByText('Edit')
    fireEvent.click(editButtons[0])
    expect(screen.getByTestId('user-form-modal')).toBeInTheDocument()
  })

  it('closes modal on Cancel', () => {
    setup()
    render(<UsersPage />)
    fireEvent.click(screen.getByText('Add User'))
    expect(screen.getByTestId('user-form-modal')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Cancel'))
    expect(screen.queryByTestId('user-form-modal')).not.toBeInTheDocument()
  })

  it('shows importError message', () => {
    setup({ importError: 'CSV import failed', initialized: true })
    render(<UsersPage />)
    expect(screen.getByText('CSV import failed')).toBeInTheDocument()
  })

  it('shows importResult message', () => {
    setup({ importResult: { succeeded: 5, total: 6, failed: 1 }, initialized: true })
    render(<UsersPage />)
    expect(screen.getByText(/Imported 5 of 6 users/)).toBeInTheDocument()
    expect(screen.getByText(/1 failed/)).toBeInTheDocument()
  })

  it('shows importResult without failures', () => {
    setup({ importResult: { succeeded: 3, total: 3, failed: 0 }, initialized: true })
    render(<UsersPage />)
    expect(screen.getByText(/Imported 3 of 3 users/)).toBeInTheDocument()
  })

  it('dispatches fetchUsers and fetchUserRoleCounts on mount', () => {
    setup()
    render(<UsersPage />)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('total users shows role count all value', () => {
    setup({ roleCounts: { all: 42, STUDENT: 20, TEACHER: 22 } })
    render(<UsersPage />)
    expect(screen.getByTestId('total-users').textContent).toBe('42')
  })

  it('shows user management heading in error state', () => {
    setup({ error: 'Err', initialized: true })
    render(<UsersPage />)
    expect(screen.getByText('User Management')).toBeInTheDocument()
  })
})
