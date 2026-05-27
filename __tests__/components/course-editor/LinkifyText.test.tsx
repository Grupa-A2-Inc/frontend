import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LinkifyText } from '@/components/course-editor/LinkifyText'

describe('LinkifyText', () => {
  it('renders plain text without links', () => {
    render(<LinkifyText text="Hello world" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('renders a URL as a clickable link', () => {
    render(<LinkifyText text="Visit https://example.com for more" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('preserves text before and after the URL', () => {
    render(<LinkifyText text="See https://example.com now" />)
    expect(screen.getByText(/See/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'https://example.com' })).toBeInTheDocument()
  })

  it('renders multiple URLs as multiple links', () => {
    render(<LinkifyText text="Go https://a.com and https://b.com" />)
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(2)
    expect(links[0]).toHaveAttribute('href', 'https://a.com')
    expect(links[1]).toHaveAttribute('href', 'https://b.com')
  })

  it('renders text with no URL unchanged', () => {
    render(<LinkifyText text="No links here" />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
