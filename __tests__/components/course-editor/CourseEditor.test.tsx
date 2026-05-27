import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href }, children),
}))

vi.mock('@/components/course-editor/useCourseEditor', () => ({
  useCourseEditor: vi.fn(),
}))

vi.mock('@/components/course-editor/CourseEditorHeader', () => ({
  CourseEditorHeader: ({ mode, title }: { mode: string; title: string }) =>
    React.createElement('div', { 'data-testid': 'editor-header' }, `${mode}: ${title}`),
}))

vi.mock('@/components/course-editor/CourseMetaForm', () => ({
  CourseMetaForm: () => React.createElement('div', { 'data-testid': 'meta-form' }),
}))

vi.mock('@/components/course-editor/ContentTree', () => ({
  ContentTree: () => React.createElement('div', { 'data-testid': 'content-tree' }),
}))

vi.mock('@/components/course-editor/EditorPanel', () => ({
  EditorPanel: () => React.createElement('div', { 'data-testid': 'editor-panel' }),
}))

vi.mock('@/components/course-editor/AddEntityModal', () => ({
  AddEntityModal: ({ onClose }: { onClose: () => void }) =>
    React.createElement('div', { 'data-testid': 'add-entity-modal' },
      React.createElement('button', { onClick: onClose }, 'Close Add')
    ),
}))

vi.mock('@/components/course-editor/DeleteConfirmModal', () => ({
  DeleteConfirmModal: ({ onClose }: { onClose: () => void }) =>
    React.createElement('div', { 'data-testid': 'delete-confirm-modal' },
      React.createElement('button', { onClick: onClose }, 'Close Delete')
    ),
}))

import React from 'react'
import CourseEditor from '@/components/course-editor/CourseEditor'
import { useCourseEditor } from '@/components/course-editor/useCourseEditor'

const mockUseCourseEditor = vi.mocked(useCourseEditor)

const baseEditorState = {
  loading: false,
  loadError: null,
  title: 'Test Course',
  description: 'A description',
  category: 'Web',
  status: 'DRAFT' as const,
  chapters: [],
  selected: null,
  selectedKind: null,
  selectedLesson: null,
  form: { title: '', contentMarkdown: '', url: '' },
  saving: false,
  saveOk: false,
  saveError: null,
  savingEntity: false,
  saveEntityOk: false,
  saveEntityError: null,
  addTarget: null,
  addForm: { title: '', url: '' },
  addingEntity: false,
  addEntityError: null,
  deleteTarget: null,
  deleting: false,
  deleteError: null,
  setTitle: vi.fn(),
  setDescription: vi.fn(),
  setCategory: vi.fn(),
  setStatus: vi.fn(),
  setSelected: vi.fn(),
  setForm: vi.fn(),
  setAddForm: vi.fn(),
  handleSaveCourse: vi.fn(),
  handleSaveEntity: vi.fn(),
  handleAddEntity: vi.fn(),
  handleDeleteConfirm: vi.fn(),
  openAddChapter: vi.fn(),
  openAddLesson: vi.fn(),
  openAddResource: vi.fn(),
  closeAddModal: vi.fn(),
  promptDeleteChapter: vi.fn(),
  promptDeleteLesson: vi.fn(),
  promptDeleteResource: vi.fn(),
  closeDeleteModal: vi.fn(),
  moveChapter: vi.fn(),
  moveLesson: vi.fn(),
}

describe('CourseEditor', () => {
  it('shows loading state', () => {
    mockUseCourseEditor.mockReturnValue({ ...baseEditorState, loading: true })
    render(<CourseEditor mode="edit" courseId="c1" />)
    expect(screen.getByText('Loading course...')).toBeInTheDocument()
  })

  it('shows load error with back link', () => {
    mockUseCourseEditor.mockReturnValue({ ...baseEditorState, loadError: 'Course not found' })
    render(<CourseEditor mode="edit" courseId="c1" />)
    expect(screen.getByText('Course not found')).toBeInTheDocument()
    expect(screen.getByText('Back to My Courses')).toBeInTheDocument()
  })

  it('renders editor components when loaded', () => {
    mockUseCourseEditor.mockReturnValue(baseEditorState)
    render(<CourseEditor mode="edit" courseId="c1" />)
    expect(screen.getByTestId('editor-header')).toBeInTheDocument()
    expect(screen.getByTestId('meta-form')).toBeInTheDocument()
    expect(screen.getByTestId('content-tree')).toBeInTheDocument()
    expect(screen.getByTestId('editor-panel')).toBeInTheDocument()
  })

  it('renders AddEntityModal when addTarget is set', () => {
    mockUseCourseEditor.mockReturnValue({
      ...baseEditorState,
      addTarget: { type: 'chapter' as const },
    })
    render(<CourseEditor mode="edit" courseId="c1" />)
    expect(screen.getByTestId('add-entity-modal')).toBeInTheDocument()
  })

  it('renders DeleteConfirmModal when deleteTarget is set', () => {
    mockUseCourseEditor.mockReturnValue({
      ...baseEditorState,
      deleteTarget: { type: 'chapter' as const, chapterId: 'ch1', label: 'Chapter One' },
    })
    render(<CourseEditor mode="edit" courseId="c1" />)
    expect(screen.getByTestId('delete-confirm-modal')).toBeInTheDocument()
  })

  it('passes mode to editor header', () => {
    mockUseCourseEditor.mockReturnValue(baseEditorState)
    render(<CourseEditor mode="create" />)
    expect(screen.getByTestId('editor-header').textContent).toContain('create')
  })
})
