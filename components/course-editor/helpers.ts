import type { EditorNodeType, NodeForm } from "./types";

export const EMPTY_FORM: NodeForm = {
  title: "",
  description: "",
  content: "",
  fileUrl: "",
  pendingFile: null,
};

let counter = 0;

export function tempId() {
  counter += 1;
  return `temp_${counter}`;
}

export function nodeIcon(type: EditorNodeType): string {
  switch (type) {
    case "CHAPTER":
      return "folder";
    case "TEXT":
      return "article";
    case "FILE":
      return "attach_file";
    case "VIDEO":
      return "videocam";
    case "TEST":
      return "quiz";
  }
}

export function nodeLabel(type: EditorNodeType): string {
  switch (type) {
    case "CHAPTER":
      return "Chapter";
    case "TEXT":
      return "Text";
    case "FILE":
      return "File";
    case "VIDEO":
      return "Video";
    case "TEST":
      return "Test";
  }
}
