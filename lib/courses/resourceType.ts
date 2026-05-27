import type { Lesson } from "./types";

const VIDEO_FILE_EXTENSION_RE = /\.(mp4|webm|ogg|mov|avi|m4v|mkv)(?:[?#]|$)/i;
const VIDEO_HOSTS = new Set(["youtu.be", "youtube-nocookie.com", "vimeo.com"]);

function isVideoHost(hostname: string): boolean {
  return (
    VIDEO_HOSTS.has(hostname) ||
    hostname === "youtube.com" ||
    hostname.endsWith(".youtube.com") ||
    hostname.endsWith(".vimeo.com")
  );
}

export function isVideoResourceUrl(url: string): boolean {
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return false;

  if (VIDEO_FILE_EXTENSION_RE.test(trimmedUrl)) {
    return true;
  }

  try {
    const hostname = new URL(trimmedUrl).hostname.replace(/^www\./, "");
    return isVideoHost(hostname);
  } catch {
    return /(youtube\.com|youtu\.be|youtube-nocookie\.com|vimeo\.com)/i.test(trimmedUrl);
  }
}

export function lessonHasVideoResource(
  lesson: Pick<Lesson, "lessonResources">
): boolean {
  return lesson.lessonResources.some((resource) => isVideoResourceUrl(resource.url));
}
