import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href }, children),
}))

vi.mock('@/components/course-editor/helpers', () => ({
  entityIcon: (kind: string) => kind === 'chapter' ? 'folder' : kind === 'lesson' ? 'article' : 'link',
  entityLabel: (kind: string) => kind === 'chapter' ? 'Chapter' : kind === 'lesson' ? 'Lesson' : 'Resource',
}))

import React from 'react'
import { EditorPanel } from '@/components/course-editor/EditorPanel'
import type { EditorForm, SelectedRef } from '@/components/course-editor/types'

const baseForm: EditorForm = {
  title: 'My Chapter',
  contentMarkdown: '',
  url: '',
}

const chapterSelected: SelectedRef = { kind: 'chapter', id: 'ch1' }
const lessonSelected: SelectedRef = { kind: 'lesson', chapterId: 'ch1', id: 'l1' }
const resourceSelected: SelectedRef = { kind: 'resource', chapterId: 'ch1', lessonId: 'l1', id: 'r1' }

const baseProps = {
  mode: 'edit' as const,
  courseId: 'c1',
  selected: chapterSelected,
  selectedKind: 'chapter' as const,
  selectedLesson: null,
  form: baseForm,
  saving: false,
  saved: false,
  error: null,
  onFormChange: vi.fn(),
  onSave: vi.fn(),
}

describe('EditorPanel', () => {
  it('shows empty state when nothing selected', () => {
    render(<EditorPanel {...baseProps} selected={null} selectedKind={null} />)
    expect(screen.getByText(/Select a chapter, lesson, or resource/)).toBeInTheDocument()
  })

  it('renders chapter form with Title field', () => {
    render(<EditorPanel {...baseProps} />)
    expect(screen.getByDisplayValue('My Chapter')).toBeInTheDocument()
  })

  it('shows Chapter label badge', () => {
    render(<EditorPanel {...baseProps} />)
    expect(screen.getByText('Chapter')).toBeInTheDocument()
  })

  it('shows Save Chapter button', () => {
    render(<EditorPanel {...baseProps} />)
    expect(screen.getByText('Save Chapter')).toBeInTheDocument()
  })

  it('calls onSave when save button clicked', () => {
    const onSave = vi.fn()
    render(<EditorPanel {...baseProps} onSave={onSave} />)
    fireEvent.click(screen.getByText('Save Chapter'))
    expect(onSave).toHaveBeenCalled()
  })

  it('disables save button when saving', () => {
    render(<EditorPanel {...baseProps} saving={true} />)
    expect(screen.getByText('Saving...')).toBeInTheDocument()
    const btn = screen.getByRole('button', { name: /saving/i })
    expect(btn).toBeDisabled()
  })

  it('disables save button when title is blank', () => {
    render(<EditorPanel {...baseProps} form={{ ...baseForm, title: '' }} />)
    const btn = screen.getByRole('button', { name: /save chapter/i })
    expect(btn).toBeDisabled()
  })

  it('shows required error when title is blank', () => {
    render(<EditorPanel {...baseProps} form={{ ...baseForm, title: '   ' }} />)
    expect(screen.getByText('Title is required.')).toBeInTheDocument()
  })

  it('shows Saved indicator when saved', () => {
    render(<EditorPanel {...baseProps} saved={true} />)
    expect(screen.getByText('Saved')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<EditorPanel {...baseProps} error="Save failed" />)
    expect(screen.getByText('Save failed')).toBeInTheDocument()
  })

  it('renders lesson form with content textarea', () => {
    render(<EditorPanel {...baseProps} selected={lessonSelected} selectedKind="lesson" />)
    expect(screen.getByPlaceholderText(/Write lesson content/)).toBeInTheDocument()
  })

  it('shows Lesson label for lesson kind', () => {
    render(<EditorPanel {...baseProps} selected={lessonSelected} selectedKind="lesson" />)
    expect(screen.getByText('Lesson')).toBeInTheDocument()
  })

  it('shows preview when lesson content is non-empty', () => {
    render(<EditorPanel {...baseProps} selected={lessonSelected} selectedKind="lesson" form={{ ...baseForm, contentMarkdown: '# Preview heading' }} />)
    expect(screen.getByText('Preview')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Preview heading' })).toBeInTheDocument()
  })

  it('shows "Tests can be added after course created" in create mode for lesson', () => {
    render(<EditorPanel {...baseProps} mode="create" selected={lessonSelected} selectedKind="lesson" />)
    expect(screen.getByText(/Tests can be added after the course is created/)).toBeInTheDocument()
  })

  it('shows Create Test link in edit mode for saved lesson', () => {
    render(<EditorPanel {...baseProps} selected={lessonSelected} selectedKind="lesson"
      selectedLesson={{ id: 'l1', title: 'L1', contentMarkdown: '', orderIndex: 0, resources: [] }} />)
    expect(screen.getByText('Create Test')).toBeInTheDocument()
  })

  it('shows Open Test Editor link when lesson has testId', () => {
    render(<EditorPanel {...baseProps} selected={lessonSelected} selectedKind="lesson"
      selectedLesson={{ id: 'l1', title: 'L1', contentMarkdown: '', orderIndex: 0, resources: [], testId: 'tst1' }} />)
    expect(screen.getByText('Open Test Editor')).toBeInTheDocument()
  })

  it('renders resource form with URL field', () => {
    render(<EditorPanel {...baseProps} selected={resourceSelected} selectedKind="resource" form={{ ...baseForm, url: '' }} />)
    expect(screen.getByPlaceholderText('https://example.com/resource')).toBeInTheDocument()
  })

  it('shows Resource label for resource kind', () => {
    render(<EditorPanel {...baseProps} selected={resourceSelected} selectedKind="resource" />)
    expect(screen.getByText('Resource')).toBeInTheDocument()
  })

  it('disables save for resource when url is blank', () => {
    render(<EditorPanel {...baseProps} selected={resourceSelected} selectedKind="resource" form={{ ...baseForm, url: '' }} />)
    expect(screen.getByText('Resource URL is required.')).toBeInTheDocument()
  })

  it('calls onFormChange when title input changes', () => {
    const onFormChange = vi.fn()
    render(<EditorPanel {...baseProps} onFormChange={onFormChange} />)
    const input = screen.getByDisplayValue('My Chapter')
    fireEvent.change(input, { target: { value: 'New Title' } })
    expect(onFormChange).toHaveBeenCalled()
  })

  it('calls onFormChange when content textarea changes', () => {
    const onFormChange = vi.fn()
    render(<EditorPanel {...baseProps} selected={lessonSelected} selectedKind="lesson" onFormChange={onFormChange} />)
    const textarea = screen.getByPlaceholderText(/Write lesson content/)
    fireEvent.change(textarea, { target: { value: 'new content' } })
    expect(onFormChange).toHaveBeenCalled()
  })

  it('does not show LessonTestAction for temp lesson', () => {
    render(<EditorPanel {...baseProps} selected={lessonSelected} selectedKind="lesson"
      selectedLesson={{ id: 'temp_123', title: 'Temp', contentMarkdown: '', orderIndex: 0, resources: [] }} />)
    expect(screen.queryByText('Create Test')).not.toBeInTheDocument()
  })
})
