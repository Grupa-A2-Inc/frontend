import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCourse,
  updateCourse,
  fetchCourseForEditor,
  createChapter,
  updateChapter,
  deleteChapter,
  createLesson,
  updateLesson,
  deleteLesson,
} from "@/lib/courses/editorApi";
import { EMPTY_FORM, tempId } from "./helpers";
import type {
  AddTarget,
  CourseEditorProps,
  DeleteTarget,
  EditorChapter,
  EditorLeaf,
  EditorNodeType,
  MoveDirection,
  NodeForm,
  SelectedRef,
} from "./types";

interface EditorCourseResponse {
  title?: string | null;
  description?: string | null;
  expirationDate?: string | null;
  status?: "DRAFT" | "PUBLISHED" | null;
  chapters?: EditorChapterResponse[] | null;
}

interface EditorChapterResponse {
  id: string;
  title?: string | null;
  description?: string | null;
  orderIndex?: number | null;
  lessons?: EditorLessonResponse[] | null;
}

interface EditorLessonResponse {
  id: string;
  testId?: string | null;
  title?: string | null;
  contentMarkdown?: string | null;
  lessonResources?: { url?: string | null }[] | null;
  orderIndex?: number | null;
}

export function useCourseEditor({ mode, courseId }: CourseEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [expirationDate, setExpiration] = useState("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [chapters, setChapters] = useState<EditorChapter[]>([]);
  const [selected, setSelected] = useState<SelectedRef | null>(null);
  const [nodeForm, setNodeForm] = useState<NodeForm>(EMPTY_FORM);
  const [savingNode, setSavingNode] = useState(false);
  const [saveNodeError, setSaveNodeErr] = useState<string | null>(null);
  const [saveNodeOk, setSaveNodeOk] = useState(false);
  const [addTarget, setAddTarget] = useState<AddTarget | null>(null);
  const [addType, setAddType] = useState<EditorNodeType>("TEXT");
  const [addForm, setAddForm] = useState<NodeForm>(EMPTY_FORM);
  const [addingNode, setAddingNode] = useState(false);
  const [addNodeErr, setAddNodeErr] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteErr, setDeleteErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !courseId) return;

    setLoading(true);
    fetchCourseForEditor(courseId)
      .then((data: EditorCourseResponse) => {
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setExpiration(data.expirationDate ? data.expirationDate.slice(0, 10) : "");
        setStatus(data.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
        setChapters(mapCourseToChapters(data));
      })
      .catch((error: Error) => setLoadErr(error.message))
      .finally(() => setLoading(false));
  }, [mode, courseId]);

  useEffect(() => {
    setSaveNodeErr(null);
    setSaveNodeOk(false);

    if (!selected) {
      setNodeForm(EMPTY_FORM);
      return;
    }

    if (selected.kind === "chapter") {
      const chapter = chapters.find(item => item.id === selected.id);
      if (chapter) {
        setNodeForm({
          title: chapter.title,
          description: chapter.description,
          content: "",
          fileUrl: "",
          pendingFile: null,
        });
      }
      return;
    }

    const chapter = chapters.find(item => item.id === selected.chapterId);
    const leaf = chapter?.children.find(item => item.id === selected.id);

    if (leaf) {
      setNodeForm({
        title: leaf.title,
        description: "",
        content: leaf.content,
        fileUrl: leaf.fileUrl,
        pendingFile: leaf.pendingFile,
      });
    }
  }, [selected, chapters]);

  const selectedChapter = selected
    ? chapters.find(chapter => chapter.id === (selected.kind === "chapter" ? selected.id : selected.chapterId))
    : null;
  const selectedLeaf = selected?.kind === "leaf"
    ? selectedChapter?.children.find(leaf => leaf.id === selected.id) ?? null
    : null;
  const selectedType: EditorNodeType | null = selected
    ? selected.kind === "chapter" ? "CHAPTER" : selectedLeaf?.type ?? null
    : null;

  async function handleSaveNode() {
    if (!selected) return;

    setSavingNode(true);
    setSaveNodeErr(null);

    try {
      if (selected.kind === "chapter") {
        await saveChapterNode(selected);
      } else {
        await saveLeafNode(selected);
      }

      setSaveNodeOk(true);
      setTimeout(() => setSaveNodeOk(false), 2000);
    } catch (error) {
      setSaveNodeErr(error instanceof Error ? error.message : "Failed to save node");
    } finally {
      setSavingNode(false);
    }
  }

  async function saveChapterNode(selection: Extract<SelectedRef, { kind: "chapter" }>) {
    if (!selection.id.startsWith("temp_") && mode === "edit") {
      await updateChapter(selection.id, {
        title: nodeForm.title,
        description: nodeForm.description,
      });
    }

    setChapters(prev => prev.map(chapter =>
      chapter.id === selection.id
        ? { ...chapter, title: nodeForm.title, description: nodeForm.description }
        : chapter,
    ));
  }

  async function saveLeafNode(selection: Extract<SelectedRef, { kind: "leaf" }>) {
    if (!selection.id.startsWith("temp_") && mode === "edit") {
      await updateLesson(selection.id, {
        title: nodeForm.title,
        content: nodeForm.content,
      });
    }

    setChapters(prev => prev.map(chapter =>
      chapter.id === selection.chapterId
        ? {
          ...chapter,
          children: chapter.children.map(leaf =>
            leaf.id === selection.id
              ? {
                ...leaf,
                title: nodeForm.title,
                content: nodeForm.content,
                fileUrl: nodeForm.fileUrl,
                pendingFile: nodeForm.pendingFile,
              }
              : leaf,
          ),
        }
        : chapter,
    ));
  }

  function openAddChapter() {
    setAddType("CHAPTER");
    setAddForm(EMPTY_FORM);
    setAddNodeErr(null);
    setAddTarget({ kind: "chapter", parentId: null });
  }

  function openAddLeaf(chapterId: string) {
    setAddType("TEXT");
    setAddForm(EMPTY_FORM);
    setAddNodeErr(null);
    setAddTarget({ kind: "leaf", parentId: chapterId });
  }

  async function handleAddNode() {
    if (!addTarget) return;

    if (!addForm.title.trim()) {
      setAddNodeErr("Title is required.");
      return;
    }

    const leafType = addType as Exclude<EditorNodeType, "CHAPTER">;
    const form = addForm;
    const target = addTarget;

    setAddingNode(true);
    setAddNodeErr(null);

    try {
      if (mode === "edit" && courseId) {
        await addRemoteNode(target, form, leafType);
      } else {
        addLocalNode(target, form, leafType);
      }

      setAddTarget(null);
    } catch (error) {
      setAddNodeErr(error instanceof Error ? error.message : "Failed to add node");
    } finally {
      setAddingNode(false);
    }
  }

  async function addRemoteNode(
    target: AddTarget,
    form: NodeForm,
    leafType: Exclude<EditorNodeType, "CHAPTER">,
  ) {
    if (target.kind === "chapter") {
      const result = await createChapter(courseId!, {
        title: form.title.trim(),
        description: form.description || undefined,
      });
      addNodeToState(target, result.id, form, leafType);
    } else {
      const result = await createLesson(target.parentId!, {
        title: form.title.trim(),
        ...(leafType === "TEXT" && form.content ? { contentMarkdown: form.content } : {}),
      });
      addNodeToState(target, result.id, form, leafType);
    }
  }

  function addLocalNode(
    target: AddTarget,
    form: NodeForm,
    leafType: Exclude<EditorNodeType, "CHAPTER">,
  ) {
    addNodeToState(target, tempId(), form, leafType);
  }

  function addNodeToState(
    target: AddTarget,
    id: string,
    form: NodeForm,
    leafType: Exclude<EditorNodeType, "CHAPTER">,
  ) {
    if (target.kind === "chapter") {
      setChapters(prev => [
        ...prev,
        {
          id,
          title: form.title.trim(),
          description: form.description,
          orderIndex: prev.length,
          children: [],
        },
      ]);
      return;
    }

    const newLeaf: EditorLeaf = {
      id,
      type: leafType,
      title: form.title.trim(),
      content: form.content,
      fileUrl: "",
      pendingFile: null,
      orderIndex: 0,
    };

    setChapters(prev => prev.map(chapter =>
      chapter.id === target.parentId
        ? { ...chapter, children: [...chapter.children, { ...newLeaf, orderIndex: chapter.children.length }] }
        : chapter,
    ));

    setSelected({ kind: "leaf", chapterId: target.parentId!, id });
  }

  function promptDeleteChapter(chapter: EditorChapter) {
    setDeleteErr(null);
    setDeleteTarget({
      label: `chapter "${chapter.title || "Untitled"}"`,
      onConfirm: async () => {
        if (mode === "edit" && !chapter.id.startsWith("temp_")) await deleteChapter(chapter.id);
        setChapters(prev => prev.filter(item => item.id !== chapter.id));
        if (selected?.kind === "chapter" && selected.id === chapter.id) setSelected(null);
        if (selected?.kind === "leaf" && selected.chapterId === chapter.id) setSelected(null);
      },
    });
  }

  function promptDeleteLeaf(chapterId: string, leaf: EditorLeaf) {
    setDeleteErr(null);
    setDeleteTarget({
      label: `"${leaf.title || "Untitled"}"`,
      onConfirm: async () => {
        if (mode === "edit" && !leaf.id.startsWith("temp_")) await deleteLesson(leaf.id);
        setChapters(prev => prev.map(chapter =>
          chapter.id === chapterId
            ? { ...chapter, children: chapter.children.filter(item => item.id !== leaf.id) }
            : chapter,
        ));
        if (selected?.kind === "leaf" && selected.id === leaf.id) setSelected(null);
      },
    });
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;

    setDeleting(true);
    setDeleteErr(null);

    try {
      await deleteTarget.onConfirm();
      setDeleteTarget(null);
    } catch (error) {
      setDeleteErr(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  async function moveChapter(id: string, direction: MoveDirection) {
    const index = chapters.findIndex(chapter => chapter.id === id);
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === chapters.length - 1) return;

    const next = [...chapters];
    const swapIndex = direction === "UP" ? index - 1 : index + 1;
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    setChapters(next.map((chapter, orderIndex) => ({ ...chapter, orderIndex })));
  }

  async function moveLeaf(chapterId: string, leafId: string, direction: MoveDirection) {
    const chapter = chapters.find(item => item.id === chapterId);
    if (!chapter) return;

    const index = chapter.children.findIndex(leaf => leaf.id === leafId);
    if (direction === "UP" && index === 0) return;
    if (direction === "DOWN" && index === chapter.children.length - 1) return;

    const nextChildren = [...chapter.children];
    const swapIndex = direction === "UP" ? index - 1 : index + 1;
    [nextChildren[index], nextChildren[swapIndex]] = [nextChildren[swapIndex], nextChildren[index]];

    setChapters(prev => prev.map(item =>
      item.id === chapterId
        ? { ...item, children: nextChildren.map((leaf, orderIndex) => ({ ...leaf, orderIndex })) }
        : item,
    ));
  }

  async function handleSaveCourse() {
    if (!title.trim()) {
      setSaveErr("Course title is required.");
      return;
    }

    setSaving(true);
    setSaveErr(null);
    setSaveOk(false);

    try {
      const meta = {
        title: title.trim(),
        description: description.trim(),
        expirationDate: expirationDate || undefined,
        status,
      };

      if (mode === "create") {
        const created = await createCourse(meta);
        await createCourseTree(created.id, chapters);
        router.push(`/dashboard/teacher/courses/${created.id}`);
      } else {
        await updateCourse(courseId!, meta);
        setSaveOk(true);
        setTimeout(() => setSaveOk(false), 3000);
      }
    } catch (error) {
      setSaveErr(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
    setDeleteErr(null);
  }

  return {
    title,
    setTitle,
    description,
    setDescription,
    expirationDate,
    setExpiration,
    status,
    setStatus,
    chapters,
    selected,
    setSelected,
    nodeForm,
    setNodeForm,
    savingNode,
    saveNodeError,
    saveNodeOk,
    addTarget,
    addType,
    setAddType,
    addForm,
    setAddForm,
    addingNode,
    addNodeErr,
    deleteTarget,
    deleting,
    deleteErr,
    loading,
    loadErr,
    saving,
    saveErr,
    saveOk,
    selectedLeaf,
    selectedType,
    fileInputRef,
    openAddChapter,
    openAddLeaf,
    handleAddNode,
    promptDeleteChapter,
    promptDeleteLeaf,
    handleDeleteConfirm,
    closeAddModal: () => setAddTarget(null),
    closeDeleteModal,
    moveChapter,
    moveLeaf,
    handleSaveCourse,
    handleSaveNode,
  };
}

function inferLessonType(lesson: EditorLessonResponse): Exclude<EditorNodeType, "CHAPTER"> {
  if (lesson.testId) return "TEST";
  const firstUrl = lesson.lessonResources?.[0]?.url ?? "";
  if (firstUrl) return /\.(mp4|webm|ogg|mov|avi)(\?|$)/i.test(firstUrl) ? "VIDEO" : "FILE";
  return "TEXT";
}

function mapCourseToChapters(data: EditorCourseResponse): EditorChapter[] {
  return (data.chapters ?? []).map((chapter, chapterIndex) => ({
    id: chapter.id,
    title: chapter.title ?? "",
    description: chapter.description ?? "",
    orderIndex: chapter.orderIndex ?? chapterIndex,
    children: (chapter.lessons ?? []).map((lesson, lessonIndex): EditorLeaf => ({
      id: lesson.id,
      type: inferLessonType(lesson),
      title: lesson.title ?? "",
      content: lesson.contentMarkdown ?? "",
      fileUrl: lesson.lessonResources?.[0]?.url ?? "",
      pendingFile: null,
      orderIndex: lesson.orderIndex ?? lessonIndex,
    })),
  }));
}

async function createCourseTree(courseId: string, chapters: EditorChapter[]) {
  for (const chapter of [...chapters].sort((a, b) => a.orderIndex - b.orderIndex)) {
    const chapterResult = await createChapter(courseId, {
      title: chapter.title,
      description: chapter.description || undefined,
    });

    for (const leaf of [...chapter.children].sort((a, b) => a.orderIndex - b.orderIndex)) {
      await createLesson(chapterResult.id, {
        title: leaf.title,
        ...(leaf.type === "TEXT" && leaf.content ? { contentMarkdown: leaf.content } : {}),
      });
    }
  }
}
