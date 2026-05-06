import { expect, test } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { uniqueName, testData } from '../fixtures/test-data';
import { acceptNextDialog } from '../helpers/ui';

test.describe('Admin - user management flow', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/admin/users');
  });

  // TEST 1 — fix strict mode violation
  test('admin can navigate to users page and see list/table state', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible();

    await expect(page.getByRole('button', { name: /students/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /teachers/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search by name or email/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /add user/i })).toBeVisible();
  });

  // --------------------------------------------------
  // TEST 2 — Search + filtre funcționează
  // --------------------------------------------------
  test('admin can search and filter users', async ({ page }) => {
    const search = page.getByPlaceholder(/search by name or email/i);

    await expect(search).toBeVisible();
    await search.fill('roxana');
    await expect(search).toHaveValue('roxana');

    // Filtre rol
    await page.getByRole('button', { name: /students/i }).click();
    await page.getByRole('button', { name: /teachers/i }).click();

    // Filtre status
    await page.getByRole('button', { name: /^active$/i }).click();
    await page.getByRole('button', { name: /^inactive$/i }).click();
  });

  // --------------------------------------------------
  // TEST 3 — Modalul Add User se deschide și validările funcționează
  // --------------------------------------------------
  test('admin can open add user modal and validation works', async ({ page }) => {
    await page.getByRole('button', { name: /add user/i }).click();

    await expect(page.getByRole('heading', { name: /add user/i })).toBeVisible();

    // Apăsăm direct Add User fără completare
    await page.getByRole('button', { name: /^add user$/i }).click();

    // Validare: First Name este required (text exact din componentă)
    await expect(page.getByText(/first name is required\./i)).toBeVisible();
  });

  // TEST 4 
  test('admin can add user and see updated list', async ({ page }) => {
    const email = `${uniqueName('student').toLowerCase()}@example.com`;

    await page.getByRole('button', { name: /add user/i }).click();
    await expect(page.getByRole('heading', { name: /add user/i })).toBeVisible({ timeout: 10_000 });

    await page.getByLabel(/first name/i).fill(testData.userFirstName);
    await page.getByLabel(/last name/i).fill(testData.userLastName);
    await page.getByLabel(/^email/i).fill(email);
    await page.getByLabel(/role/i).selectOption('STUDENT');

    await page.getByRole('button', { name: /^add user$/i }).click();

    // Așteptăm să se închidă modalul
    await expect(page.getByRole('heading', { name: /add user/i })).not.toBeVisible({ timeout: 15_000 });

    // Căutăm userul adăugat
    await page.getByPlaceholder(/search by name or email/i).fill(email);
    await expect(page.getByText(email)).toBeVisible({ timeout: 15_000 });
  });

  // TEST 5 — admin can add and delete user
  test('admin can add and then delete a user', async ({ page }) => {
    const email = `${uniqueName('delete-user').toLowerCase()}@example.com`;

    await page.getByRole('button', { name: /add user/i }).click();
    await expect(page.getByRole('heading', { name: /add user/i })).toBeVisible({ timeout: 10_000 });

    await page.getByLabel(/first name/i).fill('Delete');
    await page.getByLabel(/last name/i).fill('Candidate');
    await page.getByLabel(/^email/i).fill(email);
    await page.getByLabel(/role/i).selectOption('STUDENT');

    await page.getByRole('button', { name: /^add user$/i }).click();
    await expect(page.getByRole('heading', { name: /add user/i })).not.toBeVisible({ timeout: 15_000 });

    // Căutăm userul
    await page.getByPlaceholder(/search by name or email/i).fill(email);
    await expect(page.getByText(email)).toBeVisible({ timeout: 15_000 });

    // Confirm dialog ÎNAINTE de click pe delete
    page.once('dialog', dialog => dialog.accept());

    // Click pe butonul delete din rândul userului
    const row = page.getByRole('row').filter({ hasText: email });
    await row.getByRole('button', { name: /delete/i }).click();

    // Userul dispare
    await expect(page.getByText(email)).not.toBeVisible({ timeout: 15_000 });
  });
});
