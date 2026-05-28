import { describe, it, expect } from 'vitest'
import {
  mapCourseFullView,
  mapChapter,
  mapLesson,
  mapLessonResource,
  mapCourseTest,
  mapClassroom,
  mapClassroomMember,
  mapStudentProgress,
  mapStudentAverage,
  mapClassroomCourseResponse,
  mapOrganizationUser,
} from '@/lib/courses/mappers'

const baseLesson = {
  id: 'l1',
  chapterId: 'ch1',
  testId: null,
  title: 'Lesson 1',
  contentMarkdown: '# Hello',
  orderIndex: 0,
  lessonResources: [],
}

const baseChapter = {
  id: 'ch1',
  courseId: 'c1',
  title: 'Chapter 1',
  orderIndex: 0,
  lessons: [baseLesson],
}

const baseCourse = {
  id: 'c1',
  title: 'Course',
  description: 'Desc',
  category: 'Web',
  status: 'PUBLISHED',
  visibility: 'PUBLIC',
  createdAt: '2024-01-01',
  chapters: [baseChapter],
}

describe('mapCourseFullView', () => {
  it('maps course and chapters', () => {
    const result = mapCourseFullView(baseCourse)
    expect(result.course.id).toBe('c1')
    expect(result.course.title).toBe('Course')
    expect(result.chapters).toHaveLength(1)
  })

  it('defaults description to empty string', () => {
    const result = mapCourseFullView({ ...baseCourse, description: null })
    expect(result.course.description).toBe('')
  })

  it('defaults category to General', () => {
    const result = mapCourseFullView({ ...baseCourse, category: null })
    expect(result.course.category).toBe('General')
  })

  it('handles missing chapters', () => {
    const result = mapCourseFullView({ ...baseCourse, chapters: null })
    expect(result.chapters).toHaveLength(0)
  })
})

describe('mapChapter', () => {
  it('maps chapter fields', () => {
    const ch = mapChapter(baseChapter)
    expect(ch.id).toBe('ch1')
    expect(ch.courseId).toBe('c1')
    expect(ch.lessons).toHaveLength(1)
  })

  it('handles missing lessons', () => {
    const ch = mapChapter({ ...baseChapter, lessons: null })
    expect(ch.lessons).toHaveLength(0)
  })
})

describe('mapLesson', () => {
  it('maps lesson fields', () => {
    const l = mapLesson(baseLesson)
    expect(l.id).toBe('l1')
    expect(l.chapterId).toBe('ch1')
    expect(l.testId).toBeUndefined()
    expect(l.contentMarkdown).toBe('# Hello')
  })

  it('maps testId when present', () => {
    const l = mapLesson({ ...baseLesson, testId: 't1' })
    expect(l.testId).toBe('t1')
  })

  it('defaults contentMarkdown to empty string', () => {
    const l = mapLesson({ ...baseLesson, contentMarkdown: null })
    expect(l.contentMarkdown).toBe('')
  })

  it('normalizes JSON-encoded contentMarkdown from older saves', () => {
    const l = mapLesson({
      ...baseLesson,
      contentMarkdown: JSON.stringify('# Hello\n\n  spaced line'),
    })

    expect(l.contentMarkdown).toBe('# Hello\n\n  spaced line')
  })

  it('handles missing lessonResources', () => {
    const l = mapLesson({ ...baseLesson, lessonResources: null })
    expect(l.lessonResources).toHaveLength(0)
  })
})

describe('mapLessonResource', () => {
  it('maps resource fields', () => {
    const r = mapLessonResource({ id: 'r1', lessonId: 'l1', title: 'PDF', url: 'http://x.com/a.pdf' })
    expect(r.id).toBe('r1')
    expect(r.url).toBe('http://x.com/a.pdf')
  })
})

describe('mapCourseTest', () => {
  const raw = { id: 't1', title: 'Test 1', description: 'Desc', timeLimitSec: 120, status: 'ACTIVE', aiEnabled: true, createdAt: '2024-01-01' }
  it('maps test fields', () => {
    const t = mapCourseTest(raw, 'l1')
    expect(t.id).toBe('t1')
    expect(t.lessonId).toBe('l1')
    expect(t.aiEnabled).toBe(true)
  })

  it('defaults description and timeLimitSec to undefined', () => {
    const t = mapCourseTest({ ...raw, description: null, timeLimitSec: null }, 'l1')
    expect(t.description).toBeUndefined()
    expect(t.timeLimitSec).toBeUndefined()
  })

  it('defaults aiEnabled to false', () => {
    const t = mapCourseTest({ ...raw, aiEnabled: null }, 'l1')
    expect(t.aiEnabled).toBe(false)
  })
})

describe('mapClassroom', () => {
  it('maps classroom fields', () => {
    const raw = { id: 'cl1', organizationId: 'org1', name: 'Class A', description: 'Desc', createdAt: '2024-01-01' }
    const c = mapClassroom(raw)
    expect(c.id).toBe('cl1')
    expect(c.description).toBe('Desc')
  })

  it('defaults description to undefined', () => {
    const c = mapClassroom({ id: 'cl1', organizationId: 'org1', name: 'Class A', description: null, createdAt: '2024-01-01' })
    expect(c.description).toBeUndefined()
  })
})

describe('mapClassroomMember', () => {
  it('maps member fields', () => {
    const m = mapClassroomMember({ userId: 'u1', email: 'a@b.com', membershipType: 'STUDENT' })
    expect(m.userId).toBe('u1')
    expect(m.membershipType).toBe('STUDENT')
  })
})

describe('mapStudentProgress', () => {
  it('maps progress fields', () => {
    const p = mapStudentProgress({ studentId: 's1', enrolledAt: '2024-01-01', progressPercent: 50, completedAt: null })
    expect(p.studentId).toBe('s1')
    expect(p.progressPercent).toBe(50)
    expect(p.completedAt).toBeUndefined()
  })

  it('defaults progressPercent to 0', () => {
    const p = mapStudentProgress({ studentId: 's1', enrolledAt: '2024-01-01', progressPercent: null, completedAt: null })
    expect(p.progressPercent).toBe(0)
  })
})

describe('mapStudentAverage', () => {
  const raw = { studentId: 's1', averageScore: 80, minScore: 60, maxScore: 100, testCount: 5, passedTests: 4, failedTests: 1, lastAttemptAt: '2024-01-01' }
  it('maps average fields', () => {
    const a = mapStudentAverage(raw)
    expect(a.studentId).toBe('s1')
    expect(a.averageScore).toBe(80)
    expect(a.passedTests).toBe(4)
  })

  it('defaults numeric fields to 0', () => {
    const a = mapStudentAverage({ ...raw, averageScore: null, minScore: null, maxScore: null, testCount: null, passedTests: null, failedTests: null })
    expect(a.averageScore).toBe(0)
    expect(a.testCount).toBe(0)
  })

  it('defaults lastAttemptAt to undefined', () => {
    const a = mapStudentAverage({ ...raw, lastAttemptAt: null })
    expect(a.lastAttemptAt).toBeUndefined()
  })
})

describe('mapClassroomCourseResponse', () => {
  it('maps assignment fields', () => {
    const r = mapClassroomCourseResponse({ id: 'a1', classroomId: 'cl1', courseId: 'c1', assignedAt: '2024-01-01' })
    expect(r.id).toBe('a1')
    expect(r.courseId).toBe('c1')
  })
})

describe('mapOrganizationUser', () => {
  it('maps user fields', () => {
    const u = mapOrganizationUser({ id: 'u1', email: 'a@b.com', firstName: 'John', lastName: 'Doe' })
    expect(u.id).toBe('u1')
    expect(u.firstName).toBe('John')
  })

  it('falls back to userId field', () => {
    const u = mapOrganizationUser({ userId: 'u2', email: 'b@c.com' })
    expect(u.id).toBe('u2')
  })

  it('falls back to snake_case first/last name', () => {
    const u = mapOrganizationUser({ id: 'u3', email: 'c@d.com', first_name: 'Jane', last_name: 'Smith' })
    expect(u.firstName).toBe('Jane')
    expect(u.lastName).toBe('Smith')
  })

  it('defaults to empty string for missing id and email', () => {
    const u = mapOrganizationUser({})
    expect(u.id).toBe('')
    expect(u.email).toBe('')
  })
})
