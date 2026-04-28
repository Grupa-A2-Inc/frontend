"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createCourse,
  updateCourse,
  fetchCourseForEditor,
  createCourseNode,
  updateCourseNode,
  deleteCourseNode,
  moveCourseNode,
} from "@/lib/courses/editorApi";

// ── Types ──────────────────────────────────────────────────────────

export type EditorNodeType = "CHAPTER" | "TEXT" | "FILE" | "VIDEO" | "TEST";

export interface EditorLeaf {
  id: string;
  type: Exclude<EditorNodeType, "CHAPTER">;
  title: string;
  content: string;
  fileUrl: string;
  pendingFile: File | null;
  orderIndex: number;
}

export interface EditorChapter {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  children: EditorLeaf[];
}

type SelectedRef =
  | { kind: "chapter"; id: string }
  | { kind: "leaf"; chapterId: string; id: string };

interface NodeForm {
  title: string;
  description: string;
  content: string;
  fileUrl: string;
  pendingFile: File | null;
}

// ── Helpers ────────────────────────────────────────────────────────

let _counter = 0;
function tempId() {
  return `temp_${++_counter}`;
}

function nodeIcon(type: EditorNodeType): string {
  switch (type) {
    case "CHAPTER": return "folder";
    case "TEXT":    return "article";
    case "FILE":    return "attach_file";
    case "VIDEO":   return "videocam";
    case "TEST":    return "quiz";
  }
}

function nodeLabel(type: EditorNodeType): string {
  switch (type) {
    case "CHAPTER": return "Chapter";
    case "TEXT":    return "Text";
    case "FILE":    return "File";
    case "VIDEO":   return "Video";
    case "TEST":    return "Test";
  }
}

// ── Linkify ────────────────────────────────────────────────────────

function LinkifyText({ text }: { text: string }) {
  const URL_RE = /https?:\/\/[^\s]+/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  URL_RE.lastIndex = 0;
  while ((match = URL_RE.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const url = match[0];
    nodes.push(
      <a key={match.index} href={url} target="_blank" rel="noopener noreferrer"
        className="text-brand-primary underline break-all">
        {url}
      </a>
    );
    last = match.index + url.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

// ── CourseEditor ───────────────────────────────────────────────────

interface CourseEditorProps {
  mode: "create" | "edit";
  courseId?: string;
}

const EMPTY_FORM: NodeForm = { title: "", description: "", content: "", fileUrl: "", pendingFile: null };

export default function CourseEditor({ mode, courseId }: CourseEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metadata
  const [title, setTitle]               = useState("");
  const [description, setDescription]   = useState("");
  const [expirationDate, setExpiration] = useState("");

  // Tree
  const [chapters, setChapters] = useState<EditorChapter[]>([]);

  // Selection + node form
  const [selected, setSelected]         = useState<SelectedRef | null>(null);
  const [nodeForm, setNodeForm]         = useState<NodeForm>(EMPTY_FORM);
  const [savingNode, setSavingNode]     = useState(false);
  const [saveNodeError, setSaveNodeErr] = useState<string | null>(null);
  const [saveNodeOk, setSaveNodeOk]     = useState(false);

  // Add-node flow
  const [addTarget, setAddTarget]     = useState<{ kind: "chapter" | "leaf"; parentId: string | null } | null>(null);
  const [addType, setAddType]         = useState<EditorNodeType>("TEXT");
  const [addForm, setAddForm]         = useState<NodeForm>(EMPTY_FORM);
  const [addingNode, setAddingNode]   = useState(false);
  const [addNodeErr, setAddNodeErr]   = useState<string | null>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ label: string; onConfirm: () => Promise<void> } | null>(null);
  const [deleting, setDeleting]         = useState(false);
  const [deleteErr, setDeleteErr]       = useState<string | null>(null);

  // Load (edit mode)
  const [loading, setLoading]   = useState(false);
  const [loadErr, setLoadErr]   = useState<string | null>(null);

  // Course save
  const [saving, setSaving]     = useState(false);
  const [saveErr, setSaveErr]   = useState<string | null>(null);
  const [saveOk, setSaveOk]     = useState(false);

  // ── Load course (edit mode) ──────────────────────────────────────
  useEffect(() => {
    if (mode !== "edit" || !courseId) return;
    setLoading(true);
    fetchCourseForEditor(courseId)
      .then((data: any) => {
        setTitle(data.title ?? "");
        setDescription(data.description ?? "");
        setExpiration(data.expirationDate ? data.expirationDate.slice(0, 10) : "");
        const mapped: EditorChapter[] = (data.chapters ?? []).map((ch: any, ci: number) => ({
          id: ch.id,
          title: ch.title ?? "",
          description: ch.description ?? "",
          orderIndex: ch.orderIndex ?? ci,
          children: (ch.lessons ?? []).map((ls: any, li: number): EditorLeaf => ({
            id: ls.id,
            type: (ls.resourceType ?? "TEXT") as Exclude<EditorNodeType, "CHAPTER">,
            title: ls.title ?? "",
            content: ls.contentMarkdown ?? "",
            fileUrl: ls.lessonResources?.[0]?.url ?? "",
            pendingFile: null,
            orderIndex: ls.orderIndex ?? li,
          })),
        }));
        setChapters(mapped);
      })
      .catch((e: Error) => setLoadErr(e.message))
      .finally(() => setLoading(false));
  }, [mode, courseId]);

  // ── Sync node form when selection changes ────────────────────────
  useEffect(() => {
    setSaveNodeErr(null);
    setSaveNodeOk(false);
    if (!selected) { setNodeForm(EMPTY_FORM); return; }
    if (selected.kind === "chapter") {
      const ch = chapters.find(c => c.id === selected.id);
      if (ch) setNodeForm({ title: ch.title, description: ch.description, content: "", fileUrl: "", pendingFile: null });
    } else {
      const ch = chapters.find(c => c.id === selected.chapterId);
      const leaf = ch?.children.find(n => n.id === selected.id);
      if (leaf) setNodeForm({ title: leaf.title, description: "", content: leaf.content, fileUrl: leaf.fileUrl, pendingFile: leaf.pendingFile });
    }
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived ──────────────────────────────────────────────────────
  const selectedChapter = selected
    ? chapters.find(c => c.id === (selected.kind === "chapter" ? selected.id : selected.chapterId))
    : null;
  const selectedLeaf = selected?.kind === "leaf"
    ? selectedChapter?.children.find(n => n.id === selected.id) ?? null
    : null;
  const selectedType: EditorNodeType | null = selected
    ? (selected.kind === "chapter" ? "CHAPTER" : (selectedLeaf?.type ?? null))
    : null;

  // ── Save node ────────────────────────────────────────────────────
  async function handleSaveNode() {
    if (!selected) return;
    setSavingNode(true);
    setSaveNodeErr(null);
    const isTemp = selected.id.startsWith("temp_");
    try {
      if (selected.kind === "chapter") {
        if (!isTemp && mode === "edit") {
          await updateCourseNode(selected.id, { title: nodeForm.title, description: nodeForm.description });
        }
        setChapters(prev => prev.map(c =>
          c.id === selected.id ? { ...c, title: nodeForm.title, description: nodeForm.description } : c
        ));
      } else {
        if (!isTemp && mode === "edit") {
          await updateCourseNode(selected.id, { title: nodeForm.title, content: nodeForm.content });
        }
        setChapters(prev => prev.map(c =>
          c.id === selected.chapterId
            ? { ...c, children: c.children.map(n => n.id === selected.id
                ? { ...n, title: nodeForm.title, content: nodeForm.content, fileUrl: nodeForm.fileUrl, pendingFile: nodeForm.pendingFile }
                : n) }
            : c
        ));
      }
      setSaveNodeOk(true);
      setTimeout(() => setSaveNodeOk(false), 2000);
    } catch (e) {
      setSaveNodeErr(e instanceof Error ? e.message : "Failed to save node");
    } finally {
      setSavingNode(false);
    }
  }

  // ── Add node ─────────────────────────────────────────────────────
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
    if (!addForm.title.trim()) { setAddNodeErr("Title is required."); return; }
    setAddingNode(true);
    setAddNodeErr(null);
    try {
      const isChapter = addTarget.kind === "chapter";
      if (mode === "edit" && courseId) {
        const payload = {
          title: addForm.title.trim(),
          nodeType: isChapter ? "CHAPTER" : "LESSON",
          ...(isChapter ? { description: addForm.description || undefined } : {
            resourceType: addType,
            parentNodeId: addTarget.parentId ?? undefined,
            ...(addType === "TEXT" ? { content: addForm.content } : {}),
          }),
        };
        const result = await createCourseNode(courseId, payload);
        const newId = result.id;
        if (isChapter) {
          setChapters(prev => [...prev, {
            id: newId, title: addForm.title.trim(), description: addForm.description,
            orderIndex: prev.length, children: [],
          }]);
        } else {
          const newLeaf: EditorLeaf = {
            id: newId, type: addType as Exclude<EditorNodeType, "CHAPTER">,
            title: addForm.title.trim(), content: addForm.content,
            fileUrl: "", pendingFile: null, orderIndex: 0,
          };
          setChapters(prev => prev.map(c => c.id === addTarget.parentId
            ? { ...c, children: [...c.children, { ...newLeaf, orderIndex: c.children.length }] } : c));
          setSelected({ kind: "leaf", chapterId: addTarget.parentId!, id: newId });
        }
      } else {
        // create mode — local only
        if (isChapter) {
          setChapters(prev => [...prev, {
            id: tempId(), title: addForm.title.trim(), description: addForm.description,
            orderIndex: prev.length, children: [],
          }]);
        } else {
          const tid = tempId();
          const newLeaf: EditorLeaf = {
            id: tid, type: addType as Exclude<EditorNodeType, "CHAPTER">,
            title: addForm.title.trim(), content: addForm.content,
            fileUrl: "", pendingFile: null, orderIndex: 0,
          };
          setChapters(prev => prev.map(c => c.id === addTarget.parentId
            ? { ...c, children: [...c.children, { ...newLeaf, orderIndex: c.children.length }] } : c));
          setSelected({ kind: "leaf", chapterId: addTarget.parentId!, id: tid });
        }
      }
      setAddTarget(null);
    } catch (e) {
      setAddNodeErr(e instanceof Error ? e.message : "Failed to add node");
    } finally {
      setAddingNode(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────
  function promptDeleteChapter(ch: EditorChapter) {
    setDeleteErr(null);
    setDeleteTarget({
      label: `chapter "${ch.title || "Untitled"}"`,
      onConfirm: async () => {
        if (mode === "edit" && !ch.id.startsWith("temp_")) await deleteCourseNode(ch.id);
        setChapters(prev => prev.filter(c => c.id !== ch.id));
        if (selected?.kind === "chapter" && selected.id === ch.id) setSelected(null);
        if (selected?.kind === "leaf" && selected.chapterId === ch.id) setSelected(null);
      },
    });
  }

  function promptDeleteLeaf(chapterId: string, leaf: EditorLeaf) {
    setDeleteErr(null);
    setDeleteTarget({
      label: `"${leaf.title || "Untitled"}"`,
      onConfirm: async () => {
        if (mode === "edit" && !leaf.id.startsWith("temp_")) await deleteCourseNode(leaf.id);
        setChapters(prev => prev.map(c =>
          c.id === chapterId ? { ...c, children: c.children.filter(n => n.id !== leaf.id) } : c));
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
    } catch (e) {
      setDeleteErr(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  // ── Move ─────────────────────────────────────────────────────────
  async function moveChapter(id: string, dir: "UP" | "DOWN") {
    const idx = chapters.findIndex(c => c.id === id);
    if (dir === "UP" && idx === 0) return;
    if (dir === "DOWN" && idx === chapters.length - 1) return;
    if (mode === "edit" && !id.startsWith("temp_")) {
      try { await moveCourseNode(id, dir); } catch {}
    }
    const next = [...chapters];
    const swap = dir === "UP" ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    next.forEach((c, i) => { c.orderIndex = i; });
    setChapters(next);
  }

  async function moveLeaf(chapterId: string, leafId: string, dir: "UP" | "DOWN") {
    const ch = chapters.find(c => c.id === chapterId);
    if (!ch) return;
    const idx = ch.children.findIndex(n => n.id === leafId);
    if (dir === "UP" && idx === 0) return;
    if (dir === "DOWN" && idx === ch.children.length - 1) return;
    if (mode === "edit" && !leafId.startsWith("temp_")) {
      try { await moveCourseNode(leafId, dir); } catch {}
    }
    const next = [...ch.children];
    const swap = dir === "UP" ? idx - 1 : idx + 1;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    next.forEach((n, i) => { n.orderIndex = i; });
    setChapters(prev => prev.map(c => c.id === chapterId ? { ...c, children: next } : c));
  }

  // ── Save course ──────────────────────────────────────────────────
  async function handleSaveCourse() {
    if (!title.trim()) { setSaveErr("Course title is required."); return; }
    setSaving(true);
    setSaveErr(null);
    setSaveOk(false);
    try {
      const meta = {
        title: title.trim(),
        description: description.trim(),
        expirationDate: expirationDate || undefined,
        status: "DRAFT" as const,
      };
      if (mode === "create") {
        const created = await createCourse(meta);
        const newId = created.id;
        for (const ch of [...chapters].sort((a, b) => a.orderIndex - b.orderIndex)) {
          const chRes = await createCourseNode(newId, {
            nodeType: "CHAPTER",
            title: ch.title,
            description: ch.description || undefined,
          });
          for (const leaf of [...ch.children].sort((a, b) => a.orderIndex - b.orderIndex)) {
            await createCourseNode(newId, {
              nodeType: "LESSON",
              resourceType: leaf.type,
              parentNodeId: chRes.id,
              title: leaf.title,
              content: leaf.type === "TEXT" ? leaf.content || undefined : undefined,
            });
          }
        }
        router.push(`/dashboard/teacher/courses/${newId}`);
      } else {
        await updateCourse(courseId!, meta);
        setSaveOk(true);
        setTimeout(() => setSaveOk(false), 3000);
      }
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  // ── Render guards ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-brand-text/40 text-sm">Loading course…</p>
      </div>
    );
  }
  if (loadErr) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-red-400 text-sm">{loadErr}</p>
        <Link href="/dashboard/teacher" className="text-brand-primary text-sm hover:underline">
          ← My Courses
        </Link>
      </div>
    );
  }

  // ── JSX ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col" style={{ minHeight: "calc(100vh - 2rem)" }}>

      {/* ── Top bar ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-brand-primary/10 bg-brand-card flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={mode === "edit" && courseId ? `/dashboard/teacher/courses/${courseId}` : "/dashboard/teacher"}
            className="flex items-center gap-1 text-sm text-brand-muted hover:text-brand-text transition-colors flex-shrink-0"
          >
            <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>arrow_back</span>
            {mode === "edit" ? "Course" : "My Courses"}
          </Link>
          <span className="text-brand-primary/30 flex-shrink-0">/</span>
          <span className="text-sm font-semibold text-brand-text truncate">
            {mode === "create" ? "New Course" : (title || "Edit Course")}
          </span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {saveOk && (
            <span className="text-emerald-400 text-sm flex items-center gap-1">
              <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>check_circle</span>
              Saved
            </span>
          )}
          {saveErr && <span className="text-red-400 text-xs max-w-[200px] truncate">{saveErr}</span>}
          <button
            onClick={handleSaveCourse}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>
              {saving ? "hourglass_empty" : "save"}
            </span>
            {mode === "create" ? (saving ? "Creating…" : "Create Course") : (saving ? "Saving…" : "Save Course")}
          </button>
        </div>
      </header>

      {/* ── Two-panel body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: metadata + tree */}
        <div className="w-[360px] flex-shrink-0 flex flex-col border-r border-brand-primary/10 overflow-y-auto">

          {/* Metadata */}
          <section className="p-5 border-b border-brand-primary/10">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted mb-4">Course Details</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Introduction to Mathematics"
                  className="w-full bg-brand-card border border-brand-primary/20 rounded-xl px-3 py-2 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-text/60 mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Brief description of the course…"
                  rows={3}
                  className="w-full bg-brand-card border border-brand-primary/20 rounded-xl px-3 py-2 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
                  Expiration Date
                  <span className="text-brand-muted/50 font-normal ml-1">(auto-archives on this date)</span>
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={e => setExpiration(e.target.value)}
                  className="w-full bg-brand-card border border-brand-primary/20 rounded-xl px-3 py-2 text-sm text-brand-text focus:outline-none focus:border-brand-primary/60 transition-colors"
                />
              </div>
            </div>
          </section>

          {/* Content tree */}
          <section className="flex-1 p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-muted">Content</p>
              <button
                onClick={openAddChapter}
                className="flex items-center gap-1 text-xs font-medium text-brand-primary hover:text-brand-primary/70 transition-colors"
              >
                <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>add</span>
                Add Chapter
              </button>
            </div>

            {chapters.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
                <span className="material-symbols-rounded text-brand-text/10" style={{ fontSize: "2.5rem" }}>folder_open</span>
                <p className="text-brand-text/30 text-xs">No chapters yet.<br />Add your first one above.</p>
              </div>
            )}

            <div className="flex flex-col gap-2">
              {chapters.map((ch, ci) => {
                const chSelected = selected?.kind === "chapter" && selected.id === ch.id;
                return (
                  <div key={ch.id} className="rounded-xl border border-brand-primary/15 overflow-hidden">
                    {/* Chapter row */}
                    <div
                      onClick={() => setSelected({ kind: "chapter", id: ch.id })}
                      className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${
                        chSelected ? "bg-brand-primary/15" : "bg-brand-card hover:bg-brand-primary/8"
                      }`}
                    >
                      <span className="material-symbols-rounded text-brand-primary flex-shrink-0" style={{ fontSize: "1rem" }}>folder</span>
                      <span className="flex-1 text-sm font-medium text-brand-text truncate min-w-0">
                        {ch.title || "Untitled Chapter"}
                      </span>
                      <div className="flex items-center gap-0.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                        <button onClick={() => moveChapter(ch.id, "UP")} disabled={ci === 0}
                          className="w-6 h-6 flex items-center justify-center text-brand-text/30 hover:text-brand-text disabled:opacity-20 transition-colors rounded">
                          <span className="material-symbols-rounded" style={{ fontSize: "0.9rem" }}>expand_less</span>
                        </button>
                        <button onClick={() => moveChapter(ch.id, "DOWN")} disabled={ci === chapters.length - 1}
                          className="w-6 h-6 flex items-center justify-center text-brand-text/30 hover:text-brand-text disabled:opacity-20 transition-colors rounded">
                          <span className="material-symbols-rounded" style={{ fontSize: "0.9rem" }}>expand_more</span>
                        </button>
                        <button onClick={() => promptDeleteChapter(ch)}
                          className="w-6 h-6 flex items-center justify-center text-brand-text/20 hover:text-red-400 transition-colors rounded">
                          <span className="material-symbols-rounded" style={{ fontSize: "0.9rem" }}>delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Leaf rows */}
                    <div className="border-t border-brand-primary/8">
                      {ch.children.map((leaf, li) => {
                        const leafSelected = selected?.kind === "leaf" && selected.id === leaf.id;
                        return (
                          <div
                            key={leaf.id}
                            onClick={() => setSelected({ kind: "leaf", chapterId: ch.id, id: leaf.id })}
                            className={`flex items-center gap-2 px-3 py-2 pl-6 cursor-pointer transition-colors ${
                              leafSelected ? "bg-brand-primary/10" : "hover:bg-brand-primary/5"
                            }`}
                          >
                            <span className="material-symbols-rounded text-brand-primary/60 flex-shrink-0" style={{ fontSize: "0.9rem" }}>
                              {nodeIcon(leaf.type)}
                            </span>
                            <span className="flex-1 text-xs text-brand-text truncate min-w-0">
                              {leaf.title || "Untitled"}
                            </span>
                            <div className="flex items-center gap-0.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
                              <button onClick={() => moveLeaf(ch.id, leaf.id, "UP")} disabled={li === 0}
                                className="w-5 h-5 flex items-center justify-center text-brand-text/30 hover:text-brand-text disabled:opacity-20 transition-colors rounded">
                                <span className="material-symbols-rounded" style={{ fontSize: "0.8rem" }}>expand_less</span>
                              </button>
                              <button onClick={() => moveLeaf(ch.id, leaf.id, "DOWN")} disabled={li === ch.children.length - 1}
                                className="w-5 h-5 flex items-center justify-center text-brand-text/30 hover:text-brand-text disabled:opacity-20 transition-colors rounded">
                                <span className="material-symbols-rounded" style={{ fontSize: "0.8rem" }}>expand_more</span>
                              </button>
                              <button onClick={() => promptDeleteLeaf(ch.id, leaf)}
                                className="w-5 h-5 flex items-center justify-center text-brand-text/20 hover:text-red-400 transition-colors rounded">
                                <span className="material-symbols-rounded" style={{ fontSize: "0.8rem" }}>delete</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {/* Add node button */}
                      <button
                        onClick={() => openAddLeaf(ch.id)}
                        className="flex items-center gap-1.5 px-3 py-2 pl-6 w-full text-xs text-brand-primary/50 hover:text-brand-primary transition-colors"
                      >
                        <span className="material-symbols-rounded" style={{ fontSize: "0.9rem" }}>add</span>
                        Add node
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* RIGHT: node editor */}
        <div className="flex-1 overflow-y-auto p-8 bg-brand-bg">
          {!selected ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
              <span className="material-symbols-rounded text-brand-text/8" style={{ fontSize: "4rem" }}>edit_note</span>
              <p className="text-brand-text/25 text-sm">Select a node from the tree to edit it</p>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {/* Type badge */}
              <div className="flex items-center gap-2 mb-6">
                <span className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 rounded-lg text-xs font-semibold text-brand-primary uppercase tracking-wide">
                  <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>
                    {selectedType ? nodeIcon(selectedType) : ""}
                  </span>
                  {selectedType ? nodeLabel(selectedType) : ""}
                </span>
              </div>

              {/* Title (all types) */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={nodeForm.title}
                  onChange={e => setNodeForm(f => ({ ...f, title: e.target.value }))}
                  placeholder={selectedType === "CHAPTER" ? "Chapter title" : "Node title"}
                  className="w-full bg-brand-card border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
                />
              </div>

              {/* CHAPTER: description */}
              {selectedType === "CHAPTER" && (
                <div className="mb-5">
                  <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
                    Description <span className="text-brand-muted/50 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={nodeForm.description}
                    onChange={e => setNodeForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Optional chapter description…"
                    rows={3}
                    className="w-full bg-brand-card border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors resize-none"
                  />
                </div>
              )}

              {/* TEXT: content + hyperlink preview */}
              {selectedType === "TEXT" && (
                <div className="mb-5">
                  <label className="block text-xs font-medium text-brand-text/60 mb-1.5">Content</label>
                  <textarea
                    value={nodeForm.content}
                    onChange={e => setNodeForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="Write your content here. URLs will be automatically recognized as hyperlinks."
                    rows={12}
                    className="w-full bg-brand-card border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors resize-y font-mono leading-relaxed"
                  />
                  {nodeForm.content.trim() && (
                    <div className="mt-3 rounded-xl border border-brand-primary/10 overflow-hidden">
                      <div className="flex items-center gap-1.5 px-4 py-2 bg-brand-card border-b border-brand-primary/10">
                        <span className="material-symbols-rounded text-brand-muted" style={{ fontSize: "0.85rem" }}>preview</span>
                        <span className="text-xs text-brand-muted">Preview</span>
                      </div>
                      <div className="px-4 py-3 text-sm text-brand-text leading-relaxed whitespace-pre-wrap break-words">
                        <LinkifyText text={nodeForm.content} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FILE / VIDEO: upload */}
              {(selectedType === "FILE" || selectedType === "VIDEO") && (
                <div className="mb-5">
                  <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
                    {selectedType === "VIDEO" ? "Video Upload" : "File Upload"}
                  </label>
                  <div
                    className="border-2 border-dashed border-brand-primary/20 rounded-xl p-8 text-center cursor-pointer hover:border-brand-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={selectedType === "VIDEO" ? "video/*" : "*/*"}
                      className="hidden"
                      onChange={e => {
                        const f = e.target.files?.[0] ?? null;
                        setNodeForm(prev => ({ ...prev, pendingFile: f }));
                      }}
                    />
                    {nodeForm.pendingFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-rounded text-brand-primary" style={{ fontSize: "2rem" }}>
                          {selectedType === "VIDEO" ? "videocam" : "attach_file"}
                        </span>
                        <p className="text-sm font-medium text-brand-text">{nodeForm.pendingFile.name}</p>
                        <p className="text-xs text-brand-muted">{(nodeForm.pendingFile.size / 1024).toFixed(0)} KB — click to replace</p>
                      </div>
                    ) : nodeForm.fileUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-rounded text-brand-primary" style={{ fontSize: "2rem" }}>
                          {selectedType === "VIDEO" ? "videocam" : "attach_file"}
                        </span>
                        <p className="text-xs text-brand-muted">
                          Current: <span className="text-brand-text">{nodeForm.fileUrl.split("/").pop()}</span>
                        </p>
                        <p className="text-xs text-brand-muted/60">Click to replace</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-rounded text-brand-text/20" style={{ fontSize: "2.5rem" }}>
                          {selectedType === "VIDEO" ? "video_file" : "upload_file"}
                        </span>
                        <p className="text-sm text-brand-text/40">
                          Click to upload {selectedType === "VIDEO" ? "a video" : "a file"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TEST: open test editor */}
              {selectedType === "TEST" && (
                <div className="mb-5 p-5 bg-brand-card border border-brand-primary/15 rounded-xl">
                  <p className="text-sm text-brand-text/60 mb-4">
                    Tests have their own dedicated editor. Save this node first, then open the test editor to configure questions and settings.
                  </p>
                  {selectedLeaf && !selectedLeaf.id.startsWith("temp_") && courseId && (
                    <Link
                      href={`/dashboard/teacher/courses/${courseId}/tests`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary text-sm font-medium rounded-xl hover:bg-brand-primary/20 transition-colors"
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>quiz</span>
                      Open Test Editor
                    </Link>
                  )}
                  {selectedLeaf?.id.startsWith("temp_") && (
                    <p className="text-xs text-brand-muted/60">Save the node first to unlock the test editor.</p>
                  )}
                </div>
              )}

              {/* Save node */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveNode}
                  disabled={savingNode}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>
                    {savingNode ? "hourglass_empty" : "check"}
                  </span>
                  {savingNode ? "Saving…" : "Save Node"}
                </button>
                {saveNodeOk && (
                  <span className="text-emerald-400 text-sm flex items-center gap-1">
                    <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>check_circle</span>
                    Saved
                  </span>
                )}
                {saveNodeError && <span className="text-red-400 text-sm">{saveNodeError}</span>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Add node modal ── */}
      {addTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-primary/20 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-brand-text font-semibold">
                {addTarget.kind === "chapter" ? "Add Chapter" : "Add Node"}
              </h2>
              <button onClick={() => setAddTarget(null)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-brand-text/40 hover:text-brand-text hover:bg-brand-text/10 transition-colors">
                <span className="material-symbols-rounded" style={{ fontSize: "1.2rem" }}>close</span>
              </button>
            </div>

            {addTarget.kind === "leaf" && (
              <div className="mb-5">
                <label className="block text-xs font-medium text-brand-text/60 mb-2">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["TEXT", "FILE", "VIDEO", "TEST"] as const).map(t => (
                    <button key={t} onClick={() => setAddType(t)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-colors ${
                        addType === t
                          ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                          : "border-brand-primary/15 text-brand-text/50 hover:border-brand-primary/40 hover:text-brand-text"
                      }`}>
                      <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>{nodeIcon(t)}</span>
                      {nodeLabel(t)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={addForm.title}
                  onChange={e => setAddForm(f => ({ ...f, title: e.target.value }))}
                  placeholder={addTarget.kind === "chapter" ? "Chapter title" : "Node title"}
                  autoFocus
                  onKeyDown={e => { if (e.key === "Enter") handleAddNode(); }}
                  className="w-full bg-brand-bg border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors"
                />
              </div>

              {addTarget.kind === "chapter" && (
                <div>
                  <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
                    Description <span className="text-brand-muted/50 font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={addForm.description}
                    onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    placeholder="Optional description…"
                    className="w-full bg-brand-bg border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors resize-none"
                  />
                </div>
              )}

              {addTarget.kind === "leaf" && addType === "TEXT" && (
                <div>
                  <label className="block text-xs font-medium text-brand-text/60 mb-1.5">
                    Content <span className="text-brand-muted/50 font-normal">(optional — add later)</span>
                  </label>
                  <textarea
                    value={addForm.content}
                    onChange={e => setAddForm(f => ({ ...f, content: e.target.value }))}
                    rows={3}
                    placeholder="Start writing…"
                    className="w-full bg-brand-bg border border-brand-primary/20 rounded-xl px-4 py-2.5 text-sm text-brand-text placeholder-brand-muted/60 focus:outline-none focus:border-brand-primary/60 transition-colors resize-none"
                  />
                </div>
              )}
            </div>

            {addNodeErr && <p className="text-red-400 text-sm mt-3">{addNodeErr}</p>}

            <div className="flex gap-3 mt-5">
              <button onClick={() => setAddTarget(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-brand-text/60 hover:text-brand-text border border-brand-primary/20 hover:bg-brand-text/5 transition-colors">
                Cancel
              </button>
              <button onClick={handleAddNode} disabled={addingNode}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-brand-primary hover:bg-brand-primary/90 text-white disabled:opacity-50 transition-colors">
                {addingNode ? "Adding…" : `Add ${addTarget.kind === "chapter" ? "Chapter" : nodeLabel(addType)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-brand-card border border-brand-primary/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-start gap-3 mb-4">
              <span className="material-symbols-rounded text-red-400 flex-shrink-0 mt-0.5" style={{ fontSize: "1.4rem" }}>warning</span>
              <div>
                <h2 className="text-brand-text font-semibold">Delete {deleteTarget.label}?</h2>
                <p className="text-brand-text/50 text-sm mt-1">This cannot be undone.</p>
              </div>
            </div>
            {deleteErr && <p className="text-red-400 text-sm mb-3">{deleteErr}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteErr(null); }}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium text-brand-text/60 hover:text-brand-text border border-brand-primary/20 hover:bg-brand-text/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 transition-colors"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
