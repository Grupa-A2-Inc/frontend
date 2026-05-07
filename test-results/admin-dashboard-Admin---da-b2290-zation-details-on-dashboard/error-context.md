# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-dashboard.spec.ts >> Admin - dashboard and organization >> admin can see organization details on dashboard
- Location: Sprint-2&3-Tests\specs\admin-dashboard.spec.ts:27:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /organization/i })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByRole('heading', { name: /organization/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - img "logo" [ref=e7]
        - button "chevron_left" [ref=e8] [cursor=pointer]:
          - generic [ref=e9]: chevron_left
      - navigation [ref=e10]:
        - generic [ref=e11]:
          - list
        - generic [ref=e12]:
          - link "U" [ref=e14] [cursor=pointer]:
            - /url: /
            - generic [ref=e15]: U
          - button "dark_mode" [ref=e16] [cursor=pointer]:
            - generic [ref=e17]: dark_mode
          - button "logout" [ref=e19] [cursor=pointer]:
            - generic [ref=e20]: logout
    - main [ref=e21]:
      - generic [ref=e22]:
        - generic [ref=e23]:
          - heading "Admin Dashboard" [level=1] [ref=e24]
          - paragraph [ref=e25]: Overview of your organization, key metrics, and quick access to main admin areas.
        - generic [ref=e26]:
          - img [ref=e27]
          - paragraph [ref=e31]: Missing session data. Please sign in again.
        - button "Retry" [ref=e32]
  - alert [ref=e33]
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { loginAsAdmin } from '../helpers/auth';
  3  | 
  4  | test.describe('Admin - dashboard and organization', () => {
  5  | 
  6  |   test.beforeEach(async ({ page }) => {
  7  |     await loginAsAdmin(page);
  8  |     await page.goto('/dashboard/admin');
  9  |   });
  10 | 
  11 |   // TEST 1 — Admin vede dashboard-ul după login
  12 |   test('admin logs in and can see dashboard', async ({ page }) => {
  13 |     await expect(page).toHaveURL(/\/dashboard\/admin/);
  14 | 
  15 |     // Heading-ul real din UI
  16 |     await expect(
  17 |       page.getByRole('heading', { name: /admin dashboard/i })
  18 |     ).toBeVisible();
  19 | 
  20 |     // Subheading-ul real
  21 |     await expect(
  22 |       page.getByText(/overview of your organization/i)
  23 |     ).toBeVisible();
  24 |   });
  25 | 
  26 |   // TEST 2 — Admin poate vedea detaliile organizației
  27 |   test('admin can see organization details on dashboard', async ({ page }) => {
  28 |     // OrganizationSummaryCard este prezent
  29 |     await expect(
  30 |       page.getByRole('heading', { name: /organization/i })
> 31 |     ).toBeVisible();
     |       ^ Error: expect(locator).toBeVisible() failed
  32 |   });
  33 | 
  34 |   // TEST 3 — Admin poate edita detaliile organizației
  35 |   test('admin can edit organization details', async ({ page }) => {
  36 |     // Butonul de editare din OrganizationSummaryCard
  37 |     const editButton = page.getByRole('button', { name: /edit/i });
  38 | 
  39 |     await expect(editButton).toBeVisible();
  40 |     await editButton.click();
  41 | 
  42 |     // După click, apare formularul de editare
  43 |     await expect(
  44 |       page.getByText(/save|update|organization/i)
  45 |     ).toBeVisible();
  46 |   });
  47 | 
  48 |   // TEST 4 — Dashboard-ul funcționează pe mobile
  49 |   test('admin dashboard works on mobile viewport', async ({ page }) => {
  50 |     await page.setViewportSize({ width: 390, height: 844 });
  51 |     await page.goto('/dashboard/admin');
  52 | 
  53 |     await expect(
  54 |       page.getByRole('heading', { name: /admin dashboard/i })
  55 |     ).toBeVisible();
  56 |   });
  57 | });
  58 | 
```