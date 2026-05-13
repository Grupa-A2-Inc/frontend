# Migration Phases

This rewrite should happen in multiple prompts/turns. Each phase should leave the app in a runnable state.

## Phase 0: Baseline And Guardrails

Intent:

- Freeze the current understanding before rewriting.
- Make sure future changes are measurable.

Tasks:

- Keep `CODEBASE_CLEANLINESS_REVIEW.md` as the initial audit.
- Keep these `plans/*` docs as the rewrite control docs.
- Run and record:
  - `npm run lint`
  - `npx tsc --noEmit`
  - targeted Playwright suites only when relevant
- Decide whether generated PWA/test artifacts stay in git.

Done when:

- Plans exist.
- Current red/green baseline is known.
- No production behavior has changed.

## Phase 1: Architecture Foundation

Intent:

- Add new architecture without migrating every screen yet.

Tasks:

- Add `types/` folder baseline.
- Add `store/api/baseApi.ts`.
- Update `store/index.ts` to include RTK Query reducer and middleware.
- Add shared API error helpers.
- Add `lib/config.ts` or equivalent runtime config module.
- Add rule: no new raw backend `fetch` in components.

Risks:

- Store changes affect the whole app.
- Existing slices must continue to work during transition.

Verification:

- `npx tsc --noEmit`
- `npm run lint` may still fail from existing issues, but new files should be clean.

## Phase 2: Auth And Session Cleanup

Intent:

- Make authentication behavior intentional before migrating all protected data.

Tasks:

- Create `authApi`.
- Move login/register/password/logout requests from `authSlice` to `authApi`.
- Keep `authSlice` for current user/session identity only.
- Decide token strategy:
  - short-term: isolate bearer token storage
  - long-term: HttpOnly cookie auth if backend supports it
- Fix `proxy.ts` matcher and remove dead/commented logic.
- Restrict or remove `app/dev-login`.
- Add role guard helpers.

Risks:

- Login/logout affects every page.
- Proxy changes can block development if done too aggressively.

Verification:

- Manual login/logout for admin/teacher/student.
- Session expiration behavior.
- `npx tsc --noEmit`.

## Phase 3: Admin API Migration

Intent:

- Prove RTK Query pattern on high-value CRUD screens.

Tasks:

- Create `usersApi`.
- Create `organizationsApi`.
- Create `classroomsApi`.
- Replace:
  - `store/slices/usersSlice.ts`
  - `store/slices/classesSlice.ts`
  - direct fetches in class/user components
- Migrate admin users page.
- Migrate admin classes page.
- Migrate admin class detail page.
- Migrate admin dashboard organization summary.

Risks:

- Current admin courses page has naming mismatch with classes/courses.
- Some existing component state may rely on old loading/error fields.

Verification:

- Admin can view/create/update/delete users.
- Admin can view/create/update/delete classrooms.
- Admin can add/remove members.
- Cache invalidation works after mutations.

## Phase 4: Course And Content Migration

Intent:

- Move teacher and student course data to RTK Query.

Tasks:

- Create `coursesApi`.
- Create `chaptersApi`.
- Create `lessonsApi`.
- Create `lessonResourcesApi`.
- Migrate public courses and enrolled courses.
- Migrate teacher course lists.
- Migrate course detail/full view pages.
- Begin course editor migration.

Special handling:

- Course editor may need a local draft slice or hook for unsaved tree state.
- Backend mutations should invalidate full course view and affected lists.

Verification:

- Teacher can create/edit course metadata.
- Teacher can add/edit/delete chapters and lessons.
- Student can see course details and lessons.
- Course list caches update after create/delete.

## Phase 5: Tests, Questions, Attempts

Intent:

- Clean test builder and student attempt flow.

Tasks:

- Create `testsApi`.
- Create `questionsApi`.
- Create `attemptsApi`.
- Create `testResultsApi`.
- Replace `lib/tests/api.ts`.
- Replace `testDraftSlice` server calls.
- Migrate test builder page.
- Migrate student tests and result pages.

Risks:

- There are both `/api/v1/tests/...` and `/api/tests/...` question endpoints. Confirm which are current.
- Test taking may need local answer/timer state.

Verification:

- Teacher can create/edit/publish test.
- Teacher can manage questions.
- Student can start attempt, submit answers, and view result.

## Phase 6: Adaptive, Analytics, Progress

Intent:

- Clean data-heavy learning intelligence features.

Tasks:

- Create `adaptiveApi`.
- Create `analyticsApi`.
- Create `progressApi`.
- Create `failureRateApi`.
- Migrate adaptive pages.
- Migrate progress pages.
- Migrate dashboard KPI/stat calls.

Verification:

- Adaptive start/submit works.
- Student progress loads.
- Teacher/admin analytics load.

## Phase 7: Support Chat Server Proxy

Intent:

- Remove public AI key exposure.

Tasks:

- Add `app/api/support-chat/route.ts`.
- Store AI key in non-public env var.
- Create client `supportApi` that calls the Next route.
- Replace customer support thunk.
- Keep chat UI messages in either RTK Query mutation state plus local slice, or a small `supportChatSlice`.

Verification:

- Support chat works.
- No `NEXT_PUBLIC_AI_API_KEY`.
- No AI key fallback string.

## Phase 8: UI And Component Cleanup

Intent:

- Clean large components after data flow is stable.

Tasks:

- Split `SidebarWrapper`.
- Split `SubscriptionSettingsSection`.
- Split `useCourseEditor`.
- Remove old comments and dead code.
- Normalize English/Romanian UI copy.
- Fix accessibility warnings.
- Replace raw `<img>` with `next/image` where appropriate.

Verification:

- Lint warning count drops significantly.
- Manual route smoke test.

## Phase 9: Tests And Repository Hygiene

Intent:

- Make the repo clean to work in.

Tasks:

- Consolidate Playwright configs.
- Move legacy sprint tests or document them.
- Ignore/delete generated reports.
- Decide generated PWA worker policy.
- Remove `@types/next`.
- Add CI-friendly scripts:
  - `typecheck`
  - `lint`
  - `test:e2e`
  - `test:e2e:ui` if needed

Verification:

- `npm run lint` green.
- `npm run typecheck` green.
- Primary Playwright suite documented and runnable.

## Phase 10: Final Hardening

Intent:

- Make the rewritten app stable enough for delivery.

Tasks:

- Full route smoke testing.
- Validate role access.
- Validate cache invalidation after mutations.
- Confirm no hardcoded production API URLs outside config/tests.
- Confirm no public secrets.
- Confirm generated types are reproducible.
- Update README with architecture and dev workflow.

Done when:

- The app runs.
- Main role workflows work.
- API/state architecture is consistent.
- Cleanup report findings are either fixed or explicitly deferred.
