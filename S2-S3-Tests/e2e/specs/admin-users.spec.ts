import { expect, test } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';
import { uniqueName, testData } from '../fixtures/test-data';
import { acceptNextDialog } from '../helpers/ui';

test.describe('Admin - user management flow', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/admin/users');
  });

  // --------------------------------------------------
  // TEST 1 — Admin vede pagina de user management
  // --------------------------------------------------
  test('admin can navigate to users page and see list/table state', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible();

    // Tabelul are headerele reale
    await expect(page.getByText(/user/i)).toBeVisible();
    await expect(page.getByText(/email/i)).toBeVisible();
    await expect(page.getByText(/role/i)).toBeVisible();
    await expect(page.getByText(/status/i)).toBeVisible();
    await expect(page.getByText(/actions/i)).toBeVisible();
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

  // --------------------------------------------------
  // TEST 4 — Admin poate adăuga un user
  // --------------------------------------------------
  test('admin can add user and see updated list', async ({ page }) => {
    const email = `${uniqueName('student').toLowerCase()}@example.com`;

    await page.getByRole('button', { name: /add user/i }).click();

    await page.getByLabel(/first name/i).fill(testData.userFirstName);
    await page.getByLabel(/last name/i).fill(testData.userLastName);
    await page.getByLabel(/^email/i).fill(email);

    // Selectăm rolul STUDENT
    await page.getByLabel(/role/i).selectOption('STUDENT');

    await page.getByRole('button', { name: /^add user$/i }).click();

    // Modalul se închide
    await expect(page.getByRole('heading', { name: /add user/i })).not.toBeVisible();

    // Userul apare în listă
    await expect(page.getByText(email)).toBeVisible();
  });

  // --------------------------------------------------
  // TEST 5 — Admin poate adăuga și apoi șterge un user
  // --------------------------------------------------
  test('admin can add and then delete a user', async ({ page }) => {
    const email = `${uniqueName('delete-user').toLowerCase()}@example.com`;

    await page.getByRole('button', { name: /add user/i }).click();

    await page.getByLabel(/first name/i).fill('Delete');
    await page.getByLabel(/last name/i).fill('Candidate');
    await page.getByLabel(/^email/i).fill(email);
    await page.getByLabel(/role/i).selectOption('STUDENT');

    await page.getByRole('button', { name: /^add user$/i }).click();

    await expect(page.getByText(email)).toBeVisible();

    // Căutăm userul
    await page.getByPlaceholder(/search by name or email/i).fill(email);
    await expect(page.getByText(email)).toBeVisible();

    // Confirm dialog
    await acceptNextDialog(page);

    // Butonul delete — selecție 100% robustă
    await page
      .getByText(email)
      .locator('xpath=ancestor::tr')
      .locator('button:has-text("delete")')
      .click();

    // Userul dispare din listă
    await expect(page.getByText(email)).not.toBeVisible();
  });
});
