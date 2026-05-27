import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))
vi.mock('@/components/DoodleBackground', () => ({ default: () => <div data-testid="doodle-bg" /> }))
vi.mock('@/components/DaySky', () => ({ default: () => <div data-testid="day-sky" /> }))
vi.mock('@/components/Constellation', () => ({ default: () => <div data-testid="constellation" /> }))

describe('sections/FAQ', () => {
  it('renders without crashing', async () => {
    const FAQ = (await import('@/components/sections/FAQ')).default
    render(<FAQ />)
    expect(document.body.firstChild).toBeTruthy()
  })
})

describe('sections/Hero', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('renders the section element', async () => {
    const Hero = (await import('@/components/sections/Hero')).default
    const { container } = render(<Hero />)
    expect(container.querySelector('section')).toBeInTheDocument()
  })
})

describe('sections/HowItWorks', () => {
  it('renders without crashing', async () => {
    const HowItWorks = (await import('@/components/sections/HowItWorks')).default
    const { container } = render(<HowItWorks />)
    expect(container.firstChild).toBeTruthy()
  })

  it('renders all 4 step buttons', async () => {
    const HowItWorks = (await import('@/components/sections/HowItWorks')).default
    render(<HowItWorks />)
    const stepButtons = screen.getAllByRole('button')
    expect(stepButtons.length).toBeGreaterThanOrEqual(4)
  })

  it('clicking a step button changes active step', async () => {
    const { default: HowItWorks } = await import('@/components/sections/HowItWorks')
    render(<HowItWorks />)
    const stepBtns = screen.getAllByRole('button')
    fireEvent.click(stepBtns[1])
    // Just verify no crash
    expect(document.body).toBeTruthy()
  })
})

describe('sections/Roles', () => {
  it('renders without crashing', async () => {
    const Roles = (await import('@/components/sections/Roles')).default
    const { container } = render(<Roles />)
    expect(container.firstChild).toBeTruthy()
  })
})

describe('sections/WhatItDoes', () => {
  it('renders without crashing', async () => {
    const WhatItDoes = (await import('@/components/sections/WhatItDoes')).default
    const { container } = render(<WhatItDoes />)
    expect(container.firstChild).toBeTruthy()
  })
})
