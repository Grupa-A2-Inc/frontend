import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import DaySky from '@/components/DaySky'

describe('DaySky', () => {
  it('renders without crash', () => {
    render(<DaySky />)
    expect(document.body).toBeTruthy()
  })

  it('renders an SVG element', () => {
    const { container } = render(<DaySky />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders cloud elements', () => {
    const { container } = render(<DaySky />)
    const clouds = container.querySelectorAll('[class*="anim-cloud"]')
    expect(clouds.length).toBeGreaterThan(0)
  })

  it('renders bird elements', () => {
    const { container } = render(<DaySky />)
    const birds = container.querySelectorAll('[class*="anim-bird"]')
    expect(birds.length).toBeGreaterThan(0)
  })

  it('renders the outer wrapper div', () => {
    const { container } = render(<DaySky />)
    expect(container.firstChild).toBeTruthy()
  })
})
