# Product And Domain Map

## Source Of Truth

Swagger file reviewed: `swagger.json`

OpenAPI summary:

- OpenAPI version: `3.0.1`
- API server: `https://api.adaptiveelearning.online`
- Path count: `78`
- Major tags: Authentication, Organizations, Users, Classrooms, Courses, Chapters, Lessons, Tests, Questions, Attempts, Test Results, Progress, Analytics & Stats, Adaptive Sessions, AI Questions, Lesson Resources, Certificates, Parents, Failure Rate.

## Roles

### Organization Admin

Primary intent:

- Owns organization setup and ongoing administration.
- Creates and manages users.
- Creates/manages classrooms.
- Assigns teachers/students/courses.
- Manages subscription plan and organization details.

Important API domains:

- Authentication
- Organizations
- Users
- Classrooms
- Courses
- Course Enrollment, where admin views/assigns course availability
- Subscription endpoints under Organizations

Current UI areas:

- `app/dashboard/admin/page.tsx`
- `app/dashboard/admin/users/page.tsx`
- `app/dashboard/admin/classes/page.tsx`
- `app/dashboard/admin/classes/[classId]/page.tsx`
- `app/dashboard/admin/courses/page.tsx`
- `app/dashboard/admin/settings/page.tsx`
- `app/dashboard/admin/profile/page.tsx`

Rewrite note:

Admin pages are a strong first migration target because they currently duplicate API calls and token handling in Redux slices, components, and page files.

### Teacher

Primary intent:

- Builds course content.
- Manages chapters, lessons, resources, and tests.
- Generates or injects AI questions.
- Views class/student progress and analytics.
- Assigns courses to classrooms.

Important API domains:

- Courses
- Chapters
- Lessons
- Lesson Resources
- Tests
- Questions
- AI Questions
- Analytics & Stats
- Failure Rate
- Classrooms
- Progress

Current UI areas:

- `app/dashboard/teacher/page.tsx`
- `app/dashboard/teacher/courses/new/page.tsx`
- `app/dashboard/teacher/courses/[courseId]/edit/page.tsx`
- `app/dashboard/teacher/courses/[courseId]/page.tsx`
- `app/dashboard/teacher/courses/[courseId]/test-builder/page.tsx`
- `app/dashboard/teacher/students/page.tsx`
- `app/dashboard/teacher/tests/page.tsx`

Rewrite note:

The course editor is likely the hardest feature because it mixes nested editable state with remote persistence. It should be migrated after RTK Query foundations are proven on simpler admin pages.

### Student

Primary intent:

- Discovers public courses.
- Enrolls in courses.
- Reads lessons and resources.
- Takes tests and sees attempts/results.
- Runs adaptive learning sessions.
- Tracks progress/completion/certificates.

Important API domains:

- Courses
- Course Enrollment
- Lessons
- Lesson Resources
- Tests
- Attempts
- Test Results
- Progress
- Adaptive Sessions
- Certificates
- Analytics & Stats

Current UI areas:

- `app/dashboard/student/page.tsx`
- `app/dashboard/student/courses/[courseId]/page.tsx`
- `app/dashboard/student/courses/[courseId]/lessons/[lessonId]/page.tsx`
- `app/dashboard/student/adaptive/page.tsx`
- `app/dashboard/student/adaptive/test/page.tsx`
- `app/dashboard/student/adaptive/results/page.tsx`
- `app/dashboard/student/progress/page.tsx`
- `app/dashboard/student/tests/page.tsx`
- `app/dashboard/student/profile/page.tsx`

Rewrite note:

Student course and adaptive flows should become mostly RTK Query reads/mutations plus small UI state slices for current answers/session UI.

### Support And AI

Primary intent:

- Support chat assists platform users.
- AI question generation helps build tests.

Important API domains:

- Customer support AI endpoint currently outside main Swagger server.
- AI Questions endpoints in Swagger.

Rewrite note:

Support chat must not call the AI service directly from the browser with a public key. It should call a Next route handler such as `app/api/support-chat/route.ts`, which owns the secret server-side.

## Domain Boundaries For The Rewrite

Recommended top-level domains:

- `auth`
- `organizations`
- `users`
- `classrooms`
- `courses`
- `chapters`
- `lessons`
- `lessonResources`
- `tests`
- `questions`
- `attempts`
- `testResults`
- `progress`
- `analytics`
- `adaptive`
- `subscriptions`
- `parents`
- `certificates`
- `support`

## API Ownership Map

### Authentication

Endpoints:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/set-password`
- `POST /api/v1/auth/password-reset/request`
- `POST /api/v1/auth/password-reset/confirm`

RTK Query slice:

- `authApi`

Local slice:

- `authSlice` may remain for session/user identity only, but async server calls should move out.

### Admin Setup

Endpoints:

- `GET/POST /api/v1/organizations`
- `GET/PUT/DELETE /api/v1/organizations/{id}`
- `GET /api/v1/users`
- `GET /api/v1/users/organization`
- `POST /api/v1/users`
- `PUT/DELETE /api/v1/users/{id}`
- `PATCH /api/v1/users/{id}/status`
- `POST /api/v1/users/import`
- `GET /api/v1/classrooms`
- `POST /api/v1/classrooms`
- `GET/PATCH/DELETE /api/v1/classrooms/{id}`
- `GET/POST/DELETE /api/v1/classrooms/{classroomId}/members`

RTK Query slices:

- `organizationsApi`
- `usersApi`
- `classroomsApi`

### Course Authoring

Endpoints:

- `GET/POST /api/v1/courses/my-courses`
- `POST /api/v1/courses`
- `GET /api/v1/courses/{courseId}/full-view`
- `PUT/PATCH/DELETE /api/v1/courses/{id}`
- `GET/POST /api/v1/courses/{courseId}/chapters`
- `PATCH/DELETE /api/v1/chapters/{id}`
- `GET/POST /api/v1/chapters/{chapterID}/lessons`
- `GET/DELETE /api/v1/lessons/{id}`
- `GET/PATCH /api/v1/lessons/{id}/content`
- `PATCH /api/v1/lessons/{id}/metadata`
- `GET/POST /api/v1/lessons/{lessonId}/resources`
- `PATCH/DELETE /api/v1/lessons/{lessonId}/resources/{resourceId}`

RTK Query slices:

- `coursesApi`
- `chaptersApi`
- `lessonsApi`
- `lessonResourcesApi`

### Testing And Learning

Endpoints:

- `GET/POST /api/v1/lessons/{lessonId}/test`
- `GET/PATCH/DELETE /api/v1/tests/{testId}`
- `PATCH /api/v1/tests/{testId}/publish`
- `GET /api/v1/tests/{testId}/questions`
- `POST /api/v1/tests/{testId}/start`
- `POST /api/v1/attempts/{attemptId}/submit`
- `GET /api/v1/attempts/{attemptId}/result`
- `GET /api/v1/tests/{testId}/my-attempts`
- `GET /api/v1/tests/{testId}/my-best`
- `/api/tests/{testId}/questions` legacy-looking question endpoints

RTK Query slices:

- `testsApi`
- `questionsApi`
- `attemptsApi`
- `testResultsApi`

### Student Enrollment And Progress

Endpoints:

- `GET /api/v1/courses/public`
- `GET /api/v1/students/me/courses`
- `POST /api/v1/courses/{courseId}/enroll`
- `DELETE /api/v1/courses/{courseId}/unenroll`
- `GET /api/v1/courses/{courseId}/my-progress`
- `GET /api/v1/courses/{courseId}/students-progress`
- `GET /api/v1/students/{studentId}/courses-progress`
- `GET /api/v1/students/me/completed-courses`
- `GET /api/v1/enrollments/{enrollmentId}/certificat`

RTK Query slices:

- `enrollmentApi`
- `progressApi`
- `certificatesApi`

### Analytics And Adaptive

Endpoints:

- `POST /api/v1/adaptive/start`
- `POST /api/v1/adaptive/sessions/{sessionId}/submit`
- `GET /api/v1/courses/{courseId}/analytics/student-averages`
- `GET /api/v1/students/me/courses/{courseId}/stats`
- `GET /api/v1/students/me/tests/{testId}/stats`
- `GET /api/v1/tests/{testId}/analytics/class-average`
- `GET /api/v1/courses/{courseId}/analytics/chart-data`
- `GET /api/v1/lessons/{lessonId}/analytics/failure-rate`
- `GET /api/v1/tests/{testId}/analytics/failure-rate`
- `GET /api/v1/professors/me/alerts`

RTK Query slices:

- `adaptiveApi`
- `analyticsApi`
- `failureRateApi`

## Non-Functional Intent

The rewritten app should feel like:

- A practical school/organization operations tool for admins.
- A dense but usable content-building tool for teachers.
- A simple guided learning space for students.

That means the rewrite should prioritize reliability and clarity over visual novelty.
