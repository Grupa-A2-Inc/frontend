import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LessonResources from '@/components/course-content/LessonResources'
import type { LessonResource } from '@/lib/courses/types'

const resources: LessonResource[] = [
  { id: 'r1', title: 'PDF Guide', url: 'https://example.com/guide.pdf', lessonId: 'l1' },
  { id: 'r2', title: 'External Link', url: 'https://example.com/page', lessonId: 'l1' },
  { id: 'r3', title: 'YouTube Video', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', lessonId: 'l1' },
]

describe('LessonResources', () => {
  it('returns null when resources are empty', () => {
    const { container } = render(<LessonResources resources={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders resource titles', () => {
    render(<LessonResources resources={resources} />)
    expect(screen.getByText('PDF Guide')).toBeInTheDocument()
    expect(screen.getByText('External Link')).toBeInTheDocument()
  })

  it('renders "Resurse Atașate" heading', () => {
    render(<LessonResources resources={resources} />)
    expect(screen.getByText('Resurse Atașate')).toBeInTheDocument()
  })

  it('renders a link for non-YouTube resource', () => {
    render(<LessonResources resources={[resources[1]]} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com/page')
  })

  it('renders iframe for YouTube resource', () => {
    render(<LessonResources resources={[resources[2]]} />)
    expect(document.querySelector('iframe')).toBeInTheDocument()
  })
})
