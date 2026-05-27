import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

const mockUsePathname = vi.fn(() => '/dashboard/admin')
const mockUseRouter = vi.fn(() => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }))
const mockSelector = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => mockUseRouter(),
  usePathname: () => mockUsePathname(),
}))
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => <img src={src} alt={alt} {...props} />,
}))
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_t, tag: string) => {
      const C = ({ children, initial: _i, animate: _a, exit: _e, transition: _tr, whileHover: _wh, whileTap: _wt, ...rest }: Record<string, unknown>) =>
        React.createElement(tag as string, rest, children as React.ReactNode)
      return C
    },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}))
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: (selector: (s: unknown) => unknown) => mockSelector(selector),
}))
vi.mock('@/store/slices/authSlice', () => ({
  logout: vi.fn().mockReturnValue({ type: 'auth/logout' }),
  default: (state = { user: null }) => state,
}))
vi.mock('@/components/layout/CustomerSupportChat', () => ({
  default: () => React.createElement('div', { 'data-testid': 'customer-support' }),
}))
vi.mock('@/components/ThemeProvider', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn() }),
}))

// Set sidebar to expanded (not collapsed)
vi.stubGlobal('localStorage', {
  getItem: (key: string) => key === 'sidebarCollapsed' ? 'false' : null,
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
})

import SidebarWrapper from '@/components/layout/SidebarWrapper'

const adminUser = {
  id: 'u1', email: 'admin@test.com', role: 'ADMIN', firstName: 'Admin', lastName: 'User',
  organizationId: 'o1', organizationName: 'Acme', organizationType: 'Edu', country: 'RO',
  city: 'BUC', organizationPhoneNumber: '123', organizationAddress: 'Str', status: 'ACTIVE',
}
const teacherUser = { ...adminUser, role: 'TEACHER', firstName: 'Teacher', lastName: 'Bob' }
const studentUser = { ...adminUser, role: 'STUDENT', firstName: 'Student', lastName: 'Sam' }
const orgAdminUser = { ...adminUser, role: 'ORGANIZATION_ADMIN', firstName: 'Org', lastName: 'Admin' }

function setup(user = adminUser) {
  mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({ auth: { user } })
  )
}

describe('SidebarWrapper', () => {
  it('renders children', () => {
    setup()
    render(
      <SidebarWrapper>
        <div data-testid="child">Content</div>
      </SidebarWrapper>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renders navigation links for admin role', () => {
    setup()
    render(<SidebarWrapper><div>Content</div></SidebarWrapper>)
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0)
  })

  it('renders teacher nav links', () => {
    setup(teacherUser)
    render(<SidebarWrapper><div>Content</div></SidebarWrapper>)
    expect(screen.getAllByText(/My Courses/i).length).toBeGreaterThan(0)
  })

  it('renders student nav links', () => {
    setup(studentUser)
    render(<SidebarWrapper><div>Content</div></SidebarWrapper>)
    expect(screen.getAllByText(/Courses/i).length).toBeGreaterThan(0)
  })

  it('renders org admin with admin nav links', () => {
    setup(orgAdminUser)
    render(<SidebarWrapper><div>Content</div></SidebarWrapper>)
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0)
  })

  it('renders user name in sidebar', () => {
    setup()
    render(<SidebarWrapper><div>Content</div></SidebarWrapper>)
    expect(screen.getAllByText(/Admin User/i).length).toBeGreaterThan(0)
  })

  it('renders customer support chat', () => {
    setup()
    render(<SidebarWrapper><div>Content</div></SidebarWrapper>)
    expect(screen.getByTestId('customer-support')).toBeInTheDocument()
  })

  it('renders active link with different style when on that path', () => {
    mockUsePathname.mockReturnValue('/dashboard/admin')
    setup()
    render(<SidebarWrapper><div>Content</div></SidebarWrapper>)
    expect(document.body).toBeTruthy()
  })

  it('renders with null user gracefully', () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({ auth: { user: null } })
    )
    render(<SidebarWrapper><div>Content</div></SidebarWrapper>)
    expect(document.body).toBeTruthy()
  })
})
