import { expect, test } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Admin - dashboard and organization', () => {

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/admin');
  });

  // TEST 1 — Admin vede dashboard-ul după login
  test('admin logs in and can see dashboard', async ({ page }) => {
    await expect(page).toHaveURL(/\/dashboard\/admin/);

    // Heading-ul real din UI
    await expect(
      page.getByRole('heading', { name: /admin dashboard/i })
    ).toBeVisible();

    // Subheading-ul real
    await expect(
      page.getByText(/overview of your organization/i)
    ).toBeVisible();
  });

  // TEST 2 — Admin poate vedea detaliile organizației
  test('admin can see organization details on dashboard', async ({ page }) => {
    // OrganizationSummaryCard este prezent
    await expect(
      page.getByRole('heading', { name: /organization/i })
    ).toBeVisible();
  });

  // TEST 3 — Admin poate edita detaliile organizației
  test('admin can edit organization details', async ({ page }) => {
    // Butonul de editare din OrganizationSummaryCard
    const editButton = page.getByRole('button', { name: /edit/i });

    await expect(editButton).toBeVisible();
    await editButton.click();

    // După click, apare formularul de editare
    await expect(
      page.getByText(/save|update|organization/i)
    ).toBeVisible();
  });

  // TEST 4 — Dashboard-ul funcționează pe mobile
  test('admin dashboard works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/dashboard/admin');

    await expect(
      page.getByRole('heading', { name: /admin dashboard/i })
    ).toBeVisible();
  });
});
