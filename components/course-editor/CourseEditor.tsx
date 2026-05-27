"use client";

import Link from "next/link";
import { AddEntityModal } from "./AddEntityModal";
import { ContentTree } from "./ContentTree";
import { CourseEditorHeader } from "./CourseEditorHeader";
import { CourseMetaForm } from "./CourseMetaForm";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { EditorPanel } from "./EditorPanel";
import type { CourseEditorProps } from "./types";
import { useCourseEditor } from "./useCourseEditor";

export default function CourseEditor(props: CourseEditorProps) {
  const { mode, courseId } = props;
  const editor = useCourseEditor(props);

  if (editor.loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-brand-text/40 text-sm">Loading course...</p>
      </div>
    );
  }

  if (editor.loadError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-red-400 text-sm">{editor.loadError}</p>
        <Link href="/dashboard/teacher" className="text-brand-primary text-sm hover:underline">
          Back to My Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 2rem)" }}>
      <CourseEditorHeader
        mode={mode}
        courseId={courseId}
        title={editor.title}
        saving={editor.saving}
        saveOk={editor.saveOk}
        saveErr={editor.saveError}
        onSave={editor.handleSaveCourse}
      />
      <div className="flex flex-col md:flex-row flex-1 md:overflow-hidden">
        <div className="w-full md:w-[380px] md:flex-shrink-0 flex flex-col border-b md:border-b-0 md:border-r border-brand-primary/10 overflow-y-auto">
          <CourseMetaForm
            title={editor.title}
            description={editor.description}
            category={editor.category}
            status={editor.status}
            onTitleChange={editor.setTitle}
            onDescriptionChange={editor.setDescription}
            onCategoryChange={editor.setCategory}
            onStatusChange={editor.setStatus}
          />
          <ContentTree
            mode={mode}
            courseId={courseId}
            chapters={editor.chapters}
            selected={editor.selected}
            onSelect={editor.setSelected}
            onAddChapter={editor.openAddChapter}
            onAddLesson={editor.openAddLesson}
            onAddResource={editor.openAddResource}
            onMoveChapter={editor.moveChapter}
            onMoveLesson={editor.moveLesson}
            onDeleteChapter={editor.promptDeleteChapter}
            onDeleteLesson={editor.promptDeleteLesson}
            onDeleteResource={editor.promptDeleteResource}
          />
        </div>
        <EditorPanel
          mode={mode}
          courseId={courseId}
          selected={editor.selected}
          selectedKind={editor.selectedKind}
          selectedLesson={editor.selectedLesson}
          form={editor.form}
          saving={editor.savingEntity}
          saved={editor.saveEntityOk}
          error={editor.saveEntityError}
          onFormChange={editor.setForm}
          onSave={editor.handleSaveEntity}
        />
      </div>
      {editor.addTarget && (
        <AddEntityModal
          addTarget={editor.addTarget}
          addForm={editor.addForm}
          adding={editor.addingEntity}
          error={editor.addEntityError}
          onClose={editor.closeAddModal}
          onFormChange={editor.setAddForm}
          onAdd={editor.handleAddEntity}
        />
      )}
      {editor.deleteTarget && (
        <DeleteConfirmModal
          deleteTarget={editor.deleteTarget}
          deleting={editor.deleting}
          deleteErr={editor.deleteError}
          onClose={editor.closeDeleteModal}
          onConfirm={editor.handleDeleteConfirm}
        />
      )}
    </div>
  );
}
