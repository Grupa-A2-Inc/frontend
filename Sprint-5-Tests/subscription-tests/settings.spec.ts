import { expect, test } from '@playwright/test';
import { adminUser, seedAdminSession } from '../helpers/auth';
import { mockCurrentSubscription, mockSubscriptionPlans } from '../helpers/subscriptionMocks';

test('clearing the optional organization phone keeps the Settings input empty', async ({ page }) => {
  await seedAdminSession(page);
  await mockSubscriptionPlans(page);
  await mockCurrentSubscription(page);

  let savedPhoneNumber: unknown = undefined;

  await page.route('**/api/v1/auth/csrf', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        csrfToken: 'settings-e2e-csrf',
        headerName: 'X-XSRF-TOKEN',
      }),
    });
  });

  await page.route(`**/api/v1/organizations/${adminUser.organizationId}`, async (route) => {
    if (route.request().method() === 'PUT') {
      savedPhoneNumber = route.request().postDataJSON().phoneNumber;
      await route.fulfill({ status: 204 });
      return;
    }

    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: adminUser.organizationId,
          name: adminUser.organizationName,
          organizationType: adminUser.organizationType,
          country: adminUser.country,
          city: adminUser.city,
          phoneNumber: null,
          address: adminUser.organizationAddress,
        }),
      });
      return;
    }

    await route.fallback();
  });

  await page.goto('/dashboard/admin/settings');

  const phoneInput = page.locator('input[type="tel"]');
  await expect(phoneInput).toHaveValue(adminUser.organizationPhoneNumber);
  await phoneInput.clear();

  const organizationDetails = page.locator('section').filter({ hasText: 'Organisation Details' });
  await organizationDetails.getByRole('button', { name: 'Save Changes' }).click();

  await expect(phoneInput).toHaveValue('');
  expect(savedPhoneNumber).toBe('');

  await page.reload();
  await expect(page.locator('input[type="tel"]')).toHaveValue('');
});
