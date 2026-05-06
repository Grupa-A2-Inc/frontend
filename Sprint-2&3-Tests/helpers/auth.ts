import { Page, expect } from '@playwright/test';
import { testUsers } from '../fixtures/users';

// --------------------------------------------------
// Helper: Curăță sesiunea complet (cookies + localStorage)
// --------------------------------------------------
export async function clearSession(page: Page) {
  await page.context().clearCookies();
  await page.addInitScript(() => localStorage.clear());
}

export async function loginAsTeacher(page: Page) {
  await clearSession(page);

  await page.goto('/login');

  await page.fill('input[type="email"]', testUsers.teacher.email);
  await page.fill('input[type="password"]', testUsers.teacher.password);

  await page.getByRole('button', { name: /^log in$/i }).click();

  // Vercel e lent — așteptăm mai mult
  await page.waitForURL('**/dashboard**', { timeout: 60_000 });

  await expect(
    page.getByText(/my courses/i)
  ).toBeVisible({ timeout: 15_000 });
}

export async function loginAsAdmin(page: Page) {
  await clearSession(page);

  // Mic delay pentru a evita conflicte de token la rulări paralele
  await page.waitForTimeout(1000);

  await page.goto('/login');

  await page.fill('input[type="email"]', testUsers.admin.email);
  await page.fill('input[type="password"]', testUsers.admin.password);

  await page.getByRole('button', { name: /^log in$/i }).click();

  // Dacă apare eroare de backend, mai încearcă o dată
  const errorVisible = await page.getByText(/duplicate|error|could not/i)
    .isVisible()
    .catch(() => false);

  if (errorVisible) {
    await page.waitForTimeout(2000);
    await page.getByRole('button', { name: /^log in$/i }).click();
  }

  await page.waitForURL('**/dashboard**', { timeout: 60_000 });

  await expect(
    page.getByText(/admin dashboard/i)
  ).toBeVisible({ timeout: 15_000 });
}