import { CourseStatus, CourseVisibility } from "@/lib/courses/types";

export type Tab = "my" | "discover"; 

export interface StudentCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  status: CourseStatus;
  visibility: CourseVisibility;
  createdBy: string;
  enrollmentId?: string;
  enrolledAt?: string;
  progressPercent?: number;
  completedAt?: string;
}

export interface PaginatedCourses {
  content: StudentCourse[];
  totalPages: number;
  totalElements: number;
  numberOfElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export type CoursePaginationMeta = Omit<PaginatedCourses, "content">;
