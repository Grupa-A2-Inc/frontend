import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import QuestionNavigator from '@/components/tests/QuestionNavigator'
import type { TestQuestion } from '@/lib/tests/types'

const questions: TestQuestion[] = [
  { clientId: 'q1', content: 'Q1', questionType: 'SINGLE_CHOICE', options: [] },
  { clientId: 'q2', content: 'Q2', questionType: 'MULTI_CHOICE', options: [] },
  { clientId: 'q3', content: 'Q3', questionType: 'TRUE_FALSE', options: [] },
]

describe('QuestionNavigator', () => {
  it('returns null for empty questions', () => {
    const { container } = render(<QuestionNavigator questions={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a button for each question', () => {
    render(<QuestionNavigator questions={questions} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('renders question numbers', () => {
    render(<QuestionNavigator questions={questions} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('renders "GO TO QUESTION" heading', () => {
    render(<QuestionNavigator questions={questions} />)
    expect(screen.getByText('GO TO QUESTION')).toBeInTheDocument()
  })
})
