import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Navbar from '@/components/layout/Navbar'
import { ThemeProvider } from '@/components/ThemeProvider'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

function renderNavbar() {
  localStorage.setItem('theme', 'dark')
  return render(
    <ThemeProvider>
      <Navbar />
    </ThemeProvider>
  )
}

describe('Navbar', () => {
  beforeEach(() => localStorage.clear())

  it('renders the nav element', () => {
    renderNavbar()
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('renders brand logo links', () => {
    renderNavbar()
    expect(screen.getByText('Adaptive')).toBeInTheDocument()
    expect(screen.getByText('Tutor')).toBeInTheDocument()
  })

  it('renders Log in and Get Started links', () => {
    renderNavbar()
    expect(screen.getAllByText('Log in').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Get Started').length).toBeGreaterThan(0)
  })

  it('login link points to /login', () => {
    renderNavbar()
    const loginLinks = screen.getAllByText('Log in')
    expect(loginLinks[0].closest('a')).toHaveAttribute('href', '/login')
  })

  it('mobile menu is hidden initially', () => {
    const { container } = renderNavbar()
    const mobileMenu = container.querySelector('.max-h-0')
    expect(mobileMenu).toBeInTheDocument()
  })

  it('mobile menu opens when hamburger is clicked', () => {
    const { container } = renderNavbar()
    const mobileButtons = screen.getAllByRole('button')
    const hamburger = mobileButtons.find(btn => !btn.getAttribute('aria-label'))
    if (hamburger) fireEvent.click(hamburger)
    const openMenu = container.querySelector('.max-h-64')
    expect(openMenu).toBeInTheDocument()
  })

  it('renders theme toggle button', () => {
    renderNavbar()
    expect(screen.getByLabelText('Toggle Theme')).toBeInTheDocument()
  })
})
