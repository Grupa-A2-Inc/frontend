import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ThemeToggle from '@/components/ThemeToggle'
import { ThemeProvider } from '@/components/ThemeProvider'

function renderWithTheme(theme: 'light' | 'dark') {
  localStorage.setItem('theme', theme)
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  )
}

describe('ThemeToggle', () => {
  beforeEach(() => localStorage.clear())

  it('shows 🌞 emoji in dark mode', () => {
    renderWithTheme('dark')
    expect(screen.getByRole('button').textContent).toContain('🌞')
  })

  it('shows 🌙 emoji in light mode', () => {
    renderWithTheme('light')
    expect(screen.getByRole('button').textContent).toContain('🌙')
  })

  it('toggles theme on click', () => {
    renderWithTheme('dark')
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByRole('button').textContent).toContain('🌙')
  })
})
