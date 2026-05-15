import { getApiErrorMessage } from "@/lib/api/errors";
import { baseApi } from "@/store/api/baseApi";
import { coursesApi } from "@/store/api/coursesApi";
import type { ApiError } from "@/types/api/errors";
import type {
  EnrolledCourseDto,
  PageStudentProgressDto,
  ProgressWithLessonListDto,
  StudentProgressDto,
} from "@/types/api/generated";
import type {
  CourseProgress,
  MyCourseProgressOverview,
  StudentCourseProgress,
  StudentProgressRecord,
} from "@/types/domain/progress";

type PageArgs = {
  page?: number;
  size?: number;
};

type CourseProgressArgs = PageArgs & {
  courseId: string;
};

function normalizeProgress(progress: ProgressWithLessonListDto): CourseProgress {
  return {
    totalLessons: progress.totalLessons ?? 0,
    visitedLessons: progress.visitedLessons ?? 0,
    progressPercent: progress.progressPercent ?? 0,
    completedAt: progress.completedAt,
    lessons: progress.lessons ?? [],
  };
}

function normalizeStudentProgress(progress: StudentProgressDto): StudentProgressRecord {
  return {
    studentId: progress.studentId ?? "",
    enrolledAt: progress.enrolledAt,
    progressPercent: progress.progressPercent ?? 0,
    completedAt: progress.completedAt,
  };
}

export const progressApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyCourseProgress: builder.query<CourseProgress, string>({
      query: (courseId) => `/api/v1/courses/${courseId}/my-progress`,
      transformResponse: normalizeProgress,
      providesTags: (_result, _error, courseId) => [
        { type: "Progress", id: `${courseId}:my-progress` },
      ],
    }),
    getMyProgressOverview: builder.query<MyCourseProgressOverview[], void>({
      async queryFn(_arg, api, _extraOptions, baseQuery) {
        try {
          const courses = await api.dispatch(
            coursesApi.endpoints.getEnrolledCourses.initiate(
              { page: 0, size: 100 },
              { subscribe: false },
            ),
          ).unwrap();

          const progressResults: MyCourseProgressOverview[] = await Promise.all(
            courses.content.map(async (course) => {
              const progressResult = await baseQuery(
                `/api/v1/courses/${course.id}/my-progress`,
              );

              if (progressResult.error) throw progressResult.error;

              const progress = normalizeProgress(
                progressResult.data as ProgressWithLessonListDto,
              );

              return {
                courseId: course.id,
                courseTitle: course.title,
                courseCategory: course.category,
                enrolledAt: course.enrolledAt,
                completedAt: progress.completedAt ?? course.completedAt,
                progressPercent: progress.progressPercent ?? course.progressPercent ?? 0,
                totalLessons: progress.totalLessons ?? 0,
                visitedLessons: progress.visitedLessons ?? 0,
                lessons: progress.lessons ?? [],
              } satisfies MyCourseProgressOverview;
            }),
          );

          return { data: progressResults };
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
      providesTags: [{ type: "Progress", id: "MY_OVERVIEW" }],
    }),
    getCourseStudentProgress: builder.query<StudentProgressRecord[], CourseProgressArgs>({
      query: ({ courseId, page = 0, size = 100 }) => ({
        url: `/api/v1/courses/${courseId}/students-progress`,
        params: { page, size },
      }),
      transformResponse: (response: PageStudentProgressDto | StudentProgressDto[]) =>
        (Array.isArray(response) ? response : response.content ?? [])
          .map(normalizeStudentProgress)
          .filter((progress) => progress.studentId),
      providesTags: (_result, _error, { courseId }) => [
        { type: "Progress", id: `${courseId}:students` },
      ],
    }),
    getStudentCoursesProgress: builder.query<StudentCourseProgress[], string>({
      query: (studentId) => `/api/v1/students/${studentId}/courses-progress`,
      transformResponse: (response: EnrolledCourseDto | EnrolledCourseDto[]) =>
        Array.isArray(response) ? response : [response],
      providesTags: (_result, _error, studentId) => [
        { type: "Progress", id: `${studentId}:courses` },
      ],
    }),
  }),
});

export const {
  useGetMyCourseProgressQuery,
  useGetMyProgressOverviewQuery,
  useGetCourseStudentProgressQuery,
  useGetStudentCoursesProgressQuery,
} = progressApi;
