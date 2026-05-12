import { Page } from '@playwright/test';

export const adminUser = {
  id: '11111111-1111-4111-8111-111111111111',
  firstName: 'Sprint',
  lastName: 'Admin',
  email: 'admin.sprint5@example.com',
  role: 'ORGANIZATION_ADMIN',
  status: 'ACTIVE',
  organizationId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  organizationName: 'Sprint 5 Academy',
  organizationType: 'School',
  country: 'Romania',
  city: 'Bucharest',
  organizationPhoneNumber: '+40700000000',
  organizationAddress: 'Test Street 5',
};

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

export async function seedAdminSession(page: Page) {
  await page.context().clearCookies();

  await page.context().addCookies([
    {
      name: 'accessToken',
      value: 'e2e-token',
      url: baseURL,
    },
    {
      name: 'role',
      value: 'ORGANIZATION_ADMIN',
      url: baseURL,
    },
  ]);

  await page.addInitScript((user) => {
    localStorage.setItem('accessToken', 'e2e-token');
    localStorage.setItem('user', JSON.stringify(user));
  }, adminUser);
}
