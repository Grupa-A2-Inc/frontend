export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface ClassDetails {
  id: string;
  name: string;
  description: string;
  subject: string;
  grade: string;
  year: string;
  teacherId: string;
  teacherName: string;
  students: Student[];
  studentCount: number;
  createdAt: string;
}