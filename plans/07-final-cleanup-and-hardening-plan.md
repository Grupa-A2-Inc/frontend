# Final Cleanup And Hardening Plan

Date: 2026-05-15

## Current State

The major API/state rewrite is now in place. Backend communication is centralized through RTK Query slices or a server route handler, the legacy feature fetch helpers are gone, `fetchWithAuth` is gone, and the repo currently passes:

```bash
npm run lint
npm run typecheck
```

The remaining work is no longer about replacing the core architecture. It is about proving the rewritten app in runtime flows, reducing the largest UI modules, and making the repository easy to maintain.

## Remaining Cleanup Goals

1. Runtime smoke test the app.
   - Start the Next dev server.
   - Visit the main login/register/password routes.
   - Visit representative admin, teacher, and student dashboard routes.
   - Confirm the app shell, fonts, theme, Redux provider, and session bootstrap still behave after the layout/provider split.

2. Validate role workflows against the backend.
   - Admin: organization profile, users, classes, courses, subscriptions.
   - Teacher: course editor, content tree, test builder, analytics pages.
   - Student: course discovery/enrollment, lessons, tests, adaptive session, progress.
   - Record any backend contract mismatches as bugs instead of patching around them blindly.

3. Split the remaining large UI modules.
   - `components/layout/SidebarWrapper.tsx`: separate navigation data, desktop shell, mobile shell, account menu, and logout action.
   - `components/subscriptions/SubscriptionSettingsSection.tsx`: separate current-plan summary, plan comparison, billing action state, and mutation feedback.
   - `components/course-editor/useCourseEditor.ts`: separate tree mapping, draft mutations, persistence calls, and selection state.

4. Finish repository hygiene.
   - Decide whether generated PWA worker files should stay tracked.
   - Consolidate or clearly document the sprint-specific Playwright suites.
   - Add a short testing section to the README that explains which script is authoritative.
   - Keep generated reports out of lint and git churn.

5. Harden auth and secrets.
   - Document required env vars, especially `NEXT_PUBLIC_API_BASE_URL` and `AI_API_KEY`.
   - Confirm whether the backend can support HttpOnly cookie auth.
   - If yes, replace JS-readable token persistence with server-managed session cookies.
   - Confirm no public env var is used for secrets.

6. Improve type reproducibility.
   - Decide whether `types/api/generated.ts` stays hand-curated or gets generated from `swagger.json`.
   - If generated, add a repeatable command and document any normalization/mapping layer.
   - Keep domain types separate from DTOs.

7. UX/copy consistency pass.
   - Normalize mixed English/Romanian copy intentionally.
   - Replace raw `<img>` usage where `next/image` is appropriate.
   - Check accessibility on forms, modals, icon buttons, and loading/error states.

## Recommended Next Slices

### Slice 1: Runtime Smoke And README

- Run the app locally.
- Smoke test the main routes.
- Add/refresh README sections for setup, env vars, scripts, and architecture.
- Update this plan with any runtime defects found.

### Slice 2: Sidebar Decomposition

- Split `SidebarWrapper` without changing visual behavior.
- Keep navigation configuration typed and easy to scan.
- Verify role-specific nav still renders correctly.

### Slice 3: Course Editor Hook Decomposition

- Split `useCourseEditor` into focused helpers/hooks.
- Preserve the current local draft model.
- Add lightweight unit-style tests if the project test setup is ready; otherwise document manual checks.

### Slice 4: Test Suite Consolidation

- Decide the canonical Playwright config.
- Move legacy sprint suites behind explicit scripts or archive docs.
- Make one command suitable for CI.

### Slice 5: Final Hardening Report

- Re-run `npm run lint`, `npm run typecheck`, and selected E2E tests.
- Run a hardcoded URL/secret scan.
- Update `CODEBASE_CLEANLINESS_REVIEW.md` or create a final review showing what was fixed and what remains.
