import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createChapter,
  createCourse,
  createLesson,
  createResource,
  deleteChapter,
  deleteLesson,
  deleteResource,
  fetchCourseForEditor,
  updateChapter,
  updateCourse,
  updateLesson,
  updateResource,
  type CourseFullViewDto,
  type CreateCoursePayload,
} from "@/lib/courses/editorApi";
import { EMPTY_FORM, tempId } from "./helpers";
import type {
  AddTarget,
  CourseEditorProps,
  DeleteTarget,
  EditorChapter,
  EditorEntityKind,
  EditorForm,
  EditorLesson,
  EditorResource,
  MoveDirection,
  SelectedRef,
} from "./types";

export function useCourseEditor({ mode, courseId }: CourseEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [chapters, setChapters] = useState<EditorChapter[]>([]);
  const [selected, setSelected] = useState<SelectedRef | null>(null);
  const [form, setForm] = useState<EditorForm>(EMPTY_FORM);
  const [savingEntity, setSavingEntity] = useState(false);
  const [saveEntityError, setSaveEntityError] = useState<string | null>(null);
  const [saveEntityOk, setSaveEntityOk] = useState(false);
  const [addTarget, setAddTarget] = useState<AddTarget | null>(null);
  const [addForm, setAddForm] = useState<EditorForm>(EMPTY_FORM);
  const [addingEntity, setAddingEntity] = useState(false);
  const [addEntityError, setAddEntityError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !courseId) return;

    setLoading(true);
    fetchCourseForEditor(courseId)
      .then(data => {
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setCategory(data.category ?? "");
        setStatus(data.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
        setChapters(mapCourseStructure(data));
      })
      .catch((error: Error) => setLoadError(error.message))
      .finally(() => setLoading(false));
  }, [mode, courseId]);

  const selectedChapter = selected
    ? chapters.find(chapter => chapter.id === selectedChapterId(selected)) ?? null
    : null;
  const selectedLesson = selected && selected.kind !== "chapter"
    ? selectedChapter?.lessons.find(lesson => lesson.id === selectedLessonId(selected)) ?? null
    : null;
  const selectedResource = selected?.kind === "resource"
    ? selectedLesson?.resources.find(resource => resource.id === selected.id) ?? null
    : null;
  const selectedKind: EditorEntityKind | null = selected?.kind ?? null;

  useEffect(() => {
    setSaveEntityError(null);
    setSaveEntityOk(false);

    if (!selected) {
      setForm(EMPTY_FORM);
      return;
    }

    if (selected.kind === "chapter" && selectedChapter) {
      setForm({ title: selectedChapter.title, contentMarkdown: "", url: "" });
      return;
    }

    if (selected.kind === "lesson" && selectedLesson) {
      setForm({
        title: selectedLesson.title,
        contentMarkdown: selectedLesson.contentMarkdown,
        url: "",
      });
      return;
    }

    if (selected.kind === "resource" && selectedResource) {
      setForm({ title: selectedResource.title, contentMarkdown: "", url: selectedResource.url });
    }
  }, [selected, selectedChapter, selectedLesson, selectedResource]);

  async function handleSaveEntity() {
    if (!selected || !form.title.trim()) {
      setSaveEntityError("Title is required.");
      return;
    }

    if (selected.kind === "resource" && !form.url.trim()) {
      setSaveEntityError("Resource URL is required.");
      return;
    }

    setSavingEntity(true);
    setSaveEntityError(null);

    try {
      if (selected.kind === "chapter") {
        if (mode === "edit" && !isTemporary(selected.id)) {
          await updateChapter(selected.id, { title: form.title.trim() });
        }
        setChapters(previous => previous.map(chapter =>
          chapter.id === selected.id ? { ...chapter, title: form.title.trim() } : chapter,
        ));
      } else if (selected.kind === "lesson") {
        if (mode === "edit" && !isTemporary(selected.id)) {
          await updateLesson(selected.id, {
            title: form.title.trim(),
            contentMarkdown: form.contentMarkdown,
          });
        }
        updateLessonInState(selected.chapterId, selected.id, lesson => ({
          ...lesson,
          title: form.title.trim(),
          contentMarkdown: form.contentMarkdown,
        }));
      } else {
        if (mode === "edit" && !isTemporary(selected.id)) {
          await updateResource(selected.lessonId, selected.id, {
            title: form.title.trim(),
            url: form.url.trim(),
          });
        }
        updateResourceInState(selected.chapterId, selected.lessonId, selected.id, resource => ({
          ...resource,
          title: form.title.trim(),
          url: form.url.trim(),
        }));
      }

      setSaveEntityOk(true);
      setTimeout(() => setSaveEntityOk(false), 2000);
    } catch (error) {
      setSaveEntityError(error instanceof Error ? error.message : "Failed to save changes.");
    } finally {
      setSavingEntity(false);
    }
  }

  function openAddChapter() {
    openAdd({ kind: "chapter" });
  }

  function openAddLesson(chapterId: string) {
    openAdd({ kind: "lesson", chapterId });
  }

  function openAddResource(chapterId: string, lessonId: string) {
    openAdd({ kind: "resource", chapterId, lessonId });
  }

  function openAdd(target: AddTarget) {
    setAddTarget(target);
    setAddForm(EMPTY_FORM);
    setAddEntityError(null);
  }

  async function handleAddEntity() {
    if (!addTarget || !addForm.title.trim()) {
      setAddEntityError("Title is required.");
      return;
    }

    if (addTarget.kind === "resource" && !addForm.url.trim()) {
      setAddEntityError("Resource URL is required.");
      return;
    }

    setAddingEntity(true);
    setAddEntityError(null);

    try {
      if (addTarget.kind === "chapter") {
        const id = mode === "edit" && courseId
          ? (await createChapter(courseId, addForm.title.trim())).id
          : tempId();
        if (mode === "edit") {
          await updateChapter(id, { orderIndex: toBackendOrderIndex(chapters.length) });
        }
        const chapter: EditorChapter = {
          id,
          title: addForm.title.trim(),
          orderIndex: chapters.length,
          lessons: [],
        };
        setChapters(previous => [...previous, chapter]);
        setSelected({ kind: "chapter", id });
      } else if (addTarget.kind === "lesson") {
        const chapter = chapters.find(item => item.id === addTarget.chapterId);
        const orderIndex = chapter?.lessons.length ?? 0;
        const id = mode === "edit"
          ? (await createLesson(addTarget.chapterId, {
              title: addForm.title.trim(),
              ...(addForm.contentMarkdown ? { contentMarkdown: addForm.contentMarkdown } : {}),
            })).id
          : tempId();
        const lesson: EditorLesson = {
          id,
          title: addForm.title.trim(),
          contentMarkdown: addForm.contentMarkdown,
          orderIndex,
          resources: [],
        };
        setChapters(previous => previous.map(item =>
          item.id === addTarget.chapterId
            ? { ...item, lessons: [...item.lessons, lesson] }
            : item,
        ));
        setSelected({ kind: "lesson", chapterId: addTarget.chapterId, id });
      } else {
        const id = mode === "edit"
          ? (await createResource(addTarget.lessonId, {
              title: addForm.title.trim(),
              url: addForm.url.trim(),
            })).id
          : tempId();
        const resource: EditorResource = {
          id,
          title: addForm.title.trim(),
          url: addForm.url.trim(),
        };
        updateLessonInState(addTarget.chapterId, addTarget.lessonId, lesson => ({
          ...lesson,
          resources: [...lesson.resources, resource],
        }));
        setSelected({
          kind: "resource",
          chapterId: addTarget.chapterId,
          lessonId: addTarget.lessonId,
          id,
        });
      }

      setAddTarget(null);
    } catch (error) {
      setAddEntityError(error instanceof Error ? error.message : "Failed to add item.");
    } finally {
      setAddingEntity(false);
    }
  }

  function promptDeleteChapter(chapter: EditorChapter) {
    setDeleteError(null);
    setDeleteTarget({
      label: `chapter "${chapter.title || "Untitled"}"`,
      onConfirm: async () => {
        if (mode === "edit" && !isTemporary(chapter.id)) await deleteChapter(chapter.id);
        setChapters(previous => previous.filter(item => item.id !== chapter.id));
        if (selected && selectedChapterId(selected) === chapter.id) setSelected(null);
      },
    });
  }

  function promptDeleteLesson(chapterId: string, lesson: EditorLesson) {
    setDeleteError(null);
    setDeleteTarget({
      label: `lesson "${lesson.title || "Untitled"}"`,
      onConfirm: async () => {
        if (mode === "edit" && !isTemporary(lesson.id)) await deleteLesson(lesson.id);
        setChapters(previous => previous.map(chapter =>
          chapter.id === chapterId
            ? { ...chapter, lessons: chapter.lessons.filter(item => item.id !== lesson.id) }
            : chapter,
        ));
        if (selected && selectedLessonId(selected) === lesson.id) setSelected(null);
      },
    });
  }

  function promptDeleteResource(chapterId: string, lessonId: string, resource: EditorResource) {
    setDeleteError(null);
    setDeleteTarget({
      label: `resource "${resource.title || "Untitled"}"`,
      onConfirm: async () => {
        if (mode === "edit" && !isTemporary(resource.id)) await deleteResource(lessonId, resource.id);
        updateLessonInState(chapterId, lessonId, lesson => ({
          ...lesson,
          resources: lesson.resources.filter(item => item.id !== resource.id),
        }));
        if (selected?.kind === "resource" && selected.id === resource.id) setSelected(null);
      },
    });
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteTarget.onConfirm();
      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to delete item.");
    } finally {
      setDeleting(false);
    }
  }

  async function moveChapter(id: string, direction: MoveDirection) {
    const index = chapters.findIndex(chapter => chapter.id === id);
    if (index < 0 || (direction === "UP" && index === 0) || (direction === "DOWN" && index === chapters.length - 1)) return;

    const reordered = reorder(chapters, index, direction);
    try {
      if (mode === "edit") {
        await Promise.all(reordered.map((chapter, orderIndex) =>
          chapter.orderIndex !== orderIndex
            ? updateChapter(chapter.id, { orderIndex: toBackendOrderIndex(orderIndex) })
            : Promise.resolve(),
        ));
      }
      setChapters(reordered.map((chapter, orderIndex) => ({ ...chapter, orderIndex })));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to reorder chapters.");
    }
  }

  async function moveLesson(chapterId: string, lessonId: string, direction: MoveDirection) {
    const chapter = chapters.find(item => item.id === chapterId);
    const index = chapter?.lessons.findIndex(lesson => lesson.id === lessonId) ?? -1;
    if (!chapter || index < 0 || (direction === "UP" && index === 0) || (direction === "DOWN" && index === chapter.lessons.length - 1)) return;

    const reordered = reorder(chapter.lessons, index, direction);
    try {
      if (mode === "edit") {
        await Promise.all(reordered.map((lesson, orderIndex) =>
          lesson.orderIndex !== orderIndex
            ? updateLesson(lesson.id, { orderIndex: toBackendOrderIndex(orderIndex) })
            : Promise.resolve(),
        ));
      }
      setChapters(previous => previous.map(item =>
        item.id === chapterId
          ? { ...item, lessons: reordered.map((lesson, orderIndex) => ({ ...lesson, orderIndex })) }
          : item,
      ));
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to reorder lessons.");
    }
  }

  async function handleSaveCourse() {
    if (!title.trim()) {
      setSaveError("Course title is required.");
      return;
    }
    if (!category.trim()) {
      setSaveError("Course category is required.");
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveOk(false);
    const metadata = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      status,
    };

    try {
      if (mode === "create") {
        const created = await createCourse(toCreatePayload(metadata, chapters));
        router.push(`/dashboard/teacher/courses/${created.id}`);
      } else {
        await updateCourse(courseId!, metadata);
        setSaveOk(true);
        setTimeout(() => setSaveOk(false), 3000);
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save course.");
    } finally {
      setSaving(false);
    }
  }

  function updateLessonInState(
    chapterId: string,
    lessonId: string,
    update: (lesson: EditorLesson) => EditorLesson,
  ) {
    setChapters(previous => previous.map(chapter =>
      chapter.id === chapterId
        ? { ...chapter, lessons: chapter.lessons.map(lesson => lesson.id === lessonId ? update(lesson) : lesson) }
        : chapter,
    ));
  }

  function updateResourceInState(
    chapterId: string,
    lessonId: string,
    resourceId: string,
    update: (resource: EditorResource) => EditorResource,
  ) {
    updateLessonInState(chapterId, lessonId, lesson => ({
      ...lesson,
      resources: lesson.resources.map(resource => resource.id === resourceId ? update(resource) : resource),
    }));
  }

  return {
    title,
    setTitle,
    description,
    setDescription,
    category,
    setCategory,
    status,
    setStatus,
    chapters,
    selected,
    setSelected,
    selectedKind,
    selectedLesson,
    form,
    setForm,
    savingEntity,
    saveEntityError,
    saveEntityOk,
    addTarget,
    addForm,
    setAddForm,
    addingEntity,
    addEntityError,
    deleteTarget,
    deleting,
    deleteError,
    loading,
    loadError,
    saving,
    saveError,
    saveOk,
    openAddChapter,
    openAddLesson,
    openAddResource,
    handleAddEntity,
    handleSaveEntity,
    promptDeleteChapter,
    promptDeleteLesson,
    promptDeleteResource,
    handleDeleteConfirm,
    closeAddModal: () => setAddTarget(null),
    closeDeleteModal: () => {
      setDeleteTarget(null);
      setDeleteError(null);
    },
    moveChapter,
    moveLesson,
    handleSaveCourse,
  };
}

function isTemporary(id: string): boolean {
  return id.startsWith("temp_");
}

function toBackendOrderIndex(orderIndex: number): number {
  return orderIndex + 1;
}

function toUiOrderIndex(orderIndex: number | null | undefined, fallback: number): number {
  return typeof orderIndex === "number" && Number.isFinite(orderIndex) && orderIndex > 0
    ? orderIndex - 1
    : fallback;
}

function selectedChapterId(selected: SelectedRef): string {
  return selected.kind === "chapter" ? selected.id : selected.chapterId;
}

function selectedLessonId(selected: SelectedRef): string | undefined {
  return selected.kind === "chapter" ? undefined : selected.kind === "lesson" ? selected.id : selected.lessonId;
}

function reorder<T>(items: T[], index: number, direction: MoveDirection): T[] {
  const reordered = [...items];
  const swapIndex = direction === "UP" ? index - 1 : index + 1;
  [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
  return reordered;
}

function mapCourseStructure(data: CourseFullViewDto): EditorChapter[] {
  return (data.chapters ?? []).map((chapter, chapterIndex) => ({
    id: chapter.id,
    title: chapter.title ?? "",
    orderIndex: toUiOrderIndex(chapter.orderIndex, chapterIndex),
    lessons: (chapter.lessons ?? []).map((lesson, lessonIndex) => ({
      id: lesson.id,
      title: lesson.title ?? "",
      contentMarkdown: lesson.contentMarkdown ?? "",
      orderIndex: toUiOrderIndex(lesson.orderIndex, lessonIndex),
      testId: lesson.testId ?? undefined,
      resources: (lesson.lessonResources ?? []).map(resource => ({
        id: resource.id,
        title: resource.title ?? "",
        url: resource.url ?? "",
      })),
    })),
  }));
}

function toCreatePayload(
  metadata: Omit<CreateCoursePayload, "chapters">,
  chapters: EditorChapter[],
): CreateCoursePayload {
  return {
    ...metadata,
    chapters: [...chapters]
      .sort((left, right) => left.orderIndex - right.orderIndex)
      .map((chapter, chapterIndex) => ({
        title: chapter.title.trim(),
        orderIndex: toBackendOrderIndex(chapterIndex),
        lessons: [...chapter.lessons]
          .sort((left, right) => left.orderIndex - right.orderIndex)
          .map((lesson, lessonIndex) => ({
            title: lesson.title.trim(),
            contentMarkdown: lesson.contentMarkdown,
            orderIndex: toBackendOrderIndex(lessonIndex),
            lessonResources: lesson.resources.map(resource => ({
              title: resource.title.trim(),
              url: resource.url.trim(),
            })),
          })),
      })),
  };
}
