import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import DoodleBackground from '@/components/DoodleBackground'

describe('DoodleBackground', () => {
  it('renders without crash', () => {
    render(<DoodleBackground />)
    expect(document.body).toBeTruthy()
  })

  it('renders an SVG element', () => {
    const { container } = render(<DoodleBackground />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders a doodle pattern', () => {
    const { container } = render(<DoodleBackground />)
    expect(container.querySelector('pattern#doodle-pattern')).toBeTruthy()
  })
})
