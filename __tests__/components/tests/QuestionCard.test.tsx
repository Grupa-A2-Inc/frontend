import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockDispatch = vi.fn()
const mockSelector = vi.fn()

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => mockSelector(selector),
}))

vi.mock('@/store/slices/testDraftSlice', () => ({
  addOption: vi.fn(() => ({ type: 'addOption' })),
  deleteOption: vi.fn(() => ({ type: 'deleteOption' })),
  updateQuestionText: vi.fn(() => ({ type: 'updateQuestionText' })),
  updateQuestionType: vi.fn(() => ({ type: 'updateQuestionType' })),
  updateOptionText: vi.fn(() => ({ type: 'updateOptionText' })),
  toggleCorrectOption: vi.fn(() => ({ type: 'toggleCorrectOption' })),
  deleteQuestionThunk: vi.fn(() => ({ type: 'deleteQuestionThunk' })),
  saveQuestionThunk: vi.fn(() => ({ type: 'saveQuestionThunk' })),
}))

import QuestionCard from '@/components/tests/QuestionCard'
import type { TestQuestion } from '@/lib/tests/types'

const question: TestQuestion = {
  clientId: 'q1',
  content: 'What is 2+2?',
  questionType: 'SINGLE_CHOICE',
  options: [
    { clientId: 'o1', id: 1, text: 'Option A', isCorrect: false, displayOrder: 0 },
    { clientId: 'o2', id: 2, text: 'Option B', isCorrect: true, displayOrder: 1 },
  ],
}

beforeEach(() => {
  mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({ testDraft: { deletingQuestionIds: [], savingQuestionIds: [], isGenerating: false } })
  )
})

describe('QuestionCard', () => {
  it('renders question number', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('renders "Question" heading', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    expect(screen.getByText('Question')).toBeInTheDocument()
  })

  it('renders option text', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    expect(screen.getByDisplayValue('Option A')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Option B')).toBeInTheDocument()
  })

  it('renders Save button in editable mode', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    expect(screen.getByTitle('Save this question')).toBeInTheDocument()
  })

  it('does not render Save/Delete in readOnly mode', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} readOnly={true} />)
    expect(screen.queryByTitle('Save this question')).not.toBeInTheDocument()
  })

  it('renders question type select', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('renders Add option button for non-TRUE_FALSE questions', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    expect(screen.getByText('Add option')).toBeInTheDocument()
  })

  it('shows multiple correct answers info for MULTI_CHOICE', () => {
    render(<QuestionCard lessonId="l1" question={{ ...question, questionType: 'MULTI_CHOICE' }} index={0} />)
    expect(screen.getByText('Multiple correct answers can be selected.')).toBeInTheDocument()
  })

  it('does not show Add option for TRUE_FALSE questions', () => {
    render(<QuestionCard lessonId="l1" question={{ ...question, questionType: 'TRUE_FALSE' }} index={0} />)
    expect(screen.queryByText('Add option')).not.toBeInTheDocument()
  })
})
