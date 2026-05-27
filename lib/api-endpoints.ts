// Centralized API endpoint paths.
// Import API_BASE from "@/lib/config" to build full URLs.
// Usage (path-only callers):   ENDPOINTS.auth.login
// Usage (full-URL callers):    `${API_BASE}${ENDPOINTS.auth.login}`

export const ENDPOINTS = {
  // 1. Authentication
  auth: {
    login: "/api/v1/auth/login",
    register: "/api/v1/auth/register",
    logout: "/api/v1/auth/logout",
    refresh: "/api/v1/auth/refresh",
    csrf: "/api/v1/auth/csrf",
    setPassword: "/api/v1/auth/set-password",
    passwordResetRequest: "/api/v1/auth/password-reset/request",
    passwordResetConfirm: "/api/v1/auth/password-reset/confirm",
    ping: "/api/v1/protected/ping",
  },

  // 2. Users
  users: {
    list: "/api/v1/users",
    create: "/api/v1/users",
    byId: (id: string) => `/api/v1/users/${id}`,
    status: (id: string) => `/api/v1/users/${id}/status`,
    changePassword: (id: string) => `/api/v1/users/${id}/change-password`,
    organization: "/api/v1/users/organization",
    organizationExport: "/api/v1/users/organization/export",
    import: "/api/v1/users/import",
    importCsv: "/api/v1/users/import/csv",
  },

  // 3. Organizations & Subscriptions
  organizations: {
    list: "/api/v1/organizations",
    create: "/api/v1/organizations",
    byId: (id: string) => `/api/v1/organizations/${id}`,
    subscription: (orgId: string) => `/api/v1/organizations/${orgId}/subscription`,
    subscriptionCheckout: (orgId: string) =>
      `/api/v1/organizations/${orgId}/subscription/checkout`,
  },
  subscriptionPlans: "/api/v1/subscription-plans",

  // 4. Courses
  courses: {
    public: "/api/v1/courses/public",
    myCourses: "/api/v1/courses/my-courses",
    create: "/api/v1/courses",
    byId: (id: string) => `/api/v1/courses/${id}`,
    fullView: (courseId: string) => `/api/v1/courses/${courseId}/full-view`,
    chapters: (courseId: string) => `/api/v1/courses/${courseId}/chapters`,
    enroll: (courseId: string) => `/api/v1/courses/${courseId}/enroll`,
    unenroll: (courseId: string) => `/api/v1/courses/${courseId}/unenroll`,
    studentsProgress: (courseId: string) =>
      `/api/v1/courses/${courseId}/students-progress`,
    analyticsStudentAverages: (courseId: string) =>
      `/api/v1/courses/${courseId}/analytics/student-averages`,
    analyticsChartData: (courseId: string) =>
      `/api/v1/courses/${courseId}/analytics/chart-data`,
    analyticsFailureRate: (courseId: string) =>
      `/api/v1/courses/${courseId}/analytics/failure-rate`,
    myProgress: (courseId: string) => `/api/v1/courses/${courseId}/my-progress`,
  },

  // 5. Students
  students: {
    myCourses: "/api/v1/students/me/courses",
    completedCourses: "/api/v1/students/me/completed-courses",
    myTestStats: (testId: string) => `/api/v1/students/me/tests/${testId}/stats`,
    myCourseStats: (courseId: string) =>
      `/api/v1/students/me/courses/${courseId}/stats`,
    coursesProgress: (studentId: string) =>
      `/api/v1/students/${studentId}/courses-progress`,
  },

  // 6. Enrollments & Certificates
  enrollments: {
    certificate: (enrollmentId: string) =>
      `/api/v1/enrollments/${enrollmentId}/certificat`,
  },

  // 7. Chapters
  chapters: {
    lessons: (chapterId: string) => `/api/v1/chapters/${chapterId}/lessons`,
    byId: (id: string) => `/api/v1/chapters/${id}`,
  },

  // 8. Lessons
  lessons: {
    byId: (id: string) => `/api/v1/lessons/${id}`,
    content: (id: string) => `/api/v1/lessons/${id}/content`,
    metadata: (id: string) => `/api/v1/lessons/${id}/metadata`,
    test: (lessonId: string) => `/api/v1/lessons/${lessonId}/test`,
    resources: (lessonId: string) => `/api/v1/lessons/${lessonId}/resources`,
    resourceById: (lessonId: string, resourceId: string) =>
      `/api/v1/lessons/${lessonId}/resources/${resourceId}`,
    ratings: (lessonId: string) => `/api/v1/lessons/${lessonId}/ratings`,
    ratingsSummary: (lessonId: string) =>
      `/api/v1/lessons/${lessonId}/ratings/summary`,
    analyticsFailureRate: (lessonId: string) =>
      `/api/v1/lessons/${lessonId}/analytics/failure-rate`,
    aiGenerateTest: (lessonId: string) =>
      `/api/v1/lessons/${lessonId}/ai/generate-test`,
  },

  // 9 & 10. Tests & Questions
  tests: {
    byId: (testId: string) => `/api/v1/tests/${testId}`,
    publish: (testId: string) => `/api/v1/tests/${testId}/publish`,
    start: (testId: string) => `/api/v1/tests/${testId}/start`,
    questions: (testId: string) => `/api/v1/tests/${testId}/questions`,
    questionById: (testId: string, questionId: number | string) =>
      `/api/v1/tests/${testId}/questions/${questionId}`,
    myBest: (testId: string) => `/api/v1/tests/${testId}/my-best`,
    myAttempts: (testId: string) => `/api/v1/tests/${testId}/my-attempts`,
    analyticsClassAverage: (testId: string) =>
      `/api/v1/tests/${testId}/analytics/class-average`,
    analyticsFailureRate: (testId: string) =>
      `/api/v1/tests/${testId}/analytics/failure-rate`,
    analyticsAlerts: (testId: string) =>
      `/api/v1/tests/${testId}/analytics/alerts`,
  },
  questions: {
    byTest: (testId: string) => `/api/tests/${testId}/questions`,
    byId: (testId: string, questionId: number | string) =>
      `/api/tests/${testId}/questions/${questionId}`,
  },

  // 11 & 12. Attempts
  attempts: {
    submit: (attemptId: string) => `/api/v1/attempts/${attemptId}/submit`,
    result: (attemptId: string) => `/api/v1/attempts/${attemptId}/result`,
  },

  // 13 & 14. Analytics / Alerts
  professors: {
    meAlerts: "/api/v1/professors/me/alerts",
    meLessonsRatings: "/api/v1/professors/me/lessons/ratings",
    errorReports: (professorId: string) =>
      `/api/v1/professors/${professorId}/error-reports`,
  },

  // 16. Classrooms
  classrooms: {
    list: "/api/v1/classrooms",
    me: "/api/v1/classrooms/me",
    byId: (id: string) => `/api/v1/classrooms/${id}`,
    members: (classroomId: string) => `/api/v1/classrooms/${classroomId}/members`,
    courses: (classroomId: string) => `/api/v1/classrooms/${classroomId}/courses`,
  },

  // 18. AI Requests (status / inject / curriculum — not generation itself)
  ai: {
    requestStatus: (requestId: string) =>
      `/api/v1/ai/requests/${requestId}/status`,
    injectQuestions: (requestId: string) =>
      `/api/v1/ai/request/${requestId}/inject`,
    curriculumCatalog: "/api/v1/ai/catalog/curriculum",
  },

  // 19. Error Reports
  errorReports: {
    resolve: (reportId: string) => `/api/v1/error-reports/${reportId}/resolve`,
    byQuestion: (questionId: string) =>
      `/api/v1/questions/${questionId}/error-reports`,
  },

  // 20. Adaptive Learning
  adaptive: {
    start: "/api/v1/adaptive/start",
    submitSession: (sessionId: string) =>
      `/api/v1/adaptive/sessions/${sessionId}/submit`,
  },

  // 21. Parents
  parents: {
    list: "/api/v1/parents",
    byId: (parentId: string) => `/api/v1/parents/${parentId}`,
    students: (parentId: string) => `/api/v1/parents/${parentId}/students`,
    assignStudent: (parentId: string, studentId: string) =>
      `/api/v1/parents/${parentId}/students/${studentId}`,
  },
} as const;
