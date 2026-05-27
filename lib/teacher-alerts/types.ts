export interface TeacherAlert {
  alertId: string;
  testId: string;
  professorId: string;
  failureThreshold: number;
  currentFailureRate: number;
  isActive: boolean;
}

export interface TeacherAlertTestContext {
  testId: string;
  courseId: string;
  courseTitle: string;
  lessonId: string;
  lessonTitle: string;
}

export interface TeacherAlertWithContext extends TeacherAlert {
  context?: TeacherAlertTestContext;
}
