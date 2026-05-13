import { baseApi } from "@/store/api/baseApi";
import type {
  LessonDtoEntity,
  ResponseLessonResourceDto,
} from "@/types/api/generated";
import type { Lesson, LessonResource } from "@/types/domain/courses";

function normalizeLessonResource(resource: ResponseLessonResourceDto): LessonResource {
  return {
    id: resource.id ?? "",
    lessonId: resource.lessonId,
    title: resource.title ?? "Resource",
    url: resource.url ?? "",
    type: resource.type,
  };
}

function normalizeLesson(lesson: LessonDtoEntity): Lesson {
  return {
    id: lesson.id ?? "",
    chapterId: lesson.chapterId ?? lesson.chapterID,
    title: lesson.title ?? "Untitled lesson",
    contentMarkdown: lesson.contentMarkdown ?? "",
    orderIndex: lesson.orderIndex ?? 0,
    lessonResources: [],
  };
}

export const lessonsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLessonById: builder.query<Lesson, string>({
      query: (lessonId) => `/api/v1/lessons/${lessonId}`,
      transformResponse: normalizeLesson,
      providesTags: (_result, _error, lessonId) => [
        { type: "Lesson", id: lessonId },
      ],
    }),
    getLessonResources: builder.query<LessonResource[], string>({
      query: (lessonId) => `/api/v1/lessons/${lessonId}/resources`,
      transformResponse: (response: ResponseLessonResourceDto[] | { content?: ResponseLessonResourceDto[] }) =>
        (Array.isArray(response) ? response : response.content ?? [])
          .map(normalizeLessonResource)
          .filter((resource) => resource.id),
      providesTags: (_result, _error, lessonId) => [
        { type: "LessonResource", id: `${lessonId}:resources` },
      ],
    }),
  }),
});

export const {
  useGetLessonByIdQuery,
  useGetLessonResourcesQuery,
} = lessonsApi;
