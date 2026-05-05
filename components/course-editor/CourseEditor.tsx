"use client";

import Link from "next/link";
import { AddNodeModal } from "./AddNodeModal";
import { ContentTree } from "./ContentTree";
import { CourseEditorHeader } from "./CourseEditorHeader";
import { CourseMetaForm } from "./CourseMetaForm";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { NodeEditorPanel } from "./NodeEditorPanel";
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

  if (editor.loadErr) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-red-400 text-sm">{editor.loadErr}</p>
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
        saveErr={editor.saveErr}
        onSave={editor.handleSaveCourse}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[360px] flex-shrink-0 flex flex-col border-r border-brand-primary/10 overflow-y-auto">
          <CourseMetaForm
            title={editor.title}
            description={editor.description}
            expirationDate={editor.expirationDate}
            status={editor.status}
            onTitleChange={editor.setTitle}
            onDescriptionChange={editor.setDescription}
            onExpirationChange={editor.setExpiration}
            onStatusChange={editor.setStatus}
          />
          <ContentTree
            chapters={editor.chapters}
            selected={editor.selected}
            onSelect={editor.setSelected}
            onAddChapter={editor.openAddChapter}
            onAddLeaf={editor.openAddLeaf}
            onMoveChapter={editor.moveChapter}
            onMoveLeaf={editor.moveLeaf}
            onDeleteChapter={editor.promptDeleteChapter}
            onDeleteLeaf={editor.promptDeleteLeaf}
          />
        </div>
        <NodeEditorPanel
          selected={editor.selected}
          selectedType={editor.selectedType}
          selectedLeaf={editor.selectedLeaf}
          nodeForm={editor.nodeForm}
          savingNode={editor.savingNode}
          saveNodeOk={editor.saveNodeOk}
          saveNodeError={editor.saveNodeError}
          courseId={courseId}
          fileInputRef={editor.fileInputRef}
          onFormChange={editor.setNodeForm}
          onSaveNode={editor.handleSaveNode}
        />
      </div>
      {editor.addTarget && (
        <AddNodeModal
          addTarget={editor.addTarget}
          addType={editor.addType}
          addForm={editor.addForm}
          addingNode={editor.addingNode}
          addNodeErr={editor.addNodeErr}
          onClose={editor.closeAddModal}
          onTypeChange={editor.setAddType}
          onFormChange={editor.setAddForm}
          onAddNode={editor.handleAddNode}
        />
      )}
      {editor.deleteTarget && (
        <DeleteConfirmModal
          deleteTarget={editor.deleteTarget}
          deleting={editor.deleting}
          deleteErr={editor.deleteErr}
          onClose={editor.closeDeleteModal}
          onConfirm={editor.handleDeleteConfirm}
        />
      )}
    </div>
  );
}
