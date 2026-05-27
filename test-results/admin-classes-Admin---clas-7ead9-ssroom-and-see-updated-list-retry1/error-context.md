# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-classes.spec.ts >> Admin - classroom management flow >> admin can create a classroom and see updated list
- Location: Sprint-2&3-Tests\specs\admin-classes.spec.ts:47:7

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  getByRole('heading', { name: /add class/i })
Expected: not visible
Received: visible
Timeout:  15000ms

Call log:
  - Expect "not toBeVisible" with timeout 15000ms
  - waiting for getByRole('heading', { name: /add class/i })
    18 × locator resolved to <h2 class="text-brand-text font-semibold text-lg">Add Class</h2>
       - unexpected value "visible"

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
          - generic [ref=e24]:
            - heading "Classes" [level=1] [ref=e25]
            - paragraph [ref=e26]: 0 classrooms total
          - button "add Add Class" [ref=e27]:
            - generic [ref=e28]: add
            - text: Add Class
        - generic [ref=e29]:
          - generic [ref=e30]: search
          - textbox "Search by name or grade..." [ref=e31]
        - generic [ref=e32]:
          - generic [ref=e33]: meeting_room
          - paragraph [ref=e34]: No classes yet. Create your first one.
        - generic [ref=e37]:
          - generic [ref=e38]:
            - heading "Add Class" [level=2] [ref=e39]
            - button "close" [ref=e40]:
              - generic [ref=e41]: close
          - generic [ref=e42]:
            - generic [ref=e43]:
              - generic [ref=e44]: Class Name *
              - textbox "e.g. 10th Grade A" [ref=e45]: E2E Class-1778118262872-984
            - generic [ref=e46]:
              - generic [ref=e47]: Description
              - textbox "Brief description of the classroom..." [ref=e48]: Created by Playwright E2E test
            - paragraph [ref=e49]: Failed to create classroom
            - generic [ref=e50]:
              - button "Cancel" [ref=e51]
              - button "Create Class" [ref=e52]
  - alert [ref=e53]
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { loginAsAdmin } from '../helpers/auth';
  3   | import { uniqueName, testData } from '../fixtures/test-data';
  4   | import { acceptNextDialog } from '../helpers/ui';
  5   | 
  6   | // --------------------------------------------------
  7   | // SUITĂ DE TESTE: Admin - Classroom Management
  8   | // --------------------------------------------------
  9   | 
  10  | test.describe('Admin - classroom management flow', () => {
  11  | 
  12  |   // --------------------------------------------------
  13  |   // Setup: admin logat + navigare la pagina de classes
  14  |   // --------------------------------------------------
  15  |   test.beforeEach(async ({ page }) => {
  16  |     await loginAsAdmin(page);
  17  |     await page.goto('/dashboard/admin/classes');
  18  |   });
  19  | 
  20  |   // --------------------------------------------------
  21  |   // TEST 1 — Admin vede pagina de classes
  22  |   // --------------------------------------------------
  23  |   test('admin can navigate to classrooms page and see list state', async ({ page }) => {
  24  |     await expect(page.getByRole('heading', { name: /^classes$/i })).toBeVisible();
  25  | 
  26  |     // Buton Add Class
  27  |     await expect(page.getByRole('button', { name: /add class/i })).toBeVisible();
  28  | 
  29  |     // Fallback sau grid
  30  |     await expect(
  31  |       page.getByText(/classroom|no classes|loading classes|class/i).first()
  32  |     ).toBeVisible();
  33  |   });
  34  | 
  35  |   // --------------------------------------------------
  36  |   // TEST 2 — Search funcționează
  37  |   // --------------------------------------------------
  38  |   test('admin can search classrooms', async ({ page }) => {
  39  |     const search = page.getByPlaceholder(/search by name or grade/i);
  40  | 
  41  |     await expect(search).toBeVisible();
  42  |     await search.fill('10');
  43  |     await expect(search).toHaveValue('10');
  44  |   });
  45  | 
  46  |   // TEST 3
  47  |   test('admin can create a classroom and see updated list', async ({ page }) => {
  48  |     const className = uniqueName('E2E Class');
  49  | 
  50  |     await page.getByRole('button', { name: /add class/i }).click();
  51  |     await expect(page.getByRole('heading', { name: /add class/i })).toBeVisible();
  52  | 
  53  |     // Folosim placeholder în loc de label
  54  |     await page.getByPlaceholder(/10th grade a/i).fill(className);
  55  |     await page.getByPlaceholder(/brief description/i).fill(testData.classDescription);
  56  | 
  57  |     await page.getByRole('button', { name: /create class/i }).click();
  58  | 
> 59  |     await expect(page.getByRole('heading', { name: /add class/i })).not.toBeVisible({ timeout: 15_000 });
      |                                                                         ^ Error: expect(locator).not.toBeVisible() failed
  60  |     await expect(page.getByText(className)).toBeVisible({ timeout: 15_000 });
  61  | 
  62  |     await page.getByPlaceholder(/search/i).fill(className);
  63  |     await expect(page.getByText(className)).toBeVisible();
  64  |   });
  65  | 
  66  |   // TEST 4
  67  |   test('admin can create and delete a classroom', async ({ page }) => {
  68  |     const className = uniqueName('E2E Delete Class');
  69  | 
  70  |     await page.getByRole('button', { name: /add class/i }).click();
  71  |     await page.getByPlaceholder(/10th grade a/i).fill(className);
  72  |     await page.getByPlaceholder(/brief description/i).fill(testData.classDescription);
  73  |     await page.getByRole('button', { name: /create class/i }).click();
  74  | 
  75  |     await expect(page.getByRole('heading', { name: /add class/i })).not.toBeVisible({ timeout: 15_000 });
  76  |     await expect(page.getByText(className)).toBeVisible({ timeout: 15_000 });
  77  | 
  78  |     await page.getByPlaceholder(/search/i).fill(className);
  79  |     await expect(page.getByText(className)).toBeVisible();
  80  | 
  81  |     page.once('dialog', dialog => dialog.accept());
  82  | 
  83  |     await page
  84  |       .getByText(className)
  85  |       .locator('xpath=ancestor::*[contains(@class, "rounded-2xl")][1]')
  86  |       .locator('button:has-text("delete")')
  87  |       .click();
  88  | 
  89  |     await expect(page.getByText(className)).not.toBeVisible({ timeout: 15_000 });
  90  |   });
  91  | 
  92  |   // --------------------------------------------------
  93  |   // TEST 5 — Pagina funcționează pe mobile
  94  |   // --------------------------------------------------
  95  |   test('classes page works on mobile viewport', async ({ page }) => {
  96  |     await page.setViewportSize({ width: 390, height: 844 });
  97  |     await page.goto('/dashboard/admin/classes');
  98  | 
  99  |     await expect(page.getByRole('heading', { name: /^classes$/i })).toBeVisible();
  100 |     await expect(page.getByPlaceholder(/search by name or grade/i)).toBeVisible();
  101 |   });
  102 | });
  103 | 
```