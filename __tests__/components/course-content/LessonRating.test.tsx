import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockDispatch = vi.fn()
const mockSelector = vi.fn()

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (s: unknown) => unknown) => mockSelector(selector),
}))

vi.mock('@/store/slices/lessonRatingSlice', () => ({
  fetchLessonRating: vi.fn(() => ({ type: 'lessonRating/fetch' })),
  submitLessonRating: vi.fn(() => ({ type: 'lessonRating/submit' })),
}))

import LessonRating from '@/components/course-content/LessonRating'

function makeState(overrides = {}) {
  return {
    lessonRating: {
      summary: null,
      loading: false,
      submitting: false,
      error: null,
      ...overrides,
    },
  }
}

beforeEach(() => {
  mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
    selector(makeState())
  )
})

describe('LessonRating', () => {
  it('shows loading initially (isMounted is false on first render)', () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector(makeState({ loading: true }))
    )
    render(<LessonRating lessonId="l1" />)
    expect(screen.getByText(/verificare status evaluare/i)).toBeInTheDocument()
  })

  it('renders star buttons after mounted', async () => {
    render(<LessonRating lessonId="l1" />)
    // after useEffect sets isMounted=true, 5 star buttons should appear
    const buttons = await screen.findAllByRole('button')
    expect(buttons).toHaveLength(5)
  })

  it('shows unvoted question text', async () => {
    render(<LessonRating lessonId="l1" />)
    expect(await screen.findByText('Cum ți s-a părut această lecție?')).toBeInTheDocument()
  })

  it('dispatches fetchLessonRating on mount', () => {
    render(<LessonRating lessonId="l1" />)
    expect(mockDispatch).toHaveBeenCalled()
  })

  it('shows already voted message when myRating > 0', async () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector(makeState({ summary: { lessonId: 'l1', myRating: 4, avgRating: 4.2, totalRatings: 10 } }))
    )
    render(<LessonRating lessonId="l1" />)
    expect(await screen.findByText('Ai evaluat această lecție')).toBeInTheDocument()
  })

  it('shows error when error is set', async () => {
    mockSelector.mockImplementation((selector: (s: unknown) => unknown) =>
      selector(makeState({ error: 'Failed to load' }))
    )
    render(<LessonRating lessonId="l1" />)
    expect(await screen.findByText(/Failed to load/)).toBeInTheDocument()
  })

  it('dispatches submitLessonRating when star is clicked', async () => {
    render(<LessonRating lessonId="l1" />)
    const buttons = await screen.findAllByRole('button')
    fireEvent.click(buttons[2])
    expect(mockDispatch).toHaveBeenCalled()
  })
})
