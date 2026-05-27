import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import MeltingDivider from '@/components/MeltingDivider'

describe('MeltingDivider', () => {
  it('renders without crash', () => {
    render(<MeltingDivider fromClass="from-white" toClass="to-gray-100" />)
    expect(document.body).toBeTruthy()
  })

  it('renders animated drop elements', () => {
    const { container } = render(<MeltingDivider fromClass="from-white" toClass="to-gray-100" />)
    expect(container.querySelectorAll('.animate-rain').length).toBeGreaterThan(0)
  })

  it('applies fromClass and toClass CSS classes', () => {
    const { container } = render(<MeltingDivider fromClass="from-white" toClass="to-blue-500" />)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.className).toContain('from-white')
    expect(wrapper.className).toContain('to-blue-500')
  })
})
