import { baseApi } from "@/store/api/baseApi";
import type {
  CreateLessonResourceDto,
  ResponseLessonResourceDto,
  UpdateLessonResourceDto,
} from "@/types/api/generated";

type CreateLessonResourceArgs = {
  lessonId: string;
  data: CreateLessonResourceDto;
};

type UpdateLessonResourceArgs = {
  lessonId: string;
  resourceId: string;
  data: UpdateLessonResourceDto;
};

type DeleteLessonResourceArgs = {
  lessonId: string;
  resourceId: string;
};

export const lessonResourcesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createLessonResource: builder.mutation<ResponseLessonResourceDto, CreateLessonResourceArgs>({
      query: ({ lessonId, data }) => ({
        url: `/api/v1/lessons/${lessonId}/resources`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { lessonId }) => [
        { type: "LessonResource", id: `${lessonId}:resources` },
        { type: "Lesson", id: lessonId },
      ],
    }),
    updateLessonResource: builder.mutation<ResponseLessonResourceDto, UpdateLessonResourceArgs>({
      query: ({ lessonId, resourceId, data }) => ({
        url: `/api/v1/lessons/${lessonId}/resources/${resourceId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { lessonId, resourceId }) => [
        { type: "LessonResource", id: resourceId },
        { type: "LessonResource", id: `${lessonId}:resources` },
      ],
    }),
    deleteLessonResource: builder.mutation<void, DeleteLessonResourceArgs>({
      query: ({ lessonId, resourceId }) => ({
        url: `/api/v1/lessons/${lessonId}/resources/${resourceId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { lessonId, resourceId }) => [
        { type: "LessonResource", id: resourceId },
        { type: "LessonResource", id: `${lessonId}:resources` },
      ],
    }),
  }),
});

export const {
  useCreateLessonResourceMutation,
  useUpdateLessonResourceMutation,
  useDeleteLessonResourceMutation,
} = lessonResourcesApi;
