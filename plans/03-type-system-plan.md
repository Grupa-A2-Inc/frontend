# Type System Plan

## Goal

Create a root-level `types/` folder that makes the API and domain model easy to understand. The current scattered `lib/*/types.ts` files should be consolidated or re-exported in a controlled way.

## Target Folder

```txt
types/
  api/
    generated.ts
    openapi.ts
    pagination.ts
    errors.ts
  domain/
    auth.ts
    organizations.ts
    users.ts
    classrooms.ts
    courses.ts
    chapters.ts
    lessons.ts
    lessonResources.ts
    tests.ts
    questions.ts
    attempts.ts
    testResults.ts
    progress.ts
    analytics.ts
    adaptive.ts
    subscriptions.ts
    support.ts
  ui/
    navigation.ts
    forms.ts
    table.ts
```

## Generated API Types

Best long-term approach:

- Generate DTOs from `swagger.json` with `openapi-typescript`.
- Keep generated output in `types/api/generated.ts`.
- Do not manually edit generated files.

Possible command later:

```bash
npx openapi-typescript swagger.json -o types/api/generated.ts
```

This requires dependency/tooling discussion first. Until then, we can hand-curate the highest-priority DTOs from Swagger.

## Naming Convention

Use API names for raw DTOs:

- `LoginRequest`
- `AuthResponse`
- `UserResponse`
- `CreateUserRequest`
- `ClassroomResponse`
- `ResponseCourseDto`
- `ResponseCourseFullViewDto`

Use domain names for UI-ready models:

- `User`
- `Organization`
- `Classroom`
- `Course`
- `CourseFullView`
- `Lesson`
- `Test`
- `StudentProgress`

Use mappers only when the backend DTO does not match UI needs:

```txt
DTO from backend -> mapper -> domain model for UI
```

Do not use mappers just to rename one field unless it removes repeated UI complexity.

## Pagination Types

Swagger includes multiple page shapes:

- `PageResponseCourseDto`
- `PageEnrolledCourseDto`
- `PageStudentAverageDto`
- `PageStudentProgressDto`
- `PageGetErrorReportDto`

Create a generic helper:

```ts
export type Page<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};
```

Then map backend-specific page DTOs into `Page<T>` if needed.

## Domain Type Ownership

### Auth

File: `types/domain/auth.ts`

Owns:

- `UserRole`
- `UserStatus`
- `SessionUser`
- `AuthState`
- auth payloads if not generated

Important:

- The same `UserRole` should be used by proxy assumptions, sidebar navigation, role guards, and UI permissions.

### Users

File: `types/domain/users.ts`

Owns:

- `User`
- `CreateUserFormValues`
- `UpdateUserFormValues`
- `UserFilter`

API DTOs should be imported from generated API types, not redefined.

### Classrooms

File: `types/domain/classrooms.ts`

Owns:

- `Classroom`
- `ClassroomMember`
- `ClassroomCourse`
- `ClassroomFormValues`

### Courses

Files:

- `types/domain/courses.ts`
- `types/domain/chapters.ts`
- `types/domain/lessons.ts`
- `types/domain/lessonResources.ts`

Owns:

- course list cards
- full course tree
- editor tree models
- lesson content/resource models

Course editor note:

- Keep backend DTO types separate from editor draft types. The editor has temporary IDs, unsaved file state, and local ordering concerns that are not backend DTOs.

### Tests

Files:

- `types/domain/tests.ts`
- `types/domain/questions.ts`
- `types/domain/attempts.ts`
- `types/domain/testResults.ts`

Owns:

- test builder models
- question option models
- student attempt answer models
- result/report models

### Adaptive

File: `types/domain/adaptive.ts`

Owns:

- adaptive start request/result
- adaptive session questions
- adaptive submit payload/result

### Support

File: `types/domain/support.ts`

Owns:

- chat message
- support chat request
- support chat response

The support AI backend request should not expose API key details to client types.

## Migration Steps

1. Create `types/` folder and baseline files.
2. Move shared role/status/auth types first.
3. Move customer support types.
4. Move user/classroom/course list types.
5. Move course editor types carefully, avoiding behavior changes.
6. Generate or curate Swagger DTOs.
7. Replace imports from `lib/*/types.ts` with `types/domain/*`.
8. Delete old type files only when no imports remain.

## Rules For New Types

- No `any` in public domain types.
- Use `unknown` at boundaries if the backend shape is uncertain.
- Prefer discriminated unions for UI mode/state.
- Keep form values separate from API request types.
- Avoid circular imports between domain type files.
- Re-export from `types/domain/index.ts` only after the structure stabilizes.

## Done Criteria

- New code imports domain types from `@/types/domain/...`.
- API slices import DTOs from `@/types/api/...`.
- `lib/*/types.ts` files are either removed or converted to compatibility re-exports temporarily.
- Lint no longer reports `no-explicit-any` in migrated domains.
