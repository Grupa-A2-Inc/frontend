import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getApiErrorMessage } from "@/lib/api/errors";
import {
  useCreateCourseMutation,
  useGetCourseFullViewQuery,
  usePatchCourseMutation,
} from "@/store/api/coursesApi";
import {
  useCreateChapterMutation,
  useDeleteChapterMutation,
  useUpdateChapterMutation,
} from "@/store/api/chaptersApi";
import {
  useCreateLessonMutation,
  useDeleteLessonMutation,
  useUpdateLessonContentMutation,
  useUpdateLessonMetadataMutation,
} from "@/store/api/lessonsApi";
import { EMPTY_FORM, tempId } from "./helpers";
import type { CourseFullView } from "@/types/domain/courses";
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

export function useCourseEditor({ mode, courseId }: CourseEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedCourseIdRef = useRef<string | null>(null);
  const shouldLoadCourse = mode === "edit" && Boolean(courseId);
  const {
    data: editorCourse,
    isLoading: isCourseLoading,
    error: courseLoadError,
  } = useGetCourseFullViewQuery(courseId ?? "", { skip: !shouldLoadCourse });
  const [createCourseMutation] = useCreateCourseMutation();
  const [patchCourseMutation] = usePatchCourseMutation();
  const [createChapterMutation] = useCreateChapterMutation();
  const [updateChapterMutation] = useUpdateChapterMutation();
  const [deleteChapterMutation] = useDeleteChapterMutation();
  const [createLessonMutation] = useCreateLessonMutation();
  const [updateLessonMetadataMutation] = useUpdateLessonMetadataMutation();
  const [updateLessonContentMutation] = useUpdateLessonContentMutation();
  const [deleteLessonMutation] = useDeleteLessonMutation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
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
    if (!shouldLoadCourse) {
      setLoading(false);
      setLoadErr(null);
      return;
    }

    setLoading(isCourseLoading);
    setLoadErr(courseLoadError ? getApiErrorMessage(courseLoadError) : null);

    if (!editorCourse || loadedCourseIdRef.current === courseId) return;

    loadedCourseIdRef.current = courseId ?? null;
    setTitle(editorCourse.title);
    setDescription(editorCourse.description);
    setCategory(editorCourse.category);
    setExpiration("");
    setStatus(editorCourse.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT");
    setChapters(mapCourseToChapters(editorCourse));
  }, [courseId, courseLoadError, editorCourse, isCourseLoading, shouldLoadCourse]);

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
      setSaveNodeErr(getApiErrorMessage(error));
    } finally {
      setSavingNode(false);
    }
  }

  async function saveChapterNode(selection: Extract<SelectedRef, { kind: "chapter" }>) {
    if (!selection.id.startsWith("temp_") && mode === "edit") {
      await updateChapterMutation({
        chapterId: selection.id,
        courseId,
        data: { title: nodeForm.title },
      }).unwrap();
    }

    setChapters(prev => prev.map(chapter =>
      chapter.id === selection.id
        ? { ...chapter, title: nodeForm.title }
        : chapter,
    ));
  }

  async function saveLeafNode(selection: Extract<SelectedRef, { kind: "leaf" }>) {
    if (!selection.id.startsWith("temp_") && mode === "edit") {
      const isText = selectedLeaf?.type === "TEXT";
      await updateLessonMetadataMutation({
        lessonId: selection.id,
        courseId,
        data: { title: nodeForm.title },
      }).unwrap();

      if (isText) {
        await updateLessonContentMutation({
          lessonId: selection.id,
          courseId,
          content: nodeForm.content,
        }).unwrap();
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
      setAddNodeErr(getApiErrorMessage(error));
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
      const result = await createChapterMutation({
        courseId: courseId!,
        title: form.title.trim(),
      }).unwrap();
      addNodeToState(target, requireCreatedId(result.id, "chapter"), form, leafType);
    } else {
      const result = await createLessonMutation({
        chapterId: target.parentId!,
        courseId,
        data: {
          title: form.title.trim(),
          ...(leafType === "TEXT" && form.content ? { contentMarkdown: form.content } : {}),
        },
      }).unwrap();
      addNodeToState(target, requireCreatedId(result.id, "lesson"), form, leafType);
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
        if (mode === "edit" && !chapter.id.startsWith("temp_")) {
          await deleteChapterMutation({ chapterId: chapter.id, courseId }).unwrap();
        }
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
        if (mode === "edit" && !leaf.id.startsWith("temp_")) {
          await deleteLessonMutation({ lessonId: leaf.id, courseId }).unwrap();
        }
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
      setDeleteErr(getApiErrorMessage(error));
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
        category: category.trim(),
        status,
      };

      if (mode === "create") {
        const created = await createCourseMutation({ ...meta, chapters: [] }).unwrap();
        await createCourseTree(requireCreatedId(created.id, "course"), chapters);
        router.push(`/dashboard/teacher/courses/${created.id}`);
      } else {
        await patchCourseMutation({ courseId: courseId!, data: meta }).unwrap();
        setSaveOk(true);
        setTimeout(() => setSaveOk(false), 3000);
      }
    } catch (error) {
      setSaveErr(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function createCourseTree(createdCourseId: string, draftChapters: EditorChapter[]) {
    for (const chapter of [...draftChapters].sort((a, b) => a.orderIndex - b.orderIndex)) {
      const chapterResult = await createChapterMutation({
        courseId: createdCourseId,
        title: chapter.title,
      }).unwrap();
      const chapterId = requireCreatedId(chapterResult.id, "chapter");

      for (const leaf of [...chapter.children].sort((a, b) => a.orderIndex - b.orderIndex)) {
        await createLessonMutation({
          chapterId,
          courseId: createdCourseId,
          data: {
            title: leaf.title,
            ...(leaf.type === "TEXT" && leaf.content ? { contentMarkdown: leaf.content } : {}),
          },
        }).unwrap();
      }
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

function requireCreatedId(id: string | undefined, entityName: string) {
  if (!id) throw new Error(`Backend did not return a ${entityName} id.`);
  return id;
}

function inferLessonType(lesson: CourseFullView["chapters"][number]["lessons"][number]): Exclude<EditorNodeType, "CHAPTER"> {
  if (lesson.testId) return "TEST";
  const firstUrl = lesson.lessonResources?.[0]?.url ?? "";
  if (firstUrl) return /\.(mp4|webm|ogg|mov|avi)(\?|$)/i.test(firstUrl) ? "VIDEO" : "FILE";
  return "TEXT";
}

function mapCourseToChapters(data: CourseFullView): EditorChapter[] {
  return (data.chapters ?? []).map((chapter, chapterIndex) => ({
    id: chapter.id,
    title: chapter.title ?? "",
    description: "",
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
