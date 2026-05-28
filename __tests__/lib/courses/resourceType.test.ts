import { describe, it, expect } from 'vitest'
import {
  isVideoResourceUrl,
  lessonHasTextContent,
  lessonHasVideoResource,
  lessonIsVideoOnly,
} from '@/lib/courses/resourceType'

describe('isVideoResourceUrl', () => {
  it('returns false for empty string', () => {
    expect(isVideoResourceUrl('')).toBe(false)
  })

  it('returns false for whitespace-only string', () => {
    expect(isVideoResourceUrl('   ')).toBe(false)
  })

  it('returns true for .mp4 URL', () => {
    expect(isVideoResourceUrl('https://example.com/video.mp4')).toBe(true)
  })

  it('returns true for .webm URL', () => {
    expect(isVideoResourceUrl('https://example.com/video.webm')).toBe(true)
  })

  it('returns true for .ogg URL', () => {
    expect(isVideoResourceUrl('https://example.com/video.ogg')).toBe(true)
  })

  it('returns true for .mov URL', () => {
    expect(isVideoResourceUrl('https://example.com/video.mov')).toBe(true)
  })

  it('returns true for .avi URL', () => {
    expect(isVideoResourceUrl('https://example.com/video.avi')).toBe(true)
  })

  it('returns true for .mkv URL', () => {
    expect(isVideoResourceUrl('https://example.com/video.mkv')).toBe(true)
  })

  it('returns true for YouTube URL', () => {
    expect(isVideoResourceUrl('https://www.youtube.com/watch?v=abc123')).toBe(true)
  })

  it('returns true for youtu.be URL', () => {
    expect(isVideoResourceUrl('https://youtu.be/abc123')).toBe(true)
  })

  it('returns true for youtube-nocookie.com URL', () => {
    expect(isVideoResourceUrl('https://www.youtube-nocookie.com/embed/abc')).toBe(true)
  })

  it('returns true for Vimeo URL', () => {
    expect(isVideoResourceUrl('https://vimeo.com/123456')).toBe(true)
  })

  it('returns true for subdomain of youtube.com', () => {
    expect(isVideoResourceUrl('https://music.youtube.com/watch?v=abc')).toBe(true)
  })

  it('returns false for a PDF URL', () => {
    expect(isVideoResourceUrl('https://example.com/doc.pdf')).toBe(false)
  })

  it('returns false for a non-video host', () => {
    expect(isVideoResourceUrl('https://example.com/page')).toBe(false)
  })

  it('handles malformed URL with youtube in path', () => {
    expect(isVideoResourceUrl('not-a-url-youtube.com/video')).toBe(true)
  })

  it('handles mp4 URL with query string', () => {
    expect(isVideoResourceUrl('https://cdn.example.com/video.mp4?token=abc')).toBe(true)
  })
})

describe('lessonHasVideoResource', () => {
  it('returns true when at least one resource is a video', () => {
    const lesson = {
      lessonResources: [
        { id: 'r1', lessonId: 'l1', title: 'PDF', url: 'https://example.com/doc.pdf' },
        { id: 'r2', lessonId: 'l1', title: 'Video', url: 'https://youtube.com/watch?v=x' },
      ],
    }
    expect(lessonHasVideoResource(lesson)).toBe(true)
  })

  it('returns false when no resources are videos', () => {
    const lesson = {
      lessonResources: [
        { id: 'r1', lessonId: 'l1', title: 'PDF', url: 'https://example.com/doc.pdf' },
      ],
    }
    expect(lessonHasVideoResource(lesson)).toBe(false)
  })

  it('returns false when there are no resources', () => {
    expect(lessonHasVideoResource({ lessonResources: [] })).toBe(false)
  })
})

describe('lessonHasTextContent', () => {
  it('returns true when markdown has text', () => {
    expect(lessonHasTextContent({ contentMarkdown: '# Lesson text' })).toBe(true)
  })

  it('returns false when markdown is empty or whitespace', () => {
    expect(lessonHasTextContent({ contentMarkdown: '' })).toBe(false)
    expect(lessonHasTextContent({ contentMarkdown: '   ' })).toBe(false)
  })
})

describe('lessonIsVideoOnly', () => {
  it('returns true for video lessons without text content', () => {
    expect(lessonIsVideoOnly({
      contentMarkdown: '',
      lessonResources: [
        { id: 'r1', lessonId: 'l1', title: 'Video', url: 'https://youtube.com/watch?v=x' },
      ],
    })).toBe(true)
  })

  it('returns false for video lessons that also have text content', () => {
    expect(lessonIsVideoOnly({
      contentMarkdown: 'This lesson already has text content.',
      lessonResources: [
        { id: 'r1', lessonId: 'l1', title: 'Video', url: 'https://youtube.com/watch?v=x' },
      ],
    })).toBe(false)
  })
})
