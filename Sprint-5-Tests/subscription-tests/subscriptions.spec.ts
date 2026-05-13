import { expect, test } from '@playwright/test';
import { seedAdminSession } from '../helpers/auth';
import {
  mockCheckoutSession,
  mockCurrentSubscription,
  mockPlanChange,
  mockSubscriptionPlans,
  plans,
} from '../helpers/subscriptionMocks';

type SubscriptionPayload = {
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
};

test.describe('Sprint 5 - subscriptions', () => {
  test('register page lists available subscription plans', async ({ page }) => {
    await mockSubscriptionPlans(page);

    await page.goto('/register');

    await expect(page.getByRole('heading', { name: /subscription plan/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Free' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pro' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Scale' })).toBeVisible();

    await page.getByRole('button', { name: /select plan|choose plan/i }).first().click();
    await expect(page.getByText(/^Pro$/).first()).toBeVisible();
  });

  test('settings page shows current subscription and plan limits', async ({ page }) => {
    await seedAdminSession(page);
    await mockSubscriptionPlans(page);
    await mockCurrentSubscription(page, plans[1]);

    await page.goto('/dashboard/admin/settings');

    await expect(page.getByRole('heading', { name: /subscription plan/i })).toBeVisible();
    await expect(page.getByText(/active: pro/i)).toBeVisible();
    await expect(page.getByText(/status: active/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /current plan/i })).toBeVisible();

    const proPlan = page.locator('article').filter({
      has: page.getByRole('heading', { name: 'Pro' }),
    });

    await expect(proPlan.getByText('100 users', { exact: true })).toBeVisible();
    await expect(proPlan.getByText('25 classrooms', { exact: true })).toBeVisible();
    await expect(proPlan.getByText('50 courses', { exact: true })).toBeVisible();
  });

  test('checkout sends selected plan and redirects to checkout url', async ({ page }) => {
    await seedAdminSession(page);
    await mockSubscriptionPlans(page);
    await mockCurrentSubscription(page, plans[1]);
    await mockCheckoutSession(page);

    await page.goto('/dashboard/admin/settings');
    await page.getByRole('button', { name: /select plan/i }).last().click();
    await page.getByRole('button', { name: /^checkout/i }).click();

    const [checkoutRequest] = await Promise.all([
      page.waitForRequest((request) =>
        request.method() === 'POST' &&
        request.url().includes('/api/v1/organizations/') &&
        request.url().endsWith('/subscription/checkout')
      ),
      page.getByRole('button', { name: /continue to stripe/i }).click(),
    ]);

    const checkoutPayload = checkoutRequest.postDataJSON() as SubscriptionPayload;

    await expect(page).toHaveURL(/stripe=mock-success/);
    expect(checkoutPayload).toMatchObject({
      planId: plans[2].id,
    });
    expect(checkoutPayload?.successUrl).toContain('/dashboard/admin/settings?subscription=success');
    expect(checkoutPayload?.cancelUrl).toContain('/dashboard/admin/settings?subscription=cancel');
  });

  test('change plan sends PATCH and refreshes current subscription', async ({ page }) => {
    await seedAdminSession(page);
    await mockSubscriptionPlans(page);
    await mockPlanChange(page, plans[2]);

    await page.goto('/dashboard/admin/settings');
    await page.getByRole('button', { name: /select plan/i }).last().click();
    await page.getByRole('button', { name: /change plan/i }).click();

    const [patchRequest] = await Promise.all([
      page.waitForRequest((request) =>
        request.method() === 'PATCH' &&
        request.url().includes('/api/v1/organizations/') &&
        request.url().endsWith('/subscription')
      ),
      page.getByRole('button', { name: /confirm change/i }).click(),
    ]);

    const patchPayload = patchRequest.postDataJSON() as SubscriptionPayload;

    await expect(page.getByText(/subscription plan changed successfully/i)).toBeVisible();
    await expect(page.getByText(/active: scale/i)).toBeVisible();
    expect(patchPayload).toMatchObject({
      planId: plans[2].id,
    });
  });
});
