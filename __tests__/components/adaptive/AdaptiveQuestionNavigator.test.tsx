import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdaptiveQuestionNavigator from '@/components/adaptive/AdaptiveQuestionNavigator'
import type { ClientExercise } from '@/lib/adaptive/types'

const exercises: ClientExercise[] = [
  { exerciseId: 'e1', text: 'Q1', type: 'SINGLE_CHOICE', answers: ['A', 'B'] },
  { exerciseId: 'e2', text: 'Q2', type: 'SINGLE_CHOICE', answers: ['C', 'D'] },
  { exerciseId: 'e3', text: 'Q3', type: 'MULTI_CHOICE', answers: ['E', 'F'] },
]

describe('AdaptiveQuestionNavigator', () => {
  it('returns null for empty exercises', () => {
    const { container } = render(<AdaptiveQuestionNavigator exercises={[]} answeredIds={new Set()} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a button for each exercise', () => {
    render(<AdaptiveQuestionNavigator exercises={exercises} answeredIds={new Set()} />)
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('renders question numbers', () => {
    render(<AdaptiveQuestionNavigator exercises={exercises} answeredIds={new Set()} />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows answered count', () => {
    render(<AdaptiveQuestionNavigator exercises={exercises} answeredIds={new Set(['e1', 'e3'])} />)
    expect(screen.getByText('2 / 3 answered')).toBeInTheDocument()
  })

  it('renders Go to question heading', () => {
    render(<AdaptiveQuestionNavigator exercises={exercises} answeredIds={new Set()} />)
    expect(screen.getByText('Go to question')).toBeInTheDocument()
  })
})
