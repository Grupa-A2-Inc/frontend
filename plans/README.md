# Rewrite Planning Index

This folder is the control room for the frontend rewrite. The goal is not to change the product into something else; it is to preserve the current application intent while replacing the messy API/state plumbing with a cleaner, typed, maintainable architecture.

## Product Intent

This app is a multi-role adaptive e-learning platform:

- **Organization admins** manage organization profile, users, classes, courses, subscriptions, and assignment flows.
- **Teachers** create and manage courses, chapters, lessons, tests, AI-generated questions, student progress, and analytics.
- **Students** discover/enroll in courses, consume lessons, take tests, run adaptive sessions, view results/progress, and earn certificates.
- **Support/AI features** assist users and generate test content, but these must be server-mediated rather than exposing client-side secrets.

The rewrite must keep those flows recognizable. The priority is to clean communication, ownership, state, and types before redesigning UI.

## Documents

- [01 Product And Domain Map](./01-product-and-domain-map.md)
- [02 API And RTK Query Plan](./02-api-and-rtk-query-plan.md)
- [03 Type System Plan](./03-type-system-plan.md)
- [04 Migration Phases](./04-migration-phases.md)
- [05 Continuation Prompts](./05-continuation-prompts.md)
- [06 Implementation Log](./06-implementation-log.md)
- [07 Final Cleanup And Hardening Plan](./07-final-cleanup-and-hardening-plan.md)

## Rewrite Principles

1. **API communication becomes centralized.**
   All backend calls should move into RTK Query API slices or server route handlers. Hardcoded URLs and local `fetchWithAuth` clones should disappear.

2. **Server state and UI state are separated.**
   Backend data belongs in RTK Query cache. Local UI state belongs in React state, component hooks, or small UI slices. Long-lived auth/session state gets a dedicated design.

3. **Types are centralized and generated where possible.**
   Swagger/OpenAPI is the source of truth for DTOs. App-specific view models can live beside domain types but must be named clearly.

4. **Feature modules own screens, not duplicated infrastructure.**
   Feature folders should compose typed APIs, components, and hooks without redefining fetch logic.

5. **Security gets fixed early.**
   Remove public AI keys, avoid JS-readable auth tokens where possible, and make route protection intentional.

6. **Rewrite incrementally.**
   Do not replace the entire UI in one risky patch. Build the new architecture, migrate feature by feature, keep tests/typing/lint moving toward green.

## Recommended First Implementation Slice

The first actual code migration should be:

1. Add `types/` structure and generated/hand-curated OpenAPI DTO baseline.
2. Add `store/api/baseApi.ts` using RTK Query.
3. Add `store/api/authApi.ts` and replace auth thunks gradually.
4. Add `store/api/usersApi.ts` and `store/api/classroomsApi.ts`.
5. Update store configuration to include RTK Query middleware.
6. Migrate one admin page fully to prove the pattern.

This is the smallest meaningful vertical slice because admin user/class management currently shows the repeated fetch/token/slice problems very clearly.
