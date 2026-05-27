import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/store/hooks', () => ({
  useAppSelector: (selector: (s: unknown) => unknown) =>
    selector({ testDraft: { isGenerating: false } }),
}))

import TestSettingsPanel from '@/components/tests/TestSettingsPanel'

const baseProps = {
  lessonTitle: 'Intro Lesson',
  title: 'My Test',
  onTitleChange: vi.fn(),
  description: '',
  onDescriptionChange: vi.fn(),
  timeLimitSec: 300,
  onTimeLimitChange: vi.fn(),
  onSaveMetadata: vi.fn(),
  onGenerate: vi.fn(),
}

describe('TestSettingsPanel', () => {
  it('renders lesson title input', () => {
    render(<TestSettingsPanel {...baseProps} />)
    expect(screen.getByDisplayValue('Intro Lesson')).toBeInTheDocument()
  })

  it('renders test title input', () => {
    render(<TestSettingsPanel {...baseProps} />)
    expect(screen.getByDisplayValue('My Test')).toBeInTheDocument()
  })

  it('calls onTitleChange when test title changes', () => {
    const onTitleChange = vi.fn()
    render(<TestSettingsPanel {...baseProps} onTitleChange={onTitleChange} />)
    const inputs = screen.getAllByRole('textbox')
    const titleInput = inputs.find(i => (i as HTMLInputElement).value === 'My Test')!
    fireEvent.change(titleInput, { target: { value: 'New Test Title' } })
    expect(onTitleChange).toHaveBeenCalledWith('New Test Title')
  })

  it('renders Save settings button', () => {
    render(<TestSettingsPanel {...baseProps} />)
    expect(screen.getByText('Save settings')).toBeInTheDocument()
  })

  it('calls onSaveMetadata when Save settings is clicked', () => {
    const onSaveMetadata = vi.fn()
    render(<TestSettingsPanel {...baseProps} onSaveMetadata={onSaveMetadata} />)
    fireEvent.click(screen.getByText('Save settings'))
    expect(onSaveMetadata).toHaveBeenCalled()
  })

  it('renders Generate AI button', () => {
    render(<TestSettingsPanel {...baseProps} />)
    expect(screen.getByText('Generate AI')).toBeInTheDocument()
  })

  it('calls onGenerate when Generate AI is clicked', () => {
    const onGenerate = vi.fn()
    render(<TestSettingsPanel {...baseProps} onGenerate={onGenerate} />)
    fireEvent.click(screen.getByText('Generate AI'))
    expect(onGenerate).toHaveBeenCalledWith(5)
  })

  it('increases time limit on + button click', () => {
    const onTimeLimitChange = vi.fn()
    render(<TestSettingsPanel {...baseProps} onTimeLimitChange={onTimeLimitChange} />)
    fireEvent.click(screen.getByLabelText('Increase time limit'))
    expect(onTimeLimitChange).toHaveBeenCalledWith(360)
  })

  it('shows generateWarning if provided', () => {
    render(<TestSettingsPanel {...baseProps} generateWarning="No lesson content" />)
    expect(screen.getByText('No lesson content')).toBeInTheDocument()
  })

  it('decreases time limit on - button click', () => {
    const onTimeLimitChange = vi.fn()
    render(<TestSettingsPanel {...baseProps} onTimeLimitChange={onTimeLimitChange} timeLimitSec={360} />)
    fireEvent.click(screen.getByLabelText('Decrease time limit'))
    expect(onTimeLimitChange).toHaveBeenCalledWith(300)
  })

  it('shows minimum time limit warning when below threshold', () => {
    render(<TestSettingsPanel {...baseProps} timeLimitSec={10} />)
    expect(screen.getByText(/Minimum time limit/)).toBeInTheDocument()
  })

  it('shows title required warning when title is empty', () => {
    render(<TestSettingsPanel {...baseProps} title="" />)
    expect(screen.getByText('Test title is required.')).toBeInTheDocument()
  })

  it('hides Save button in readOnly mode', () => {
    render(<TestSettingsPanel {...baseProps} readOnly={true} />)
    expect(screen.queryByText('Save settings')).not.toBeInTheDocument()
  })

  it('shows Saving... when isSavingMetadata is true', () => {
    render(<TestSettingsPanel {...baseProps} isSavingMetadata={true} />)
    expect(screen.getByText('Saving')).toBeInTheDocument()
  })

  it('increases AI question count on + click', () => {
    render(<TestSettingsPanel {...baseProps} />)
    fireEvent.click(screen.getByLabelText('Increase AI question count'))
    expect(screen.getByLabelText('AI question count')).toHaveValue('6')
  })

  it('decreases AI question count on - click', () => {
    render(<TestSettingsPanel {...baseProps} />)
    // Increase first so we can decrease
    fireEvent.click(screen.getByLabelText('Increase AI question count'))
    fireEvent.click(screen.getByLabelText('Decrease AI question count'))
    expect(screen.getByLabelText('AI question count')).toHaveValue('5')
  })

  it('calls onDescriptionChange when description changes', () => {
    const onDescriptionChange = vi.fn()
    render(<TestSettingsPanel {...baseProps} description="old desc" onDescriptionChange={onDescriptionChange} />)
    fireEvent.change(screen.getByDisplayValue('old desc'), { target: { value: 'new desc' } })
    expect(onDescriptionChange).toHaveBeenCalledWith('new desc')
  })

  it('disables Generate AI button when generateDisabled', () => {
    render(<TestSettingsPanel {...baseProps} generateDisabled={true} />)
    const genBtn = screen.getByText('Generate AI').closest('button')!
    expect(genBtn).toBeDisabled()
  })
})
