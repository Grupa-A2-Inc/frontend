import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Constellation from '@/components/Constellation'

describe('Constellation', () => {
  it('renders without crash', () => {
    render(<Constellation />)
    expect(document.body).toBeTruthy()
  })

  it('renders an SVG element', () => {
    const { container } = render(<Constellation />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders star points', () => {
    const { container } = render(<Constellation />)
    expect(container.querySelectorAll('.star-point').length).toBeGreaterThan(0)
  })
})
