export type EditorEntityKind = "chapter" | "lesson" | "resource";

export interface EditorResource {
  id: string;
  title: string;
  url: string;
}

export interface EditorLesson {
  id: string;
  title: string;
  contentMarkdown: string;
  orderIndex: number;
  testId?: string;
  resources: EditorResource[];
}

export interface EditorChapter {
  id: string;
  title: string;
  orderIndex: number;
  lessons: EditorLesson[];
}

export type SelectedRef =
  | { kind: "chapter"; id: string }
  | { kind: "lesson"; chapterId: string; id: string }
  | { kind: "resource"; chapterId: string; lessonId: string; id: string };

export interface EditorForm {
  title: string;
  contentMarkdown: string;
  url: string;
}

export type AddTarget =
  | { kind: "chapter" }
  | { kind: "lesson"; chapterId: string }
  | { kind: "resource"; chapterId: string; lessonId: string };

export interface DeleteTarget {
  label: string;
  onConfirm: () => Promise<void>;
}

export type MoveDirection = "UP" | "DOWN";

export interface CourseEditorProps {
  mode: "create" | "edit";
  courseId?: string;
}
