# Continuation Prompts

Use these prompts in future turns to continue the rewrite safely. They are written so the next session can pick up the exact phase without re-discovering the whole app.

## Prompt 1: Start The Architecture Foundation

```txt
Continue the rewrite from plans/. Start Phase 1 from plans/04-migration-phases.md.

Implement the RTK Query foundation only:
- create the root types/ folder baseline
- add store/api/baseApi.ts
- wire baseApi reducer and middleware into store/index.ts
- add basic API error helpers
- add centralized config for API base URL

Do not migrate feature screens yet. Keep the app compiling. Run npx tsc --noEmit at the end.
```

## Prompt 2: Migrate Auth

```txt
Continue the rewrite from plans/. Start Phase 2.

Migrate auth server calls from createAsyncThunk to RTK Query:
- add authApi
- keep authSlice only for current session identity
- update login/register/logout/password pages to use authApi mutations
- clean proxy.ts matcher/dead code carefully
- do not remove dev-login yet unless it is easy to guard to development-only

Run npx tsc --noEmit and report remaining lint blockers.
```

## Prompt 3: Migrate Users And Classrooms

```txt
Continue the rewrite from plans/. Start Phase 3.

Migrate admin users and classrooms to RTK Query:
- add usersApi
- add classroomsApi
- replace usersSlice/classesSlice usage in admin pages and class-management components
- remove direct fetch calls in those components
- keep UI behavior the same

Run npx tsc --noEmit. If the migration is too big, stop after usersApi and admin users page.
```

## Prompt 4: Migrate Courses

```txt
Continue the rewrite from plans/. Start Phase 4.

Migrate course list/detail APIs to RTK Query before touching the course editor:
- add coursesApi
- add chaptersApi only if required for full-view invalidation
- migrate student public/enrolled courses
- migrate teacher/admin course list pages
- remove duplicated course fetch helpers that are no longer used

Keep course editor migration for a later prompt unless this stays small.
```

## Prompt 5: Course Editor Deep Migration

```txt
Continue the rewrite from plans/. Work on the course editor migration.

Read components/course-editor/useCourseEditor.ts and related files.
Plan the local draft model first, then migrate remote calls to coursesApi/chaptersApi/lessonsApi/lessonResourcesApi.
Keep unsaved editor tree state separate from RTK Query server cache.

This is risky, so make the smallest safe vertical change and run typecheck.
```

## Prompt 6: Tests And Attempts

```txt
Continue the rewrite from plans/. Start Phase 5.

Migrate tests/questions/attempts:
- add testsApi
- add questionsApi
- add attemptsApi
- add testResultsApi
- replace lib/tests/api.ts and testDraftSlice server calls

Confirm whether /api/tests/{testId}/questions or /api/v1/tests/{testId}/questions is the current source of truth from swagger and existing usage.
```

## Prompt 7: Adaptive And Analytics

```txt
Continue the rewrite from plans/. Start Phase 6.

Migrate adaptive, progress, and analytics calls to RTK Query:
- adaptiveApi
- progressApi
- analyticsApi
- failureRateApi if currently used

Keep local answer/navigation UI state out of RTK Query unless it is server-backed.
```

## Prompt 8: Support Chat Security

```txt
Continue the rewrite from plans/. Start Phase 7.

Fix customer support chat security:
- add a Next route handler that calls the AI service server-side
- remove NEXT_PUBLIC_AI_API_KEY usage and the fallback string
- add supportApi client mutation
- replace customerSupportSlice async thunk
- keep chat UI behavior the same
```

## Prompt 9: Repository Hygiene

```txt
Continue the rewrite from plans/. Start Phase 9.

Clean repository/test hygiene:
- consolidate or document Playwright configs
- remove generated reports from git if appropriate
- decide PWA generated worker policy
- remove @types/next if safe
- add missing package scripts for typecheck/e2e

Do not alter app behavior unless needed for tooling.
```

## Prompt 10: Final Audit

```txt
Continue the rewrite from plans/. Perform a final audit against CODEBASE_CLEANLINESS_REVIEW.md and plans/04-migration-phases.md.

Check:
- no hardcoded API base URLs outside config/tests
- no raw backend fetches in components
- no fetchWithAuth usage
- no public AI key
- auth/session flow is intentional
- RTK Query owns server state
- types are centralized
- lint/typecheck status

Write a final migration report.
```

## Rule For Every Continuation

At the start of every future rewrite prompt:

1. Read `plans/README.md`.
2. Read the phase-specific plan.
3. Check `git status --short`.
4. Make the smallest coherent migration.
5. Run `npx tsc --noEmit`.
6. Update the relevant plan doc if reality differs from the plan.
