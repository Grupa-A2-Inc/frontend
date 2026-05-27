import type { EditorEntityKind, EditorForm } from "./types";

export const EMPTY_FORM: EditorForm = {
  title: "",
  contentMarkdown: "",
  url: "",
};

let counter = 0;

export function tempId() {
  counter += 1;
  return `temp_${counter}`;
}

export function entityIcon(kind: EditorEntityKind): string {
  switch (kind) {
    case "chapter":
      return "folder";
    case "lesson":
      return "article";
    case "resource":
      return "attach_file";
  }
}

export function entityLabel(kind: EditorEntityKind): string {
  switch (kind) {
    case "chapter":
      return "Chapter";
    case "lesson":
      return "Lesson";
    case "resource":
      return "Resource";
  }
}
