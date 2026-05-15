import { getApiErrorMessage } from "@/lib/api/errors";
import { baseApi } from "@/store/api/baseApi";
import { coursesApi } from "@/store/api/coursesApi";
import type { ApiError } from "@/types/api/errors";
import type {
  AiGenerateRequestDto,
  AiGenerateResponseDto,
  AiRequestStatusDto,
  InjectRequestDto,
  InjectionResultDto,
  TestEditDto,
  TestEntityDto,
} from "@/types/api/generated";
import type { CourseFullView } from "@/types/domain/courses";
import type { CourseLessonTestSummary } from "@/types/domain/tests";

type LessonTestArgs = {
  lessonId: string;
};

type CreateLessonTestArgs = LessonTestArgs & {
  data: TestEditDto;
};

type UpdateTestArgs = {
  testId: string;
  data: TestEditDto;
};

type GenerateAiTestArgs = {
  lessonId: string;
  data: AiGenerateRequestDto;
};

type InjectAiQuestionsArgs = {
  requestId: string;
  data?: InjectRequestDto;
};

function extractLessonTests(course: CourseFullView): CourseLessonTestSummary[] {
  return course.chapters.flatMap((chapter) =>
    chapter.lessons
      .filter((lesson) => lesson.testId)
      .map((lesson) => ({
        testId: lesson.testId ?? "",
        courseId: course.id,
        courseTitle: course.title,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        lessonId: lesson.id,
        lessonTitle: lesson.title,
      })),
  );
}

export const testsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMyAvailableTests: builder.query<CourseLessonTestSummary[], void>({
      async queryFn(_arg, api) {
        try {
          const courses = await api.dispatch(
            coursesApi.endpoints.getEnrolledCourses.initiate(
              { page: 0, size: 100 },
              { subscribe: false },
            ),
          ).unwrap();

          const fullViews = await Promise.all(
            courses.content.map((course) =>
              api.dispatch(
                coursesApi.endpoints.getCourseFullView.initiate(course.id, {
                  subscribe: false,
                }),
              ).unwrap(),
            ),
          );

          return { data: fullViews.flatMap(extractLessonTests) };
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
      providesTags: [{ type: "Test", id: "MY_AVAILABLE_TESTS" }],
    }),
    getMyCreatedTests: builder.query<CourseLessonTestSummary[], void>({
      async queryFn(_arg, api) {
        try {
          const courses = await api.dispatch(
            coursesApi.endpoints.getMyCourses.initiate(undefined, {
              subscribe: false,
            }),
          ).unwrap();

          const fullViews = await Promise.all(
            courses.map((course) =>
              api.dispatch(
                coursesApi.endpoints.getCourseFullView.initiate(course.id, {
                  subscribe: false,
                }),
              ).unwrap(),
            ),
          );

          return { data: fullViews.flatMap(extractLessonTests) };
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
      providesTags: [{ type: "Test", id: "MY_CREATED_TESTS" }],
    }),
    getTestByLesson: builder.query<TestEntityDto, string>({
      query: (lessonId) => `/api/v1/lessons/${lessonId}/test`,
      providesTags: (result, _error, lessonId) => [
        { type: "Test", id: result?.id ?? `${lessonId}:test` },
        { type: "Lesson", id: lessonId },
      ],
    }),
    createTestForLesson: builder.mutation<TestEntityDto, CreateLessonTestArgs>({
      query: ({ lessonId, data }) => ({
        url: `/api/v1/lessons/${lessonId}/test`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { lessonId }) => [
        { type: "Lesson", id: lessonId },
        { type: "Test", id: `${lessonId}:test` },
        { type: "Test", id: "MY_CREATED_TESTS" },
      ],
    }),
    getTestDetails: builder.query<TestEntityDto, string>({
      query: (testId) => `/api/v1/tests/${testId}`,
      providesTags: (_result, _error, testId) => [{ type: "Test", id: testId }],
    }),
    updateTest: builder.mutation<TestEntityDto, UpdateTestArgs>({
      query: ({ testId, data }) => ({
        url: `/api/v1/tests/${testId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { testId }) => [{ type: "Test", id: testId }],
    }),
    publishTest: builder.mutation<TestEntityDto, string>({
      query: (testId) => ({
        url: `/api/v1/tests/${testId}/publish`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, testId) => [
        { type: "Test", id: testId },
        { type: "Test", id: "MY_AVAILABLE_TESTS" },
        { type: "Test", id: "MY_CREATED_TESTS" },
        { type: "Question", id: `${testId}:LIST` },
      ],
    }),
    deleteTest: builder.mutation<void, string>({
      query: (testId) => ({
        url: `/api/v1/tests/${testId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, testId) => [
        { type: "Test", id: testId },
        { type: "Test", id: "MY_AVAILABLE_TESTS" },
        { type: "Test", id: "MY_CREATED_TESTS" },
        { type: "Question", id: `${testId}:LIST` },
      ],
    }),
    generateAiTestForLesson: builder.mutation<AiGenerateResponseDto, GenerateAiTestArgs>({
      query: ({ lessonId, data }) => ({
        url: `/api/v1/lessons/${lessonId}/ai/generate-test`,
        method: "POST",
        body: data,
      }),
    }),
    getAiRequestStatus: builder.query<AiRequestStatusDto, string>({
      query: (requestId) => `/api/v1/ai/requests/${requestId}/status`,
      providesTags: (_result, _error, requestId) => [
        { type: "Analytics", id: `ai-request:${requestId}` },
      ],
    }),
    injectAiQuestions: builder.mutation<InjectionResultDto, InjectAiQuestionsArgs>({
      query: ({ requestId, data }) => ({
        url: `/api/v1/ai/request/${requestId}/inject`,
        method: "POST",
        body: data ?? {},
      }),
      invalidatesTags: (_result, _error, { data }) =>
        data?.testIdOpt
          ? [{ type: "Question", id: `${data.testIdOpt}:LIST` }]
          : [{ type: "Test", id: "LIST" }],
    }),
  }),
});

export const {
  useGetMyAvailableTestsQuery,
  useGetMyCreatedTestsQuery,
  useGetTestByLessonQuery,
  useCreateTestForLessonMutation,
  useGetTestDetailsQuery,
  useUpdateTestMutation,
  usePublishTestMutation,
  useDeleteTestMutation,
  useGenerateAiTestForLessonMutation,
  useGetAiRequestStatusQuery,
  useInjectAiQuestionsMutation,
} = testsApi;
