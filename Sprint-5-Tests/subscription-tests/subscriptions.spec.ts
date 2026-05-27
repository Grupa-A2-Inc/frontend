import { expect, test } from '@playwright/test';
import { seedAdminSession } from '../helpers/auth';
import {
  mockCheckoutSession,
  mockCheckoutError,
  mockCurrentSubscription,
  mockCurrentSubscriptionError,
  mockPlanChange,
  mockPlanChangeError,
  mockSubscriptionPlans,
  mockSubscriptionPlansError,
  plans,
} from '../helpers/subscriptionMocks';

type SubscriptionPayload = {
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
};

test.describe('Sprint 5 - subscriptions', () => {
  test('register page defers subscription choice until after account creation', async ({ page }) => {
    await page.goto('/register');

    await expect(page.getByRole('heading', { name: /subscription plan/i })).toHaveCount(0);
    await expect(page.getByText(/choose a subscription plan in settings/i)).toBeVisible();
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

  test('only the chosen plan uses the selected state', async ({ page }) => {
    await seedAdminSession(page);
    await mockSubscriptionPlans(page);
    await mockCurrentSubscription(page, plans[1]);

    await page.goto('/dashboard/admin/settings');
    await expect(page.getByRole('button', { name: /current plan/i })).toBeVisible();

    await page.getByRole('button', { name: /select plan/i }).last().click();

    await expect(page.getByRole('button', { name: 'Selected' })).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Current plan' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Select current plan' })).toBeVisible();
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

  test('shows error when subscription plans fail to load', async ({ page }) => {
    await seedAdminSession(page);
    await mockSubscriptionPlansError(page);
    await mockCurrentSubscription(page, plans[1]);

    await page.goto('/dashboard/admin/settings');

    await expect(page.getByText('Subscription request failed.')).toBeVisible();
  });

  test('shows error when current subscription fails to load', async ({ page }) => {
    await seedAdminSession(page);
    await mockSubscriptionPlans(page);
    await mockCurrentSubscriptionError(page);

    await page.goto('/dashboard/admin/settings');

    await expect(page.getByText('No current subscription loaded.')).toBeVisible();
    await expect(page.getByText('Subscription request failed.')).toBeVisible();
  });

  test('checkout shows error message when API fails', async ({ page }) => {
    await seedAdminSession(page);
    await mockSubscriptionPlans(page);
    await mockCurrentSubscription(page, plans[1]);
    await mockCheckoutError(page);

    await page.goto('/dashboard/admin/settings');

    await page.getByRole('button', { name: /select plan/i }).last().click();
    await page.getByRole('button', { name: /^checkout/i }).click();
    await page.getByRole('button', { name: /continue to stripe/i }).click();

    await expect(page.getByText('Subscription request failed.')).toBeVisible();
  });

  test('change plan shows error message when API fails', async ({ page }) => {
    await seedAdminSession(page);
    await mockSubscriptionPlans(page);
    await mockPlanChangeError(page);

    await page.goto('/dashboard/admin/settings');

    await page.getByRole('button', { name: /select plan/i }).last().click();
    await page.getByRole('button', { name: /change plan/i }).click();
    await page.getByRole('button', { name: /confirm change/i }).click();

    await expect(page.getByText('Subscription request failed.')).toBeVisible();
  });

  test('changing to the current plan disables confirm and shows a warning', async ({ page }) => {
    await seedAdminSession(page);
    await mockSubscriptionPlans(page);
    await mockCurrentSubscription(page, plans[1]); // Pro is the active plan

    await page.goto('/dashboard/admin/settings');

    // Pro is already selected (the component selects the current plan on load)
    await page.getByRole('button', { name: /change plan/i }).click();

    await expect(page.getByText(/this plan is already active/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /confirm change/i })).toBeDisabled();
  });
});
