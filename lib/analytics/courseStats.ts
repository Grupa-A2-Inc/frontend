import type { StudentCourseStats } from "@/lib/analytics/types";

export type CourseTestSource = {
  chapters?: Array<{
    lessons?: Array<{
      testId?: string | null;
    }> | null;
  }> | null;
};

export function countCourseTests(course: CourseTestSource | null | undefined): number {
  const testIds = new Set<string>();

  course?.chapters?.forEach((chapter) => {
    chapter.lessons?.forEach((lesson) => {
      if (lesson.testId) testIds.add(lesson.testId);
    });
  });

  return testIds.size;
}

export function resolveStudentTestTotals(
  stats: Pick<StudentCourseStats, "totalTestCount" | "totalTestDone" | "totalTestPassed">,
  courseTestCount?: number,
) {
  const backendTotal = stats.totalTestCount ?? 0;
  const total = courseTestCount && courseTestCount > 0 ? courseTestCount : backendTotal;
  const done = stats.totalTestDone ?? 0;
  const passed = stats.totalTestPassed ?? 0;

  return {
    total,
    done: total > 0 ? Math.min(done, total) : done,
    passed: total > 0 ? Math.min(passed, total) : passed,
  };
}
