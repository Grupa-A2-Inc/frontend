import { expect, test } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { uniqueName, testData } from '../fixtures/test-data';
import { acceptNextDialog } from '../helpers/ui';

// --------------------------------------------------
// SUITĂ DE TESTE: Admin - Classroom Management
// --------------------------------------------------

test.describe('Admin - classroom management flow', () => {

  // --------------------------------------------------
  // Setup: admin logat + navigare la pagina de classes
  // --------------------------------------------------
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/admin/classes');
  });

  // --------------------------------------------------
  // TEST 1 — Admin vede pagina de classes
  // --------------------------------------------------
  test('admin can navigate to classrooms page and see list state', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /^classes$/i })).toBeVisible();

    // Buton Add Class
    await expect(page.getByRole('button', { name: /add class/i })).toBeVisible();

    // Fallback sau grid
    await expect(
      page.getByText(/classroom|no classes|loading classes|class/i).first()
    ).toBeVisible();
  });

  // --------------------------------------------------
  // TEST 2 — Search funcționează
  // --------------------------------------------------
  test('admin can search classrooms', async ({ page }) => {
    const search = page.getByPlaceholder(/search by name or grade/i);

    await expect(search).toBeVisible();
    await search.fill('10');
    await expect(search).toHaveValue('10');
  });

  // TEST 3
  test('admin can create a classroom and see updated list', async ({ page }) => {
    const className = uniqueName('E2E Class');

    await page.getByRole('button', { name: /add class/i }).click();
    await expect(page.getByRole('heading', { name: /add class/i })).toBeVisible();

    // Folosim placeholder în loc de label
    await page.getByPlaceholder(/10th grade a/i).fill(className);
    await page.getByPlaceholder(/brief description/i).fill(testData.classDescription);

    await page.getByRole('button', { name: /create class/i }).click();

    await expect(page.getByRole('heading', { name: /add class/i })).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(className)).toBeVisible({ timeout: 15_000 });

    await page.getByPlaceholder(/search/i).fill(className);
    await expect(page.getByText(className)).toBeVisible();
  });

  // TEST 4
  test('admin can create and delete a classroom', async ({ page }) => {
    const className = uniqueName('E2E Delete Class');

    await page.getByRole('button', { name: /add class/i }).click();
    await page.getByPlaceholder(/10th grade a/i).fill(className);
    await page.getByPlaceholder(/brief description/i).fill(testData.classDescription);
    await page.getByRole('button', { name: /create class/i }).click();

    await expect(page.getByRole('heading', { name: /add class/i })).not.toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(className)).toBeVisible({ timeout: 15_000 });

    await page.getByPlaceholder(/search/i).fill(className);
    await expect(page.getByText(className)).toBeVisible();

    page.once('dialog', dialog => dialog.accept());

    await page
      .getByText(className)
      .locator('xpath=ancestor::*[contains(@class, "rounded-2xl")][1]')
      .locator('button:has-text("delete")')
      .click();

    await expect(page.getByText(className)).not.toBeVisible({ timeout: 15_000 });
  });

  // --------------------------------------------------
  // TEST 5 — Pagina funcționează pe mobile
  // --------------------------------------------------
  test('classes page works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard/admin/classes');

    await expect(page.getByRole('heading', { name: /^classes$/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search by name or grade/i)).toBeVisible();
  });
});
