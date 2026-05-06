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

  // --------------------------------------------------
  // TEST 3 — Admin poate crea o clasă
  // --------------------------------------------------
  test('admin can create a classroom and see updated list', async ({ page }) => {
    const className = uniqueName('E2E Class');

    await page.getByRole('button', { name: /add class/i }).click();
    await expect(page.getByRole('heading', { name: /add class/i })).toBeVisible();

    await page.getByLabel(/class name/i).fill(className);
    await page.getByLabel(/description/i).fill(testData.classDescription);

    await page.getByRole('button', { name: /create class/i }).click();

    // Modalul se închide
    await expect(page.getByRole('heading', { name: /add class/i })).not.toBeVisible();

    // Clasa apare în grid
    await expect(page.getByText(className)).toBeVisible();

    // Search confirmă existența
    await page.getByPlaceholder(/search/i).fill(className);
    await expect(page.getByText(className)).toBeVisible();
  });

  // --------------------------------------------------
  // TEST 4 — Admin poate crea și apoi șterge o clasă
  // --------------------------------------------------
  test('admin can create and delete a classroom', async ({ page }) => {
    const className = uniqueName('E2E Delete Class');

    // Creăm clasa
    await page.getByRole('button', { name: /add class/i }).click();
    await page.getByLabel(/class name/i).fill(className);
    await page.getByLabel(/description/i).fill(testData.classDescription);
    await page.getByRole('button', { name: /create class/i }).click();

    await expect(page.getByText(className)).toBeVisible();

    // Căutăm clasa
    await page.getByPlaceholder(/search/i).fill(className);
    await expect(page.getByText(className)).toBeVisible();

    // Confirm dialog
    await acceptNextDialog(page);

    // DELETE — selecție 100% robustă
    await page
      .getByText(className)
      .locator('xpath=ancestor::*[contains(@class, "rounded-2xl")][1]')
      .locator('button:has-text("delete")')
      .click();

    // Clasa dispare din listă
    await expect(page.getByText(className)).not.toBeVisible();
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
