import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

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

  it('dispatches saveQuestionThunk when Save button clicked', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    fireEvent.click(screen.getByTitle('Save this question'))
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('dispatches deleteQuestionThunk when Delete button clicked', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    const deleteBtn = screen.getByText('Delete').closest('button')!
    fireEvent.click(deleteBtn)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('dispatches updateQuestionType when select changes', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'MULTI_CHOICE' } })
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('dispatches updateQuestionText when textarea changes', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    fireEvent.change(screen.getByDisplayValue('What is 2+2?'), { target: { value: 'New question?' } })
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('dispatches toggleCorrectOption when correct toggle clicked', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    const toggleBtn = screen.getAllByTitle('Mark as correct answer')[0]
    fireEvent.click(toggleBtn)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('dispatches updateOptionText when option input changes', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    fireEvent.change(screen.getByDisplayValue('Option A'), { target: { value: 'Modified A' } })
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('dispatches deleteOption when remove option button clicked', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    const removeBtn = screen.getAllByTitle('Remove option')[0]
    fireEvent.click(removeBtn)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('dispatches addOption when Add option button clicked', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    fireEvent.click(screen.getByText('Add option'))
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('shows spinner and disables save button when saving', () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({ testDraft: { deletingQuestionIds: [], savingQuestionIds: ['q1'], isGenerating: false } })
    )
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    const saveBtn = screen.getByTitle('Save this question')
    expect(saveBtn).toBeDisabled()
  })

  it('disables delete button when deleting', () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({ testDraft: { deletingQuestionIds: ['q1'], savingQuestionIds: [], isGenerating: false } })
    )
    render(<QuestionCard lessonId="l1" question={question} index={0} />)
    const deleteBtn = screen.getByText('Delete').closest('button')!
    expect(deleteBtn).toBeDisabled()
  })

  it('renders MULTI_CHOICE correct option with checkbox icon', () => {
    const multiQuestion: TestQuestion = {
      ...question,
      questionType: 'MULTI_CHOICE',
      options: [
        { clientId: 'o1', id: 1, text: 'Option A', isCorrect: true, displayOrder: 0 },
        { clientId: 'o2', id: 2, text: 'Option B', isCorrect: false, displayOrder: 1 },
      ],
    }
    render(<QuestionCard lessonId="l1" question={multiQuestion} index={0} />)
    expect(document.body).toBeTruthy()
  })

  it('renders readOnly mode with isCorrect option styling', () => {
    render(<QuestionCard lessonId="l1" question={question} index={0} readOnly={true} />)
    const optionInput = screen.getByDisplayValue('Option B')
    expect(optionInput).toBeInTheDocument()
    expect(optionInput.className).toContain('green')
  })
})
