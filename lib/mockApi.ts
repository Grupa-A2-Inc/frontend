/**
 * mockApi.ts — the seam between the frontend and the data source.
 *
 * Right now every function simulates a network call using local mock data.
 * When the real backend is ready, replace the body of each function with
 * an actual fetch/axios call. The shape of what they return must stay the same.
 */

import { mockUsers, mockOrganizations } from "@/lib/mockData/users";
import type { User, Organization } from "@/store/slices/authSlice";

// ─── Shared response type ─────────────────────────────────────────────────────

export interface AuthResponse {
  user: User;
  organization: Organization;
  accessToken: string;
}

// ─── Request payloads ─────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterOrgPayload {
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
  organizationName: string;
  organizationType: string;
  country: string;
  city: string;
  address?: string;
  phoneNumber?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Simulates network latency. Remove when using a real API. */
const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

/** Strips internal mock-only fields before returning the user. */
function toPublicUser(raw: (typeof mockUsers)[number]): User {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...user } = raw;
  return user;
}

// ─── API functions ────────────────────────────────────────────────────────────

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  await delay();

  const found = mockUsers.find(
    (u) => u.email === payload.email && u.password === payload.password
  );

  if (!found) {
    throw new Error("Invalid email or password.");
  }

  const org = mockOrganizations.find((o) => o.id === found.organizationId);

  if (!org) {
    throw new Error("Organization not found.");
  }

  return {
    user: toPublicUser(found),
    organization: org,
    accessToken: "mock-access-token-" + found.id,
  };
}

export async function registerOrganization(
  payload: RegisterOrgPayload
): Promise<AuthResponse> {
  await delay(600);

  const emailTaken = mockUsers.some((u) => u.email === payload.adminEmail);
  if (emailTaken) {
    throw new Error("An account with this email already exists.");
  }

  // In production this object would come from the backend response.
  const newOrg: Organization = {
    id: "org-new-" + Date.now(),
    name: payload.organizationName,
    type: payload.organizationType,
    country: payload.country,
    city: payload.city,
  };

  const newUser: User = {
    id: "user-new-" + Date.now(),
    firstName: payload.adminFirstName,
    lastName: payload.adminLastName,
    email: payload.adminEmail,
    role: "ADMIN",
    status: "ACTIVE",
    organizationId: newOrg.id,
  };

  return {
    user: newUser,
    organization: newOrg,
    accessToken: "mock-access-token-" + newUser.id,
  };
}
