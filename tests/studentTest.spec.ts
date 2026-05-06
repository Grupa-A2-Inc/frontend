import { test, expect } from '@playwright/test';

//incarca variabilele din .env.local ca sa poata fi folosite cu process.env
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const EMAIL = process.env.TEST_EMAIL!;
const PASSWORD = process.env.TEST_PASSWORD!;
const COURSE = process.env.TEST_COURSE!;
const BASE_URL = 'http://localhost:3000';

test('student can log in', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: /log in/i }).click();
  await expect(page).toHaveURL(`${BASE_URL}/dashboard/student`, { timeout: 15000 });
});

// login inainte de teste
async function login(page: any) {
  await page.goto(`${BASE_URL}/login`);
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: /log in/i }).click();
  await page.waitForURL(`${BASE_URL}/dashboard/student`, { timeout: 15000 });
}

test('student can view courses list', async ({ page }) => {
  await login(page);
  await expect(page.getByText(COURSE)).toBeVisible({ timeout: 10000 });
  await expect(page.getByText('My Courses')).toBeVisible();
  await expect(page.getByText('Discover')).toBeVisible();
  await page.getByText('Discover').click();
  await expect(page.getByPlaceholder(/search/i)).toBeVisible();
});

test('student can search courses', async ({ page }) => {
  await login(page);
  const searchInput = page.getByPlaceholder(/search/i);
  await searchInput.fill(COURSE);
  await expect(page.getByText(COURSE)).toBeVisible();
  await searchInput.fill('nimic');
  await expect(page.getByText(COURSE)).not.toBeVisible();
});