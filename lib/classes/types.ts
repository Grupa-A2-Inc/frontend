export interface ClassMember {
  userId: string;
  email: string;
  membershipType: "TEACHER" | "STUDENT";
}

export interface ClassDetails {
  id: string;
  organizationId?: string;
  name: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

// kept for backward compat — treat as ClassMember where possible
export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
}
