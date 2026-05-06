import { Page, expect } from '@playwright/test';
import { testUsers } from '../fixtures/users';

// --------------------------------------------------
// Helper: Curăță sesiunea complet (cookies + localStorage)
// --------------------------------------------------
export async function clearSession(page: Page) {
  await page.context().clearCookies();

  await page.addInitScript(() => {
    localStorage.clear();
  });
}

// --------------------------------------------------
// Helper pentru login automat ca ADMIN
// Folosește datele din fixtures/users.ts
// --------------------------------------------------
export async function loginAsAdmin(page: Page) {
  await clearSession(page);

  await page.goto('/login');

  await page.fill('input[type="email"]', testUsers.admin.email);
  await page.fill('input[type="password"]', testUsers.admin.password);

  await page.getByRole('button', { name: /^log in$/i }).click();

  await page.waitForURL(/dashboard\/admin/);

  await expect(
    page.getByRole('heading', { name: /welcome to the dashboard, admin/i })
  ).toBeVisible();
}

// --------------------------------------------------
// Helper pentru login automat ca TEACHER
// Folosește datele din fixtures/users.ts
// --------------------------------------------------
export async function loginAsTeacher(page: Page) {
  await clearSession(page);

  await page.goto('/login');

  await page.fill('input[type="email"]', testUsers.teacher.email);
  await page.fill('input[type="password"]', testUsers.teacher.password);

  await page.getByRole('button', { name: /^log in$/i }).click();

  await page.waitForURL(/dashboard\/teacher/);

  await expect(
    page.getByRole('heading', { name: /my courses/i })
  ).toBeVisible();
}
