import { baseApi } from "@/store/api/baseApi";
import type {
  ChapterDtoPost,
  ChapterDtoResponse,
} from "@/types/api/generated";

type CreateChapterArgs = {
  courseId: string;
  title: string;
};

type UpdateChapterArgs = {
  chapterId: string;
  courseId?: string;
  data: ChapterDtoPost;
};

type DeleteChapterArgs = {
  chapterId: string;
  courseId?: string;
};

export const chaptersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createChapter: builder.mutation<ChapterDtoResponse, CreateChapterArgs>({
      query: ({ courseId, title }) => ({
        url: `/api/v1/courses/${courseId}/chapters`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(title),
      }),
      invalidatesTags: (_result, _error, { courseId }) => [
        { type: "Course", id: courseId },
        { type: "Chapter", id: `${courseId}:chapters` },
      ],
    }),
    updateChapter: builder.mutation<ChapterDtoResponse, UpdateChapterArgs>({
      query: ({ chapterId, data }) => ({
        url: `/api/v1/chapters/${chapterId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { chapterId, courseId }) => [
        { type: "Chapter", id: chapterId },
        ...(courseId ? [{ type: "Course" as const, id: courseId }] : []),
      ],
    }),
    deleteChapter: builder.mutation<void, DeleteChapterArgs>({
      query: ({ chapterId }) => ({
        url: `/api/v1/chapters/${chapterId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { chapterId, courseId }) => [
        { type: "Chapter", id: chapterId },
        ...(courseId ? [{ type: "Course" as const, id: courseId }] : []),
      ],
    }),
  }),
});

export const {
  useCreateChapterMutation,
  useUpdateChapterMutation,
  useDeleteChapterMutation,
} = chaptersApi;
