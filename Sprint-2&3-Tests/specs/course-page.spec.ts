import { test, expect } from '@playwright/test';

const STUDENT_EMAIL = 'dfdavidqd7@gmail.com';
const STUDENT_PASSWORD = 'johndoe123';

test.describe('Full Student Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/login'); 
    await page.getByPlaceholder('e.g. student@school.com').fill(STUDENT_EMAIL);
    await page.getByPlaceholder('Enter your password').fill(STUDENT_PASSWORD);
    await page.getByRole('button', { name: 'Log in' }).click();
    
    await expect(page.getByText('View →').first()).toBeVisible({ timeout: 15000 });
  });

  test('parcurge tot fluxul: Dashboard -> Curs -> Lectie -> Curs -> Dashboard', async ({ page }) => {
    await page.getByText('View →').first().click();
    await expect(page).toHaveURL(/.*\/courses\/[a-zA-Z0-9-]+$/);
    await expect(page.getByRole('heading', { name: 'Course Overview' })).toBeVisible();

    const startCourseBtn = page.getByRole('link', { name: /start course/i });
    await startCourseBtn.click();

    await expect(page).toHaveURL(/.*\/lessons\/[a-zA-Z0-9-]+/);
    await expect(page.getByText('Go through the material.')).toBeVisible();

    await page.getByRole('link', { name: 'Back to course overview' }).click();
    await expect(page).toHaveURL(/.*\/courses\/[a-zA-Z0-9-]+$/);
    await expect(page.getByRole('heading', { name: 'Course Content' })).toBeVisible();

    await page.getByRole('link', { name: 'Back to courses' }).click();
    await expect(page).toHaveURL(/.*\/dashboard\/student$/);
    await expect(page.getByRole('heading', { name: 'Courses', exact: true })).toBeVisible();
  });
});