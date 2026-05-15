# Implementation Log

## Phase 1: Architecture Foundation

Date: 2026-05-13

Status: completed

Changes made:

- Added centralized runtime config in `lib/config.ts`.
- Added shared API error helpers in `lib/api/errors.ts`.
- Added RTK Query base API in `store/api/baseApi.ts`.
- Wired `baseApi.reducer` and `baseApi.middleware` into `store/index.ts`.
- Added a root `types/` baseline:
  - API primitives, pagination, errors, and hand-curated Swagger DTOs.
  - Domain aliases for auth, users, organizations, classrooms, courses, lessons, adaptive, subscriptions, and support.
  - UI helper types for navigation and forms.

Notes:

- No feature screens were migrated in this phase.
- Existing Redux slices remain in place.
- The new base API uses the current bearer-token state as a temporary compatibility bridge.
- Later auth cleanup should replace JS-readable token handling with the Phase 2 design.

Verification:

```bash
npx tsc --noEmit
npx eslint lib/config.ts lib/api/errors.ts store/api/baseApi.ts types/api/common.ts types/api/errors.ts types/api/pagination.ts types/api/generated.ts types/domain/auth.ts types/domain/users.ts types/domain/organizations.ts types/domain/classrooms.ts types/domain/courses.ts types/domain/lessons.ts types/domain/adaptive.ts types/domain/subscriptions.ts types/domain/support.ts types/ui/navigation.ts types/ui/forms.ts
```

Results:

- TypeScript passed.
- Targeted ESLint for new Phase 1 files passed.

## Phase 2: Auth And Session Cleanup

Date: 2026-05-13

Status: completed

Changes made:

- Added `store/api/authApi.ts` with RTK Query mutations for:
  - login
  - register
  - logout
  - set password
  - request password reset
  - confirm password reset
- Reworked `store/slices/authSlice.ts` so it only owns session identity:
  - `setSession`
  - `clearSession`
- Added session helpers in `lib/auth/session.ts`:
  - normalize auth responses
  - persist current compatibility session
  - hydrate from storage
  - clear session storage/cookies
- Added role helpers in `lib/auth/roles.ts`.
- Updated auth pages to use RTK Query mutations:
  - `app/login/page.tsx`
  - `app/register/page.tsx`
  - `app/set-password/page.tsx`
  - `app/forgot-password/page.tsx`
  - `app/reset-password/page.tsx`
- Updated session bootstrap and logout surfaces:
  - `app/AutoLogin.tsx`
  - `components/layout/SidebarWrapper.tsx`
  - `app/dev-login/page.tsx`
- Cleaned `proxy.ts`:
  - removed dead test constants
  - added `/login` to the matcher
  - restored missing-token redirect for protected dashboard routes
  - restored basic role redirects/guards
- Guarded dev login so it is only usable in development.

Notes:

- This phase keeps the existing localStorage/cookie compatibility path temporarily.
- The long-term target remains HttpOnly-cookie auth if the backend supports it.
- `fetchWithAuth` still exists for unmigrated feature APIs and will be removed in later phases.

Verification:

```bash
npx tsc --noEmit
npx eslint store/api/authApi.ts store/slices/authSlice.ts lib/auth/session.ts lib/auth/roles.ts app/AutoLogin.tsx app/login/page.tsx app/register/page.tsx app/set-password/page.tsx app/forgot-password/page.tsx app/reset-password/page.tsx app/dev-login/page.tsx components/layout/SidebarWrapper.tsx proxy.ts
```

Results:

- TypeScript passed.
- Targeted ESLint for Phase 2 files passed.

## Phase 3: Admin Users, Classes, And Organization Dashboard Migration

Date: 2026-05-13

Status: completed

Changes made:

- Added RTK Query feature APIs:
  - `store/api/usersApi.ts`
  - `store/api/classroomsApi.ts`
  - `store/api/organizationsApi.ts`
- Migrated admin user management to RTK Query:
  - user list
  - create/update/delete
  - status updates
  - classroom selector data
- Migrated admin classroom flows to RTK Query:
  - classroom list/create/update/delete
  - classroom detail loading
  - member list/add/remove
- Migrated admin dashboard organization data to RTK Query:
  - organization profile loading
  - organization update form
  - derived dashboard stats from users and classrooms
- Moved classroom/admin dashboard UI types into `types/domain/*`.
- Removed duplicated Redux state and dead API helpers:
  - `store/slices/usersSlice.ts`
  - `store/slices/classesSlice.ts`
  - `lib/classes/api.ts`
  - `lib/classes/types.ts`
  - `lib/admin-dashboard/*`
- Removed `users` and `classes` reducers from `store/index.ts`.
- Updated the admin courses teacher dropdown to use the new users RTK Query cache.

Notes:

- Course CRUD still uses the legacy `coursesSlice`; only the teacher list dependency was moved in this phase.
- Dashboard course totals are still `0` until courses move to RTK Query and can feed the dashboard cleanly.
- `fetchWithAuth` and other legacy feature APIs remain for later phases.

Verification:

```bash
npx tsc --noEmit
npm run lint -- components/user-management/UsersPage.tsx components/user-management/UserFormModal.tsx components/user-management/UsersClassSelector.tsx app/dashboard/admin/classes/page.tsx app/dashboard/admin/classes/[classId]/page.tsx components/class-management/AddStudentModal.tsx components/class-management/EditInfoPanel.tsx components/class-management/ClassStatsGrid.tsx components/class-management/StudentList.tsx components/class-management/ConfirmRemoveModal.tsx components/admin-dashboard/AdminDashboardPage.tsx components/admin-dashboard/OrganizationInlineEditForm.tsx components/admin-dashboard/OrganizationSummaryCard.tsx components/admin-dashboard/AdminKpiGrid.tsx app/dashboard/admin/courses/page.tsx store/api/usersApi.ts store/api/classroomsApi.ts store/api/organizationsApi.ts store/index.ts types/domain/users.ts types/domain/classrooms.ts types/domain/organizations.ts
```

Results:

- TypeScript passed.
- Targeted ESLint for Phase 3 files passed.

## Phase 4: Course And Content Migration

Date: 2026-05-13

Status: completed

Changes made:

- Added RTK Query course/content APIs:
  - `store/api/coursesApi.ts`
  - `store/api/lessonsApi.ts`
- Expanded Swagger/domain course types in:
  - `types/api/generated.ts`
  - `types/domain/courses.ts`
- Migrated course list and CRUD surfaces to RTK Query:
  - admin course list/create/delete
  - teacher course list/delete
  - student public/enrolled course lists
- Migrated course full-view surfaces to RTK Query:
  - student course overview
  - student lesson view
  - teacher course management header
  - teacher course content tree
- Migrated teacher course assignment and students-by-class data:
  - classroom assignment uses `classroomsApi`
  - students-by-class uses a composed RTK Query read from classrooms, progress, and student averages
- Removed duplicated Redux state and old student course helpers:
  - `store/slices/coursesSlice.ts`
  - `store/slices/studentCoursesSlice.ts`
  - `store/slices/courseManagementSlice.ts`
  - `lib/student-courses/*`
- Removed `courses`, `studentCourses`, and `courseManagement` reducers from `store/index.ts`.
- Dashboard course totals now derive from `coursesApi` instead of staying at `0`.

Notes:

- The deep course editor was intentionally deferred from this phase, then completed in the follow-up course editor migration below.
- `lib/courses/api.ts` still exists only because the test settings panel imports it; that should move during the tests/questions phase.
- Remaining `fetchWithAuth` usage is now outside the migrated course list/detail/student-course surfaces.

Verification:

```bash
npx tsc --noEmit
npm run lint -- store/api/coursesApi.ts store/api/lessonsApi.ts store/api/classroomsApi.ts store/api/organizationsApi.ts types/api/generated.ts types/domain/courses.ts app/dashboard/admin/courses/page.tsx app/dashboard/teacher/page.tsx app/dashboard/teacher/courses/[courseId]/page.tsx app/dashboard/student/courses/[courseId]/page.tsx app/dashboard/student/courses/[courseId]/lessons/[lessonId]/page.tsx components/student-courses/StudentCoursesPage.tsx components/student-courses/CoursesGrid.tsx components/student-courses/CourseCard.tsx components/student-courses/PaginationControls.tsx components/student-courses/Tabs.tsx components/course-management/AssignmentControls.tsx components/course-management/StudentsByClass.tsx components/course-management/CourseHeader.tsx components/course-management/ContentTree.tsx components/course-content/LessonSidebar.tsx components/course-content/LessonResources.tsx components/teacher-courses/TeacherCoursesPage.tsx components/teacher-courses/CoursesList.tsx components/teacher-courses/CoursesRow.tsx store/index.ts
```

Results:

- TypeScript passed.
- Targeted ESLint for Phase 4 files passed.

## Course Editor Deep Migration

Date: 2026-05-15

Status: completed

Changes made:

- Added course editor mutation APIs:
  - `store/api/chaptersApi.ts`
  - `store/api/lessonResourcesApi.ts`
- Extended `store/api/lessonsApi.ts` with lesson create/update/delete mutations.
- Extended generated DTO coverage for:
  - chapter responses/posts
  - lesson create/metadata payloads
  - lesson resource create/update payloads
  - full course category/createdBy fields
- Migrated `components/course-editor/useCourseEditor.ts` off `lib/courses/editorApi.ts`.
- Kept the editor draft tree as local hook state:
  - course metadata form state remains local
  - unsaved chapters/lessons remain local until save
  - RTK Query owns only server reads/mutations
- Removed `lib/courses/editorApi.ts`.

Notes:

- File/video resource persistence is still limited by the existing editor UI behavior; the API slice exists, but the current editor flow mostly creates text lessons.
- Reordering still updates local draft order only unless the user saves nodes with metadata changes. A dedicated ordering pass can tighten this later.
- `lib/courses/api.ts` remains for the test settings panel and should move in the tests/questions phase.

Verification:

```bash
npx next typegen
npx tsc --noEmit
npm run lint -- components/course-editor/useCourseEditor.ts components/course-editor/CourseEditor.tsx store/api/chaptersApi.ts store/api/lessonsApi.ts store/api/lessonResourcesApi.ts store/api/coursesApi.ts types/api/generated.ts types/domain/courses.ts app/dashboard/teacher/courses/new/page.tsx app/dashboard/teacher/courses/[courseId]/edit/page.tsx
```

Results:

- Next route types regenerated.
- TypeScript passed.
- Targeted ESLint for course editor migration files passed.

## Phase 5: Tests, Questions, Attempts

Date: 2026-05-15

Status: completed

Changes made:

- Added RTK Query feature APIs:
  - `store/api/testsApi.ts`
  - `store/api/questionsApi.ts`
  - `store/api/attemptsApi.ts`
  - `store/api/testResultsApi.ts`
- Expanded generated/domain test types in:
  - `types/api/generated.ts`
  - `types/domain/tests.ts`
- Migrated the teacher test builder to RTK Query:
  - local draft state owns unsaved question edits
  - tests/questions APIs own server reads and mutations
  - teachers can create lesson tests, save questions, delete questions, generate AI questions, and publish tests
- Replaced the placeholder tests pages:
  - student tests page now lists lesson tests from enrolled course full views
  - teacher tests page now lists lesson tests from teacher course full views
  - student attempt page can start an attempt and submit answers
  - student result page can load an attempt result
- Removed duplicated Redux/mock/raw-fetch code:
  - `store/slices/testDraftSlice.ts`
  - `lib/tests/api.ts`
  - `lib/tests/types.ts`
  - `lib/courses/api.ts`
  - `lib/courses/mappers.ts`
  - `lib/courses/types.ts`
- Tightened course full-view cache tags so lesson-level test changes can invalidate composed test lists.
- Removed stale `.next/dev/types/**/*.ts` from `tsconfig.json` includes; `npx next typegen` writes the route types used by typecheck.

Notes:

- Swagger exposes teacher question CRUD at `/api/tests/{testId}/questions` and student/read-only questions at `/api/v1/tests/{testId}/questions`; the new slices keep that split explicit.
- There is no dedicated "all tests for me" endpoint in Swagger, so top-level teacher/student test lists are composed from course full-view data where lesson `testId` is present.
- AI generation may return a pending request; the UI reports that state instead of pretending generated questions are immediately available.
- Attempt result details currently show option ids because the attempt report DTO does not return option text.

Verification:

```bash
npx next typegen
npx tsc --noEmit
npm run lint -- app/dashboard/student/tests/page.tsx app/dashboard/student/test-attempt/page.tsx app/dashboard/student/test-result/page.tsx app/dashboard/teacher/tests/page.tsx app/dashboard/teacher/courses/[courseId]/test-builder/page.tsx components/tests/TestSettingsPanel.tsx components/tests/QuestionCard.tsx components/tests/QuestionNavigator.tsx store/api/testsApi.ts store/api/questionsApi.ts store/api/attemptsApi.ts store/api/testResultsApi.ts store/api/coursesApi.ts types/api/generated.ts types/domain/tests.ts store/index.ts
```

Results:

- Next route types regenerated.
- TypeScript passed.
- Targeted ESLint for Phase 5 files passed.

## Phase 6: Adaptive, Analytics, And Progress

Date: 2026-05-15

Status: completed

Changes made:

- Added RTK Query feature APIs:
  - `store/api/adaptiveApi.ts`
  - `store/api/progressApi.ts`
  - `store/api/analyticsApi.ts`
  - `store/api/failureRateApi.ts`
- Expanded generated/domain DTO coverage for:
  - adaptive exercises/results
  - personal course progress
  - student averages
  - personal course/test analytics
  - failure-rate chart/alert data
- Migrated adaptive session server calls to RTK Query:
  - start session mutation
  - submit session mutation
  - adaptive slice now keeps only cross-page UI/session state
- Migrated adaptive pages and components to centralized adaptive types:
  - picker page
  - test-taking page
  - results page
  - question card/navigator
- Replaced the student progress placeholder with a real RTK Query-backed progress dashboard.
- Removed the hardcoded adaptive API helper and duplicated adaptive types:
  - `lib/adaptive/api.ts`
  - `lib/adaptive/types.ts`

Notes:

- `progressApi.getMyProgressOverview` composes enrolled courses with `/api/v1/courses/{courseId}/my-progress` because there is no single progress-overview endpoint.
- Existing teacher course student analytics still flow through `coursesApi.getCourseStudentsByClass`; the dedicated `progressApi` and `analyticsApi` now exist for new/refined screens, but fully de-duplicating that composed query can be a later cleanup.
- `npx next typegen` re-added `.next/dev/types/**/*.ts` to `tsconfig.json`; typecheck is green with it now that the new test attempt/result pages use static routes.
- `lib/subscriptions/api.ts` still had a hardcoded API fallback at the end of Phase 6; this was resolved in the subscription cleanup pass below.

Verification:

```bash
npx next typegen
npx tsc --noEmit
npm run lint -- app/dashboard/student/adaptive/page.tsx app/dashboard/student/adaptive/test/page.tsx app/dashboard/student/adaptive/results/page.tsx app/dashboard/student/progress/page.tsx components/adaptive/AdaptiveQuestionCard.tsx components/adaptive/AdaptiveQuestionNavigator.tsx store/api/adaptiveApi.ts store/api/progressApi.ts store/api/analyticsApi.ts store/api/failureRateApi.ts store/slices/adaptiveSlice.ts types/api/generated.ts types/domain/adaptive.ts types/domain/progress.ts types/domain/analytics.ts store/index.ts
```

Results:

- Next route types regenerated.
- TypeScript passed.
- Targeted ESLint for Phase 6 files passed.

## Phase 7: Support Chat Server Proxy

Date: 2026-05-15

Status: completed

Changes made:

- Added `app/api/support-chat/route.ts` so support chat requests go through a server route.
- Moved the support AI key expectation to `AI_API_KEY`, keeping it out of public client env.
- Added `store/api/supportApi.ts` with an RTK Query mutation for support messages.
- Reduced `store/slices/customerSupportSlice.ts` to local chat UI state only.
- Updated `components/layout/CustomerSupportChat.tsx` to use the support mutation.
- Removed legacy customer support fetch/type files:
  - `lib/customer-support/api.ts`
  - `lib/customer-support/types.ts`

Notes:

- The support route validates input before forwarding.
- The app now has no `NEXT_PUBLIC_AI_API_KEY` usage and no checked-in AI key fallback.

Verification:

```bash
npx tsc --noEmit
npm run lint -- app/api/support-chat/route.ts store/api/supportApi.ts store/slices/customerSupportSlice.ts components/layout/CustomerSupportChat.tsx
```

Results:

- TypeScript passed.
- Targeted ESLint for support chat files passed.

## Subscription And Repository Hygiene Cleanup

Date: 2026-05-15

Status: completed

Changes made:

- Added `store/api/subscriptionsApi.ts`.
- Moved subscription DTO/domain coverage into:
  - `types/api/generated.ts`
  - `types/domain/subscriptions.ts`
- Migrated subscription UI to RTK Query:
  - `components/subscriptions/PlanSelector.tsx`
  - `components/subscriptions/PlanCard.tsx`
  - `components/subscriptions/SubscriptionSettingsSection.tsx`
  - `app/register/page.tsx`
- Removed legacy subscription fetch/type files:
  - `lib/subscriptions/api.ts`
  - `lib/subscriptions/types.ts`
- Removed the last shared `fetchWithAuth` dependency by moving `SESSION_EXPIRED_EVENT` into `lib/auth/events.ts`.
- Removed `@types/next` from package metadata.
- Added CI-friendly scripts:
  - `typegen`
  - `typecheck`
  - `test:e2e`
  - `test:e2e:ui`
  - `test:e2e:sprint2`
  - `test:e2e:sprint5`
- Updated ESLint ignores for generated PWA/test-report artifacts.

Notes:

- Subscription server state is now owned by RTK Query.
- `fetchWithAuth` has been deleted.
- Generated PWA worker files still need a final git policy decision; lint ignores them, but tracking/ignoring should be agreed explicitly.

Verification:

```bash
npm run typecheck
npm run lint
```

Results:

- Typecheck passed.
- Full ESLint passed.

## UI Shell And Warning Cleanup

Date: 2026-05-15

Status: completed

Changes made:

- Moved app providers into `app/Providers.tsx`.
- Restored `app/layout.tsx` to a server component.
- Replaced raw Google text-font links with `next/font/google`.
- Updated Tailwind font families to use the Next font CSS variables.
- Removed stale imports/unused props in:
  - `Sprint-2&3-Tests/specs/admin-classes.spec.ts`
  - `Sprint-2&3-Tests/specs/admin-users.spec.ts`
  - `components/course-editor/NodeEditorPanel.tsx`
  - `components/layout/Footer.tsx`
- Fixed earlier lint findings in:
  - `components/Constellation.tsx`
  - `components/ThemeProvider.tsx`
  - `store/StoreProvider.tsx`

Notes:

- Material Symbols still load as an icon font from CSS because Next's generated Google font typings do not expose that family in this installed version.
- The root layout no longer needs `"use client"` just to provide Redux/theme/session bootstrap.

Verification:

```bash
npm run lint
npm run typecheck
```

Results:

- Full ESLint passed with no warnings.
- Full typecheck passed.
