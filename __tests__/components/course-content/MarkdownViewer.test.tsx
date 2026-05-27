import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MarkdownViewer from '@/components/course-content/MarkdownViewer'

describe('MarkdownViewer', () => {
  it('renders empty state for empty content', () => {
    render(<MarkdownViewer content="" />)
    expect(screen.getByText('Nu există conținut pentru această lecție.')).toBeInTheDocument()
  })

  it('renders plain text content', () => {
    render(<MarkdownViewer content="Hello world" />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders markdown heading', () => {
    render(<MarkdownViewer content="# My Heading" />)
    expect(screen.getByRole('heading', { name: 'My Heading' })).toBeInTheDocument()
  })

  it('renders markdown list items', () => {
    render(<MarkdownViewer content={'- Item 1\n- Item 2'} />)
    expect(screen.getByText(/Item 1/)).toBeInTheDocument()
    expect(screen.getByText(/Item 2/)).toBeInTheDocument()
  })

  it('renders markdown bold text', () => {
    render(<MarkdownViewer content="**Bold text**" />)
    expect(screen.getByText('Bold text')).toBeInTheDocument()
  })

  it('renders inline code', () => {
    render(<MarkdownViewer content="Use `console.log` for debugging" />)
    expect(screen.getByText('console.log')).toBeInTheDocument()
  })
})
