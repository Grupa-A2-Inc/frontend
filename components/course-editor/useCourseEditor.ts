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
  createResource,
  updateResource,
  deleteResource,
} from "@/lib/courses/editorApi";
import { isVideoResourceUrl } from "@/lib/courses/resourceType";
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
  category?: string | null;
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
  lessonResources?: { id?: string | null; url?: string | null }[] | null;
  orderIndex?: number | null;
}

export function useCourseEditor({ mode, courseId }: CourseEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
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
        setCategory(data.category ?? "");
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

    if (!nodeForm.title.trim()) {
      setSaveNodeErr("Title is required.");
      setSaveNodeOk(false);
      return;
    }

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
    const title = nodeForm.title.trim();

    if (!selection.id.startsWith("temp_") && mode === "edit") {
      await updateChapter(selection.id, { title });
    }

    setChapters(prev => prev.map(chapter =>
      chapter.id === selection.id
        ? { ...chapter, title }
        : chapter,
    ));
  }

  async function saveLeafNode(selection: Extract<SelectedRef, { kind: "leaf" }>) {
    let newResourceId = selectedLeaf?.resourceId ?? "";
    const title = nodeForm.title.trim();

    if (!selection.id.startsWith("temp_") && mode === "edit") {
      const isText = selectedLeaf?.type === "TEXT";
      await updateLesson(selection.id, {
        title,
        content: isText ? nodeForm.content : undefined,
      });

      const isFileOrVideo = selectedLeaf?.type === "FILE" || selectedLeaf?.type === "VIDEO";
      if (isFileOrVideo) {
        const hasUrl = nodeForm.fileUrl.trim() !== "";
        const existingResourceId = selectedLeaf?.resourceId ?? "";

        if (hasUrl && existingResourceId) {
          await updateResource(selection.id, existingResourceId, {
            title,
            url: nodeForm.fileUrl.trim(),
          });
        } else if (hasUrl && !existingResourceId) {
          const result = await createResource(selection.id, {
            title,
            url: nodeForm.fileUrl.trim(),
          });
          newResourceId = result.id;
        } else if (!hasUrl && existingResourceId) {
          await deleteResource(selection.id, existingResourceId);
          newResourceId = "";
        }
      }
    }

    setChapters(prev => prev.map(chapter =>
      chapter.id === selection.chapterId
        ? {
          ...chapter,
          children: chapter.children.map(leaf =>
            leaf.id === selection.id
              ? {
                ...leaf,
                title,
                content: nodeForm.content,
                fileUrl: nodeForm.fileUrl,
                resourceId: newResourceId,
                pendingFile: null,
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
      resourceId: "",
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

    if (!category.trim()) {
      setSaveErr("Course category is required.");
      return;
    }

    setSaving(true);
    setSaveErr(null);
    setSaveOk(false);

    try {
      const meta = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
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
    category,
    setCategory,
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
  if (firstUrl) return isVideoResourceUrl(firstUrl) ? "VIDEO" : "FILE";
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
      resourceId: lesson.lessonResources?.[0]?.id ?? "",
      pendingFile: null,
      orderIndex: lesson.orderIndex ?? lessonIndex,
    })),
  }));
}

//fix bug
//nodurile capitolelor
async function createCourseTree(courseId: string, chapters: EditorChapter[]) {
  for (const chapter of [...chapters].sort((a, b) => a.orderIndex - b.orderIndex)) {
    const chapterResult = await createChapter(courseId, {
      title: chapter.title.trim(),
    });

    for (const leaf of [...chapter.children].sort((a, b) => a.orderIndex - b.orderIndex)) {
      const lessonResult = await createLesson(chapterResult.id, {
        title: leaf.title.trim(),
        ...(leaf.type === "TEXT" && leaf.content ? { contentMarkdown: leaf.content } : {}),
      });

      if ((leaf.type === "FILE" || leaf.type === "VIDEO") && leaf.fileUrl && leaf.fileUrl.trim() !== "") {
        await createResource(lessonResult.id, {
          title: leaf.title.trim(),
          url: leaf.fileUrl.trim(),
        });
      }
    }
  }
}