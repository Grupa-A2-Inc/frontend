import { baseApi } from "@/store/api/baseApi";
import type {
  QuestionDataForUsersDto,
  QuestionRequestDto,
  QuestionResponseDto,
} from "@/types/api/generated";

type QuestionArgs = {
  testId: string;
  questionId: number;
};

type CreateQuestionArgs = {
  testId: string;
  data: QuestionRequestDto;
};

type UpdateQuestionArgs = QuestionArgs & {
  data: QuestionRequestDto;
};

export const questionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeacherQuestions: builder.query<QuestionResponseDto[], string>({
      query: (testId) => `/api/tests/${testId}/questions`,
      providesTags: (_result, _error, testId) => [
        { type: "Question", id: `${testId}:LIST` },
      ],
    }),
    getUserQuestions: builder.query<QuestionDataForUsersDto[], string>({
      query: (testId) => `/api/v1/tests/${testId}/questions`,
      providesTags: (_result, _error, testId) => [
        { type: "Question", id: `${testId}:USER_LIST` },
      ],
    }),
    createQuestion: builder.mutation<QuestionResponseDto, CreateQuestionArgs>({
      query: ({ testId, data }) => ({
        url: `/api/tests/${testId}/questions`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { testId }) => [
        { type: "Question", id: `${testId}:LIST` },
        { type: "Question", id: `${testId}:USER_LIST` },
      ],
    }),
    updateQuestion: builder.mutation<QuestionResponseDto, UpdateQuestionArgs>({
      query: ({ testId, questionId, data }) => ({
        url: `/api/tests/${testId}/questions/${questionId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { testId, questionId }) => [
        { type: "Question", id: questionId },
        { type: "Question", id: `${testId}:LIST` },
        { type: "Question", id: `${testId}:USER_LIST` },
      ],
    }),
    deleteQuestion: builder.mutation<void, QuestionArgs>({
      query: ({ testId, questionId }) => ({
        url: `/api/tests/${testId}/questions/${questionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { testId, questionId }) => [
        { type: "Question", id: questionId },
        { type: "Question", id: `${testId}:LIST` },
        { type: "Question", id: `${testId}:USER_LIST` },
      ],
    }),
  }),
});

export const {
  useGetTeacherQuestionsQuery,
  useGetUserQuestionsQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
} = questionsApi;
