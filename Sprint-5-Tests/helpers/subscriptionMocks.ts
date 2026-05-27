import { Page, Route } from '@playwright/test';

export const plans = [
  {
    id: '00000000-0000-4000-8000-000000000001',
    code: 'FREE',
    displayName: 'Free',
    maxUsers: 10,
    maxClassrooms: 2,
    maxCourses: 3,
    hasPremiumFeatures: false,
    priceMonthly: 0,
    currency: 'EUR',
    createdAt: '2026-05-12T10:00:00.000Z',
    updatedAt: '2026-05-12T10:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000002',
    code: 'PRO',
    displayName: 'Pro',
    maxUsers: 100,
    maxClassrooms: 25,
    maxCourses: 50,
    hasPremiumFeatures: true,
    priceMonthly: 29,
    currency: 'EUR',
    createdAt: '2026-05-12T10:00:00.000Z',
    updatedAt: '2026-05-12T10:00:00.000Z',
  },
  {
    id: '00000000-0000-4000-8000-000000000003',
    code: 'SCALE',
    displayName: 'Scale',
    maxUsers: 500,
    maxClassrooms: 100,
    maxCourses: 250,
    hasPremiumFeatures: true,
    priceMonthly: 99,
    currency: 'EUR',
    createdAt: '2026-05-12T10:00:00.000Z',
    updatedAt: '2026-05-12T10:00:00.000Z',
  },
];

const baseURL = process.env.E2E_BASE_URL ?? 'https://frontend-teal-five-57.vercel.app';

export function subscriptionFor(plan = plans[1]) {
  return {
    organizationId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    status: 'ACTIVE',
    currentPeriodStart: '2026-05-01T00:00:00.000Z',
    currentPeriodEnd: '2026-06-01T00:00:00.000Z',
    plan,
  };
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  });
}

export async function mockSubscriptionPlans(page: Page) {
  await page.route('**/api/v1/subscription-plans', async (route) => {
    await json(route, plans);
  });
}

export async function mockCurrentSubscription(page: Page, plan = plans[1]) {
  await page.route('**/api/v1/organizations/*/subscription', async (route) => {
    if (route.request().method() === 'GET') {
      await json(route, subscriptionFor(plan));
      return;
    }

    await route.fallback();
  });
}

export async function mockCheckoutSession(page: Page) {
  await page.route('**/api/v1/organizations/*/subscription/checkout', async (route) => {
    if (route.request().method() === 'POST') {
      await json(route, {
        checkoutUrl: `${baseURL}/dashboard/admin/settings?stripe=mock-success`,
        sessionId: 'cs_test_subscription_e2e',
      });
      return;
    }

    await route.fallback();
  });
}

export async function mockPlanChange(page: Page, nextPlan = plans[2]) {
  let changed = false;

  await page.route('**/api/v1/organizations/*/subscription', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await json(route, subscriptionFor(changed ? nextPlan : plans[1]));
      return;
    }

    if (method === 'PATCH') {
      changed = true;
      await json(route, {
        id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
        organizationId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        subscriptionPlanId: nextPlan.id,
        status: 'ACTIVE',
        provider: 'STRIPE',
        providerCustomerId: 'cus_test_subscription_e2e',
        providerSubscriptionId: 'sub_test_subscription_e2e',
        currentPeriodStart: '2026-05-01T00:00:00.000Z',
        currentPeriodEnd: '2026-06-01T00:00:00.000Z',
        createdAt: '2026-05-01T00:00:00.000Z',
        updatedAt: '2026-05-12T12:00:00.000Z',
      });
      return;
    }

    await route.fallback();
  });
}

export async function mockSubscriptionPlansError(page: Page) {
  await page.route('**/api/v1/subscription-plans', async (route) => {
    await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
  });
}

export async function mockCurrentSubscriptionError(page: Page) {
  await page.route('**/api/v1/organizations/*/subscription', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
      return;
    }
    await route.fallback();
  });
}

export async function mockCheckoutError(page: Page) {
  await page.route('**/api/v1/organizations/*/subscription/checkout', async (route) => {
    await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
  });
}

export async function mockPlanChangeError(page: Page) {
  await page.route('**/api/v1/organizations/*/subscription', async (route) => {
    const method = route.request().method();
    if (method === 'GET') {
      await json(route, subscriptionFor(plans[1]));
      return;
    }
    if (method === 'PATCH') {
      await route.fulfill({ status: 500, contentType: 'application/json', body: '{}' });
      return;
    }
    await route.fallback();
  });
}
