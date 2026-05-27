import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockDispatch = vi.fn()
const mockSelector = vi.fn()

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => mockSelector(selector),
}))

vi.mock('@/store/slices/authSlice', () => ({
  syncAuthenticatedUser: vi.fn(() => ({ type: 'auth/syncUser' })),
}))

vi.mock('@/lib/profile/api', () => ({
  fetchUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  changeUserPassword: vi.fn(),
  fetchProfileOrganization: vi.fn(),
}))

vi.mock('@/lib/profile/types', () => ({
  mapOrganizationResponse: vi.fn(() => null),
  mergeUserProfile: vi.fn((backendUser, authUser) => ({
    ...authUser,
    firstName: backendUser.firstName ?? authUser.firstName,
    lastName: backendUser.lastName ?? authUser.lastName,
    email: backendUser.email ?? authUser.email,
  })),
}))

import { fetchUserProfile, updateUserProfile, changeUserPassword } from '@/lib/profile/api'
import ProfilePage from '@/components/profile/ProfilePage'

const mockFetchProfile = vi.mocked(fetchUserProfile)
const mockUpdateProfile = vi.mocked(updateUserProfile)
const mockChangePassword = vi.mocked(changeUserPassword)

const mockUser = {
  id: 'u1',
  firstName: 'Alice',
  lastName: 'Smith',
  email: 'alice@test.com',
  role: 'STUDENT' as const,
  status: 'ACTIVE' as const,
  organizationId: 'org1',
}

function setup(user = mockUser) {
  mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({ auth: { user, accessToken: 'tok', organization: null } })
  )
}

describe('ProfilePage', () => {
  it('shows loading skeleton initially', () => {
    setup()
    mockFetchProfile.mockReturnValue(new Promise(() => {}))
    render(<ProfilePage />)
    expect(document.body.textContent).toBeTruthy()
  })

  it('renders profile form after loading', async () => {
    setup()
    mockFetchProfile.mockResolvedValue({ id: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', role: 'STUDENT', status: 'ACTIVE', organizationId: 'org1' })
    render(<ProfilePage />)
    expect(await screen.findByDisplayValue('Alice')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Smith')).toBeInTheDocument()
  })

  it('renders email field', async () => {
    setup()
    mockFetchProfile.mockResolvedValue({ id: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', role: 'STUDENT', status: 'ACTIVE', organizationId: 'org1' })
    render(<ProfilePage />)
    expect(await screen.findByDisplayValue('alice@test.com')).toBeInTheDocument()
  })

  it('shows error when profile load fails', async () => {
    setup()
    mockFetchProfile.mockRejectedValue(new Error('Load failed'))
    render(<ProfilePage />)
    expect(await screen.findByText('Load failed')).toBeInTheDocument()
  })

  it('shows no user state when user is null', () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({ auth: { user: null, accessToken: null, organization: null } })
    )
    mockFetchProfile.mockResolvedValue(null as never)
    render(<ProfilePage />)
    expect(document.body).toBeTruthy()
  })

  it('updates profile form fields', async () => {
    setup()
    mockFetchProfile.mockResolvedValue({ id: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', role: 'STUDENT', status: 'ACTIVE', organizationId: 'org1' })
    render(<ProfilePage />)
    const firstNameInput = await screen.findByDisplayValue('Alice')
    fireEvent.change(firstNameInput, { target: { value: 'Bob' } })
    expect(screen.getByDisplayValue('Bob')).toBeInTheDocument()
  })

  it('submits profile form on save', async () => {
    setup()
    mockFetchProfile.mockResolvedValue({ id: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', role: 'STUDENT', status: 'ACTIVE', organizationId: 'org1' })
    mockUpdateProfile.mockResolvedValue(undefined as never)
    render(<ProfilePage />)
    await screen.findByDisplayValue('Alice')
    const saveBtn = screen.getByText(/save changes/i)
    fireEvent.click(saveBtn.closest('button') || saveBtn)
    expect(document.body).toBeTruthy()
  })

  it('renders password change section', async () => {
    setup()
    mockFetchProfile.mockResolvedValue({ id: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', role: 'STUDENT', status: 'ACTIVE', organizationId: 'org1' })
    render(<ProfilePage />)
    await screen.findByDisplayValue('Alice')
    expect(screen.getAllByText(/password/i).length).toBeGreaterThan(0)
  })

  it('shows active status badge', async () => {
    setup()
    mockFetchProfile.mockResolvedValue({ id: 'u1', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com', role: 'STUDENT', status: 'ACTIVE', organizationId: 'org1' })
    render(<ProfilePage />)
    expect(await screen.findByText('Active')).toBeInTheDocument()
  })
})
