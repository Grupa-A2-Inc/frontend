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

export type SelectedRef =
  | { kind: "chapter"; id: string }
  | { kind: "leaf"; chapterId: string; id: string };

export interface NodeForm {
  title: string;
  description: string;
  content: string;
  fileUrl: string;
  pendingFile: File | null;
}

export type AddTarget = { kind: "chapter" | "leaf"; parentId: string | null };

export interface DeleteTarget {
  label: string;
  onConfirm: () => Promise<void>;
}

export type MoveDirection = "UP" | "DOWN";

export interface CourseEditorProps {
  mode: "create" | "edit";
  courseId?: string;
}
