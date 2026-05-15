import { getApiErrorMessage } from "@/lib/api/errors";
import { baseApi } from "@/store/api/baseApi";
import { classroomsApi } from "@/store/api/classroomsApi";
import type { ApiError } from "@/types/api/errors";
import type {
  CreateCourseDto,
  EnrolledCourseDto,
  PageEnrolledCourseDto,
  PageResponseCourseDto,
  PageStudentAverageDto,
  PageStudentProgressDto,
  ResponseCourseDto,
  ResponseCourseFullViewDto,
  ResponseLessonResourceDto,
  StudentAverageDto,
  StudentProgressDto,
  TestEntityDto,
  UpdateCourseDto,
} from "@/types/api/generated";
import type {
  Chapter,
  ClassWithStudents,
  Course,
  CourseFullView,
  CourseTest,
  PaginatedCourses,
  StudentAverage,
  StudentCourse,
  StudentProgress,
} from "@/types/domain/courses";
import type { ClassroomMember } from "@/types/domain/classrooms";

type CollectionEnvelope<T> = {
  content?: T[];
  courses?: T[];
  items?: T[];
  data?: T[];
};

type PageArgs = {
  page?: number;
  size?: number;
};

type CreateCourseArgs = CreateCourseDto & {
  teacherId?: string;
};

type UpdateCourseArgs = {
  courseId: string;
  data: UpdateCourseDto;
};

type CourseStudentsData = {
  classrooms: ClassWithStudents[];
};

function normalizeCollection<T>(response: T[] | CollectionEnvelope<T>): T[] {
  return Array.isArray(response)
    ? response
    : response.content ?? response.courses ?? response.items ?? response.data ?? [];
}

function createEmptyPage(content: StudentCourse[] = []): PaginatedCourses {
  return {
    content,
    totalElements: content.length,
    totalPages: content.length ? 1 : 0,
    numberOfElements: content.length,
    size: content.length,
    number: 0,
    first: true,
    last: true,
    empty: content.length === 0,
  };
}

function mapPage(
  page: Partial<Omit<PaginatedCourses, "content">> | undefined,
  content: StudentCourse[],
): PaginatedCourses {
  return {
    content,
    totalElements: page?.totalElements ?? content.length,
    totalPages: page?.totalPages ?? (content.length ? 1 : 0),
    numberOfElements: page?.numberOfElements ?? content.length,
    size: page?.size ?? content.length,
    number: page?.number ?? 0,
    first: page?.first ?? true,
    last: page?.last ?? true,
    empty: page?.empty ?? content.length === 0,
  };
}

export function normalizeCourse(response: ResponseCourseDto): Course {
  return {
    id: response.id ?? "",
    title: response.title ?? "Untitled course",
    description: response.description ?? "",
    category: response.category ?? "General",
    status: response.status ?? "DRAFT",
    visibility: response.visibility ?? "PRIVATE",
    createdBy: response.createdBy,
  };
}

function normalizeLessonResource(resource: ResponseLessonResourceDto) {
  return {
    id: resource?.id ?? "",
    lessonId: resource?.lessonId,
    title: resource?.title ?? "Resource",
    url: resource?.url ?? "",
    type: resource?.type,
  };
}

function normalizeChapter(chapter: NonNullable<ResponseCourseFullViewDto["chapters"]>[number]): Chapter {
  return {
    id: chapter.id ?? "",
    courseId: chapter.courseId,
    title: chapter.title ?? "Untitled chapter",
    orderIndex: chapter.orderIndex ?? 0,
    lessons: (chapter.lessons ?? []).map((lesson) => ({
      id: lesson.id ?? "",
      chapterId: lesson.chapterId,
      testId: lesson.testId,
      title: lesson.title ?? "Untitled lesson",
      contentMarkdown: lesson.contentMarkdown ?? "",
      orderIndex: lesson.orderIndex ?? 0,
      lessonResources: (lesson.lessonResources ?? []).map(normalizeLessonResource),
    })).filter((lesson) => lesson.id),
  };
}

export function normalizeCourseFullView(response: ResponseCourseFullViewDto): CourseFullView {
  return {
    id: response.id ?? "",
    title: response.title ?? "Untitled course",
    description: response.description ?? "",
    category: response.category ?? "General",
    status: response.status ?? "DRAFT",
    visibility: response.visibility ?? "PRIVATE",
    createdBy: response.createdBy,
    createdAt: response.createdAt,
    chapters: (response.chapters ?? []).map(normalizeChapter).filter((chapter) => chapter.id),
  };
}

function mapPublicCourse(course: ResponseCourseDto): StudentCourse {
  return normalizeCourse(course);
}

function mapEnrolledCourse(course: EnrolledCourseDto): StudentCourse {
  return {
    id: course.courseId ?? "",
    title: course.courseTitle ?? "Untitled course",
    description: "Continue learning where you left off.",
    category: course.courseCategory ?? "General",
    status: "PUBLISHED",
    visibility: "PRIVATE",
    createdBy: "",
    enrollmentId: course.enrollmentId ?? course.unrollmentId,
    enrolledAt: course.enrolledAt,
    progressPercent: course.progressPercent ?? 0,
    completedAt: course.completedAt,
  };
}

function normalizeStudentProgress(progress: StudentProgressDto): StudentProgress {
  return {
    studentId: progress.studentId ?? "",
    enrolledAt: progress.enrolledAt,
    progressPercent: progress.progressPercent ?? 0,
    completedAt: progress.completedAt,
  };
}

function normalizeStudentAverage(average: StudentAverageDto): StudentAverage {
  return {
    studentId: average.studentId ?? "",
    averageScore: average.averageScore ?? 0,
    minScore: average.minScore ?? 0,
    maxScore: average.maxScore ?? 0,
    testCount: average.testCount ?? 0,
    passedTests: average.passedTests ?? 0,
    failedTests: average.failedTests ?? 0,
    lastAttemptAt: average.lastAttemptAt,
  };
}

function buildProgressMap(progress: StudentProgress[]) {
  return new Map(progress.map((item) => [item.studentId, item]));
}

function buildAveragesMap(averages: StudentAverage[]) {
  return new Map(averages.map((item) => [item.studentId, item]));
}

function toStudentGroups(
  classrooms: { id: string; name: string }[],
  membersByClassroom: Map<string, ClassroomMember[]>,
  progress: StudentProgress[],
  averages: StudentAverage[],
): ClassWithStudents[] {
  const progressByStudent = buildProgressMap(progress);
  const averageByStudent = buildAveragesMap(averages);

  return classrooms.map((classroom) => ({
    classId: classroom.id,
    className: classroom.name,
    students: (membersByClassroom.get(classroom.id) ?? [])
      .filter((member) => member.membershipType === "STUDENT")
      .map((member) => {
        const studentProgress = progressByStudent.get(member.userId);
        const studentAverage = averageByStudent.get(member.userId);

        return {
          id: member.userId,
          email: member.email,
          classId: classroom.id,
          className: classroom.name,
          progressPercent: studentProgress?.progressPercent ?? 0,
          averageScore: studentAverage?.averageScore,
          passedTests: studentAverage?.passedTests,
          failedTests: studentAverage?.failedTests,
        };
      }),
  }));
}

function normalizeCourseTest(test: TestEntityDto | null | undefined): CourseTest | null {
  if (!test?.id) return null;

  return {
    id: test.id,
    lessonId: test.lessonId,
    title: test.title ?? "Untitled test",
    description: test.description,
    timeLimitSec: test.timeLimitSec,
    status: test.status ?? "DRAFT",
    aiEnabled: test.aiEnabled ?? false,
    createdAt: test.createdAt,
  };
}

export const coursesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyCourses: builder.query<Course[], void>({
      query: () => "/api/v1/courses/my-courses",
      transformResponse: (response: ResponseCourseDto[] | CollectionEnvelope<ResponseCourseDto>) =>
        normalizeCollection(response).map(normalizeCourse).filter((course) => course.id),
      providesTags: (result) =>
        result
          ? [
              ...result.map((course) => ({ type: "Course" as const, id: course.id })),
              { type: "Course", id: "MY_LIST" },
            ]
          : [{ type: "Course", id: "MY_LIST" }],
    }),
    getPublicCourses: builder.query<PaginatedCourses, PageArgs | void>({
      query: (args) => ({
        url: "/api/v1/courses/public",
        params: {
          page: args?.page ?? 0,
          size: args?.size ?? 10,
        },
      }),
      transformResponse: (response: PageResponseCourseDto | ResponseCourseDto[]) => {
        if (Array.isArray(response)) {
          return createEmptyPage(response.map(mapPublicCourse).filter((course) => course.id));
        }

        const content = (response.content ?? []).map(mapPublicCourse).filter((course) => course.id);
        return mapPage(response, content);
      },
      providesTags: [{ type: "Course", id: "PUBLIC_LIST" }],
    }),
    getEnrolledCourses: builder.query<PaginatedCourses, PageArgs | void>({
      query: (args) => ({
        url: "/api/v1/students/me/courses",
        params: {
          page: args?.page ?? 0,
          size: args?.size ?? 10,
          sort: "enrolledAt,desc",
        },
      }),
      transformResponse: (response: PageEnrolledCourseDto | EnrolledCourseDto[]) => {
        if (Array.isArray(response)) {
          return createEmptyPage(response.map(mapEnrolledCourse).filter((course) => course.id));
        }

        const content = (response.content ?? []).map(mapEnrolledCourse).filter((course) => course.id);
        return mapPage(response, content);
      },
      providesTags: [{ type: "Course", id: "ENROLLED_LIST" }],
    }),
    getCourseFullView: builder.query<CourseFullView, string>({
      query: (courseId) => `/api/v1/courses/${courseId}/full-view`,
      transformResponse: normalizeCourseFullView,
      providesTags: (result, _error, courseId) => {
        const chapters = result?.chapters ?? [];
        const lessons = chapters.flatMap((chapter) => chapter.lessons);

        return [
          { type: "Course", id: courseId },
          { type: "Chapter", id: `${courseId}:chapters` },
          { type: "Lesson", id: `${courseId}:lessons` },
          ...chapters.map((chapter) => ({ type: "Chapter" as const, id: chapter.id })),
          ...lessons.map((lesson) => ({ type: "Lesson" as const, id: lesson.id })),
        ];
      },
    }),
    getCourseStudentProgress: builder.query<StudentProgress[], string>({
      query: (courseId) => ({
        url: `/api/v1/courses/${courseId}/students-progress`,
        params: { page: 0, size: 100 },
      }),
      transformResponse: (response: PageStudentProgressDto | StudentProgressDto[]) =>
        (Array.isArray(response) ? response : response.content ?? [])
          .map(normalizeStudentProgress)
          .filter((progress) => progress.studentId),
      providesTags: (_result, _error, courseId) => [
        { type: "Progress", id: `${courseId}:students` },
      ],
    }),
    getCourseStudentAverages: builder.query<StudentAverage[], string>({
      query: (courseId) => ({
        url: `/api/v1/courses/${courseId}/analytics/student-averages`,
        params: { page: 0, size: 100 },
      }),
      transformResponse: (response: PageStudentAverageDto | StudentAverageDto[]) =>
        (Array.isArray(response) ? response : response.content ?? [])
          .map(normalizeStudentAverage)
          .filter((average) => average.studentId),
      providesTags: (_result, _error, courseId) => [
        { type: "Analytics", id: `${courseId}:student-averages` },
      ],
    }),
    getCourseStudentsByClass: builder.query<CourseStudentsData, string>({
      async queryFn(courseId, api, _extraOptions, baseQuery) {
        try {
          const [classrooms, progressResult, averagesResult] = await Promise.all([
            api.dispatch(
              classroomsApi.endpoints.getClassrooms.initiate(undefined, {
                subscribe: false,
              }),
            ).unwrap(),
            baseQuery({
              url: `/api/v1/courses/${courseId}/students-progress`,
              params: { page: 0, size: 100 },
            }),
            baseQuery({
              url: `/api/v1/courses/${courseId}/analytics/student-averages`,
              params: { page: 0, size: 100 },
            }),
          ]);

          if (progressResult.error) return { error: progressResult.error };
          if (averagesResult.error) return { error: averagesResult.error };

          const progressResponse = progressResult.data as PageStudentProgressDto | StudentProgressDto[];
          const averagesResponse = averagesResult.data as PageStudentAverageDto | StudentAverageDto[];
          const progress = (Array.isArray(progressResponse) ? progressResponse : progressResponse.content ?? [])
            .map(normalizeStudentProgress)
            .filter((item) => item.studentId);
          const averages = (Array.isArray(averagesResponse) ? averagesResponse : averagesResponse.content ?? [])
            .map(normalizeStudentAverage)
            .filter((item) => item.studentId);

          const memberEntries = await Promise.all(
            classrooms.map(async (classroom) => {
              const members = await api.dispatch(
                classroomsApi.endpoints.listClassroomMembers.initiate(classroom.id, {
                  subscribe: false,
                }),
              ).unwrap();

              return [classroom.id, members] as const;
            }),
          );

          return {
            data: {
              classrooms: toStudentGroups(
                classrooms,
                new Map(memberEntries),
                progress,
                averages,
              ),
            },
          };
        } catch (error) {
          return {
            error: {
              status: "CUSTOM_ERROR",
              message: getApiErrorMessage(error),
              details: error,
            } satisfies ApiError,
          };
        }
      },
      providesTags: (_result, _error, courseId) => [
        { type: "Course", id: `${courseId}:students-by-class` },
        { type: "Progress", id: `${courseId}:students` },
        { type: "Analytics", id: `${courseId}:student-averages` },
        { type: "Classroom", id: "LIST" },
      ],
    }),
    getLessonTest: builder.query<CourseTest | null, string>({
      query: (lessonId) => `/api/v1/lessons/${lessonId}/test`,
      transformResponse: normalizeCourseTest,
      providesTags: (_result, _error, lessonId) => [
        { type: "Test", id: `${lessonId}:test` },
      ],
    }),
    createCourse: builder.mutation<Course, CreateCourseArgs>({
      query: (body) => ({
        url: "/api/v1/courses",
        method: "POST",
        body: {
          ...body,
          chapters: body.chapters ?? [],
        },
      }),
      transformResponse: normalizeCourse,
      invalidatesTags: [
        { type: "Course", id: "MY_LIST" },
        { type: "Course", id: "PUBLIC_LIST" },
      ],
    }),
    patchCourse: builder.mutation<Course, UpdateCourseArgs>({
      query: ({ courseId, data }) => ({
        url: `/api/v1/courses/${courseId}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: normalizeCourse,
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "Course", id: courseId },
        { type: "Course", id: "MY_LIST" },
        { type: "Course", id: "PUBLIC_LIST" },
      ],
    }),
    deleteCourse: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/api/v1/courses/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, courseId) => [
        { type: "Course", id: courseId },
        { type: "Course", id: "MY_LIST" },
        { type: "Course", id: "PUBLIC_LIST" },
        { type: "Course", id: "ENROLLED_LIST" },
      ],
    }),
    enrollInCourse: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/api/v1/courses/${courseId}/enroll`,
        method: "POST",
      }),
      invalidatesTags: [
        { type: "Course", id: "PUBLIC_LIST" },
        { type: "Course", id: "ENROLLED_LIST" },
      ],
    }),
    unenrollFromCourse: builder.mutation<void, string>({
      query: (courseId) => ({
        url: `/api/v1/courses/${courseId}/unenroll`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Course", id: "PUBLIC_LIST" },
        { type: "Course", id: "ENROLLED_LIST" },
      ],
    }),
  }),
});

export const {
  useGetMyCoursesQuery,
  useGetPublicCoursesQuery,
  useGetEnrolledCoursesQuery,
  useGetCourseFullViewQuery,
  useGetCourseStudentProgressQuery,
  useGetCourseStudentAveragesQuery,
  useGetCourseStudentsByClassQuery,
  useGetLessonTestQuery,
  useCreateCourseMutation,
  usePatchCourseMutation,
  useDeleteCourseMutation,
  useEnrollInCourseMutation,
  useUnenrollFromCourseMutation,
} = coursesApi;
