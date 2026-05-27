import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AdaptiveQuestionCard from '@/components/adaptive/AdaptiveQuestionCard'
import type { ClientExercise, ClientResult } from '@/lib/adaptive/types'

const exercise: ClientExercise = {
  exerciseId: 'e1',
  text: 'What is 2+2?',
  type: 'SINGLE_CHOICE',
  answers: ['3', '4', '5'],
}

const multiExercise: ClientExercise = {
  exerciseId: 'e2',
  text: 'Select even numbers',
  type: 'MULTI_CHOICE',
  answers: ['2', '3', '4'],
}

const result: ClientResult = {
  mlExerciseId: 'e1',
  correct: true,
  score: 1.0,
  correctAnswers: ['4'],
  givenAnswers: ['4'],
}

describe('AdaptiveQuestionCard', () => {
  it('renders question text', () => {
    render(<AdaptiveQuestionCard mode="take" exercise={exercise} index={0} selectedAnswers={[]} onAnswer={vi.fn()} />)
    expect(screen.getByText('What is 2+2?')).toBeInTheDocument()
  })

  it('renders answer options', () => {
    render(<AdaptiveQuestionCard mode="take" exercise={exercise} index={0} selectedAnswers={[]} onAnswer={vi.fn()} />)
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('shows "Question 1" label', () => {
    render(<AdaptiveQuestionCard mode="take" exercise={exercise} index={0} selectedAnswers={[]} onAnswer={vi.fn()} />)
    expect(screen.getByText('Question 1')).toBeInTheDocument()
  })

  it('calls onAnswer when answer is clicked', () => {
    const onAnswer = vi.fn()
    render(<AdaptiveQuestionCard mode="take" exercise={exercise} index={0} selectedAnswers={[]} onAnswer={onAnswer} />)
    fireEvent.click(screen.getByText('4'))
    expect(onAnswer).toHaveBeenCalledWith('e1', '4', false)
  })

  it('shows Multiple answers label for MULTI_CHOICE', () => {
    render(<AdaptiveQuestionCard mode="take" exercise={multiExercise} index={0} selectedAnswers={[]} onAnswer={vi.fn()} />)
    expect(screen.getByText('Multiple answers')).toBeInTheDocument()
  })

  it('renders review mode with correct result', () => {
    render(<AdaptiveQuestionCard mode="review" exercise={exercise} index={0} result={result} />)
    expect(screen.getByText(/\+1\.0/)).toBeInTheDocument()
  })

  it('renders review mode with incorrect result', () => {
    const wrongResult: ClientResult = { ...result, correct: false, score: 0, givenAnswers: ['3'] }
    render(<AdaptiveQuestionCard mode="review" exercise={exercise} index={0} result={wrongResult} />)
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})
