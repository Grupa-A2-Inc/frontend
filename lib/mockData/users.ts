import { User, Organization } from "@/store/slices/authSlice";

export const mockOrganizations: Organization[] = [
  {
    id: "org-001",
    name: "Liceul Teoretic Nr. 1",
    type: "HIGH_SCHOOL",
    country: "Romania",
    city: "Bucuresti",
  },
];

export const mockUsers: (User & { password: string; organizationId: string })[] = [
  {
    id: "user-001",
    firstName: "Alexandru",
    lastName: "Ionescu",
    email: "admin@test.com",
    password: "admin123",
    role: "ADMIN",
    status: "ACTIVE",
    organizationId: "org-001",
    profilePicture: undefined,
  },
  {
    id: "user-002",
    firstName: "Maria",
    lastName: "Popescu",
    email: "teacher@test.com",
    password: "teacher123",
    role: "TEACHER",
    status: "ACTIVE",
    organizationId: "org-001",
    profilePicture: undefined,
  },
  {
    id: "user-003",
    firstName: "Andrei",
    lastName: "Constantin",
    email: "student@test.com",
    password: "student123",
    role: "STUDENT",
    status: "ACTIVE",
    organizationId: "org-001",
    profilePicture: undefined,
    classId: "class-001",
  },
];
