import { baseApi } from "@/store/api/baseApi";
import type {
  LessonDtoPost,
  LessonDtoEntity,
  LessonDtoMetadata,
  ResponseLessonResourceDto,
} from "@/types/api/generated";
import type { Lesson, LessonResource } from "@/types/domain/courses";

type CreateLessonArgs = {
  chapterId: string;
  courseId?: string;
  data: LessonDtoPost;
};

type UpdateLessonMetadataArgs = {
  lessonId: string;
  courseId?: string;
  data: LessonDtoMetadata;
};

type UpdateLessonContentArgs = {
  lessonId: string;
  courseId?: string;
  content: string;
};

type DeleteLessonArgs = {
  lessonId: string;
  courseId?: string;
};

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
    createLesson: builder.mutation<Lesson, CreateLessonArgs>({
      query: ({ chapterId, data }) => ({
        url: `/api/v1/chapters/${chapterId}/lessons`,
        method: "POST",
        body: data,
      }),
      transformResponse: normalizeLesson,
      invalidatesTags: (_result, _error, { chapterId, courseId }) => [
        { type: "Chapter", id: `${chapterId}:lessons` },
        ...(courseId ? [{ type: "Course" as const, id: courseId }] : []),
      ],
    }),
    updateLessonMetadata: builder.mutation<Lesson, UpdateLessonMetadataArgs>({
      query: ({ lessonId, data }) => ({
        url: `/api/v1/lessons/${lessonId}/metadata`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: normalizeLesson,
      invalidatesTags: (_result, _error, { lessonId, courseId }) => [
        { type: "Lesson", id: lessonId },
        ...(courseId ? [{ type: "Course" as const, id: courseId }] : []),
      ],
    }),
    updateLessonContent: builder.mutation<Lesson, UpdateLessonContentArgs>({
      query: ({ lessonId, content }) => ({
        url: `/api/v1/lessons/${lessonId}/content`,
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      }),
      transformResponse: normalizeLesson,
      invalidatesTags: (_result, _error, { lessonId, courseId }) => [
        { type: "Lesson", id: lessonId },
        ...(courseId ? [{ type: "Course" as const, id: courseId }] : []),
      ],
    }),
    deleteLesson: builder.mutation<void, DeleteLessonArgs>({
      query: ({ lessonId }) => ({
        url: `/api/v1/lessons/${lessonId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { lessonId, courseId }) => [
        { type: "Lesson", id: lessonId },
        ...(courseId ? [{ type: "Course" as const, id: courseId }] : []),
      ],
    }),
  }),
});

export const {
  useGetLessonByIdQuery,
  useGetLessonResourcesQuery,
  useCreateLessonMutation,
  useUpdateLessonMetadataMutation,
  useUpdateLessonContentMutation,
  useDeleteLessonMutation,
} = lessonsApi;
