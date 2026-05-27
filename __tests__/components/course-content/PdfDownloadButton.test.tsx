import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PdfDownloadButton from '@/components/course-content/PdfDownloadButton'

describe('PdfDownloadButton', () => {
  it('renders the title', () => {
    render(<PdfDownloadButton url="https://example.com/doc.pdf" title="Lecture Notes" />)
    expect(screen.getByText('Lecture Notes')).toBeInTheDocument()
  })

  it('renders a link with the correct href', () => {
    render(<PdfDownloadButton url="https://example.com/doc.pdf" title="Notes" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', 'https://example.com/doc.pdf')
  })

  it('opens in new tab', () => {
    render(<PdfDownloadButton url="https://example.com/doc.pdf" title="Notes" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('has download attribute', () => {
    render(<PdfDownloadButton url="https://example.com/doc.pdf" title="Notes" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('download')
  })
})
