# API And RTK Query Plan

This is the core rewrite plan. API communication and state management are the highest priority.

## Current Problems To Remove

1. Many modules hardcode the production API URL.
2. Some modules use `NEXT_PUBLIC_API_URL`, others ignore it.
3. `fetchWithAuth` is used in some places, but many components/slices do their own `fetch`.
4. Auth token access is scattered through slices, API helpers, pages, and components.
5. Redux slices currently hold both server data and UI flags.
6. Server cache invalidation is manual or absent.
7. Error parsing is inconsistent.
8. `createAsyncThunk` is overused for request/response data that RTK Query should own.
9. Types are duplicated across `lib/*/types.ts` and component-specific files.

## Target Architecture

```txt
app/
  api/
    support-chat/route.ts        server-only AI support proxy
  dashboard/...

components/
  feature components only

features/
  optional later home for feature-specific hooks/components

store/
  index.ts
  StoreProvider.tsx
  hooks.ts
  api/
    baseApi.ts
    authApi.ts
    usersApi.ts
    organizationsApi.ts
    classroomsApi.ts
    coursesApi.ts
    chaptersApi.ts
    lessonsApi.ts
    lessonResourcesApi.ts
    testsApi.ts
    questionsApi.ts
    attemptsApi.ts
    progressApi.ts
    analyticsApi.ts
    adaptiveApi.ts
    subscriptionsApi.ts
    supportApi.ts
  slices/
    authSlice.ts                 session identity and auth UI only
    uiSlice.ts                   optional global UI only
    courseEditorDraftSlice.ts    local unsaved editor state only if needed
    adaptiveSessionSlice.ts      active answer UI only if needed

types/
  api/
    generated.ts                 OpenAPI DTOs, generated or curated
    common.ts
  domain/
    auth.ts
    users.ts
    organizations.ts
    classrooms.ts
    courses.ts
    lessons.ts
    tests.ts
    progress.ts
    analytics.ts
    adaptive.ts
    subscriptions.ts
    support.ts
  ui/
    navigation.ts
    forms.ts
```

## Base API Design

Create `store/api/baseApi.ts`.

Responsibilities:

- Own `baseUrl`.
- Attach auth credentials or bearer token in one place.
- Normalize errors.
- Dispatch session-expired handling on `401`.
- Expose shared `tagTypes`.

Recommended first version if auth remains bearer-token based temporarily:

```ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "https://api.adaptiveelearning.online",
  prepareHeaders: (headers, { getState }) => {
    headers.set("Accept", "application/json");

    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set("Authorization", `Bearer ${token}`);

    return headers;
  },
  credentials: "include",
});

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    if (result.error?.status === 401) {
      // Dispatch logout/session-expired handling here later.
    }

    return result;
  },
  tagTypes: [
    "Auth",
    "Organization",
    "User",
    "Classroom",
    "Course",
    "Chapter",
    "Lesson",
    "LessonResource",
    "Test",
    "Question",
    "Attempt",
    "Progress",
    "Analytics",
    "AdaptiveSession",
    "Subscription",
    "Parent",
    "Certificate",
  ],
  endpoints: () => ({}),
});
```

Long-term auth target:

- Prefer HttpOnly cookies from the backend.
- Then `prepareHeaders` may not need an access token at all.
- `credentials: "include"` remains.

## API Slice Pattern

Use endpoint injection off `baseApi`, not many unrelated `createApi` instances.

Example:

```ts
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrganizationUsers: builder.query<UserResponse[], void>({
      query: () => "/api/v1/users/organization",
      providesTags: (result) =>
        result
          ? [
              ...result.map((user) => ({ type: "User" as const, id: user.id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),
    createUser: builder.mutation<UserResponse, CreateUserRequest>({
      query: (body) => ({
        url: "/api/v1/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
  }),
});
```

## Tag Strategy

Use entity list tags consistently:

- List query provides `{ type: "User", id: "LIST" }`.
- Detail query provides `{ type: "User", id }`.
- Create invalidates list.
- Update invalidates detail and list when list presentation may change.
- Delete invalidates detail and list.

Recommended tags:

- `Organization`
- `User`
- `Classroom`
- `Course`
- `Chapter`
- `Lesson`
- `LessonResource`
- `Test`
- `Question`
- `Attempt`
- `Progress`
- `Analytics`
- `AdaptiveSession`
- `Subscription`
- `Certificate`

## What Moves Out Of Redux Slices

These should be migrated away from `createAsyncThunk` and into RTK Query:

- `store/slices/authSlice.ts`: login/register/password/logout requests
- `store/slices/usersSlice.ts`: all user CRUD
- `store/slices/classesSlice.ts`: classroom CRUD and classroom members
- `store/slices/coursesSlice.ts`: course CRUD and course details
- `store/slices/studentCoursesSlice.ts`: public/enrolled/enroll/unenroll
- `store/slices/adaptiveSlice.ts`: start/submit adaptive session
- `store/slices/customerSupportSlice.ts`: send support message
- `store/slices/testDraftSlice.ts`: generate/save test requests
- `store/slices/courseManagementSlice.ts`: classroom/student/course assignment requests

These may remain as normal slices:

- `authSlice`: current user/session info, post-login redirect intent, auth modal/form status if needed.
- `themeSlice` or `ThemeProvider`: visual preference only.
- `sidebarSlice`: collapsed/open state only if global.
- `courseEditorDraftSlice`: unsaved local editor tree if it cannot stay component-local.
- `testTakingSlice`: selected answers/timers for an active attempt if not persisted server-side until submit.

## Migration By API Slice

### 1. `authApi`

Endpoints:

- `login`
- `logout`
- `refresh`
- `register`
- `setPassword`
- `requestPasswordReset`
- `confirmPasswordReset`

State interaction:

- `login` mutation result should update `authSlice` through `onQueryStarted`.
- `logout` should clear `authSlice` and reset RTK Query cache with `api.util.resetApiState()`.

Important decision:

- If backend can set HttpOnly cookies, prefer that. If not, keep current bearer token temporarily but isolate token storage.

### 2. `usersApi`

Endpoints:

- `getUsers`
- `getOrganizationUsers`
- `getUserById`
- `createUser`
- `updateUser`
- `updateUserStatus`
- `deleteUser`
- `importUsers`
- `exportOrganizationUsers`

Replace:

- `store/slices/usersSlice.ts`
- component-level fetches in user/class modals

### 3. `classroomsApi`

Endpoints:

- `getClassrooms`
- `getClassroomById`
- `createClassroom`
- `patchClassroom`
- `deleteClassroom`
- `listClassroomMembers`
- `addClassroomMembers`
- `deleteClassroomMembers`
- `getClassroomCourses`
- `assignCourses`

Replace:

- `store/slices/classesSlice.ts`
- `lib/classes/api.ts`
- `components/class-management/AddStudentModal.tsx` direct fetches
- `app/dashboard/admin/classes/[classId]/page.tsx` direct fetches

### 4. `coursesApi`

Endpoints:

- `getMyCourses`
- `getPublicCourses`
- `getCourseFullView`
- `createCourse`
- `updateCourse`
- `patchCourse`
- `deleteCourse`

Replace:

- `store/slices/coursesSlice.ts`
- `lib/courses/api.ts`
- `lib/courses/editorApi.ts` course-level calls
- `lib/student-courses/api.ts` course public listing

### 5. `chaptersApi`, `lessonsApi`, `lessonResourcesApi`

Endpoints:

- course chapters
- chapter lessons
- lesson detail/content/metadata
- lesson resources

Replace:

- editor API helpers
- course content direct loading
- lesson page direct loading

### 6. `testsApi`, `questionsApi`, `attemptsApi`, `testResultsApi`

Endpoints:

- lesson test CRUD
- test publish/edit
- question CRUD
- attempt start/submit
- attempt results/history/best

Replace:

- `lib/tests/api.ts`
- `store/slices/testDraftSlice.ts`
- test builder calls
- student test pages

### 7. `adaptiveApi`

Endpoints:

- start session
- submit session

Replace:

- `lib/adaptive/api.ts`
- `store/slices/adaptiveSlice.ts` server calls

Keep local state only for:

- current UI-selected answer
- question navigation state if not derived from query response

### 8. `supportApi`

Do not call the AI service directly from `fetchBaseQuery`.

Frontend endpoint:

- `POST /api/support-chat`

Server route handler:

- reads `AI_API_KEY`
- sends request to `https://ai.adaptiveelearning.online/ai/api/v1/chat/customer-support`
- validates input and session context

Replace:

- `lib/customer-support/api.ts`
- async thunk in `customerSupportSlice`

## Store Shape After Migration

```ts
export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    ui: uiReducer,
    courseEditorDraft: courseEditorDraftReducer,
    adaptiveSession: adaptiveSessionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});
```

Most current domain slices should disappear when their screens use RTK Query hooks.

## Error Model

Create a shared error type:

```ts
export type ApiError = {
  status: number | "FETCH_ERROR" | "PARSING_ERROR" | "CUSTOM_ERROR";
  message: string;
  details?: unknown;
};
```

Create helpers:

- `getApiErrorMessage(error)`
- `isApiError(error)`
- `mapFetchBaseQueryError(error)`

UI should not parse raw backend error shapes repeatedly.

## Loading Model

Use RTK Query flags:

- `isLoading`: initial load
- `isFetching`: background refresh
- `isUninitialized`: query skipped
- `isError`
- `error`

Avoid duplicating `loading`, `creating`, `deleting`, `error` for server calls in slices.

## Caching Model

Examples:

- User list invalidates after create/update/status/delete.
- Classroom members invalidates after add/remove.
- Course full view invalidates after course/chapter/lesson/resource mutations.
- Test questions invalidates after question create/update/delete or AI injection.
- Student enrolled courses invalidates after enroll/unenroll.
- Progress invalidates after attempt submit.

## Compatibility Strategy

During migration, old helpers can coexist with RTK Query, but each migration PR/step should remove the old helper for that domain.

Temporary bridge rule:

- Do not add new `createAsyncThunk` for backend calls.
- Do not add new raw `fetch` calls in components.
- New backend calls must go through RTK Query or a server route handler.

## Done Criteria For API/State Rewrite

- No hardcoded `https://api.adaptiveelearning.online` outside config/test files.
- No `fetchWithAuth` usage.
- No backend `fetch` calls inside React components.
- No domain server data slices where RTK Query owns the data.
- `store/index.ts` has one `baseApi` reducer and middleware.
- Mutations invalidate the correct query cache.
- `npm run lint` is green or has documented temporary exceptions.
- `npx tsc --noEmit` remains green.
