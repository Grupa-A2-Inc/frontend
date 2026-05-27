import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => '/dashboard/admin',
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
      const C = ({ children, initial: _i, animate: _a, exit: _e, transition: _t, ...rest }: Record<string, unknown>) =>
        React.createElement(tag, rest, children as React.ReactNode)
      return C
    },
  }),
  AnimatePresence: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
}))
vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
  useAppSelector: () => ({
    id: 'u1', email: 'admin@test.com', role: 'ADMIN', firstName: 'Admin', lastName: 'User',
    organizationId: 'o1', organizationName: 'Acme', organizationType: 'Edu', country: 'RO',
    city: 'BUC', organizationPhoneNumber: '123', organizationAddress: 'Str', status: 'ACTIVE',
  }),
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

import SidebarWrapper from '@/components/layout/SidebarWrapper'

describe('SidebarWrapper', () => {
  it('renders children', () => {
    render(
      <SidebarWrapper>
        <div data-testid="child">Content</div>
      </SidebarWrapper>
    )
    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('renders navigation links for admin role', () => {
    render(
      <SidebarWrapper>
        <div>Content</div>
      </SidebarWrapper>
    )
    expect(screen.getAllByText(/Dashboard/i).length).toBeGreaterThan(0)
  })
})
