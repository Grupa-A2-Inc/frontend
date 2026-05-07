# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-users.spec.ts >> Admin - user management flow >> admin can add user and see updated list
- Location: Sprint-2&3-Tests\specs\admin-users.spec.ts:58:7

# Error details

```
TimeoutError: locator.fill: Timeout 20000ms exceeded.
Call log:
  - waiting for getByLabel(/first name/i)

```

# Page snapshot

```yaml
- generic [ref=e1]:
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
            - heading "User Management" [level=1] [ref=e25]
            - paragraph [ref=e26]: 0 users total
          - generic [ref=e27]:
            - generic [ref=e28] [cursor=pointer]:
              - generic [ref=e29]: upload
              - text: Import CSV
            - button "add Add User" [active] [ref=e30]:
              - generic [ref=e31]: add
              - text: Add User
        - generic [ref=e32]:
          - generic [ref=e33]:
            - button "All 0" [ref=e34]:
              - text: All
              - generic [ref=e35]: "0"
            - button "Students 0" [ref=e36]:
              - text: Students
              - generic [ref=e37]: "0"
            - button "Teachers 0" [ref=e38]:
              - text: Teachers
              - generic [ref=e39]: "0"
          - generic [ref=e40]:
            - generic [ref=e41]:
              - generic [ref=e42]: search
              - textbox "Search by name or email..." [ref=e43]
            - generic [ref=e44]:
              - button "All" [ref=e45]
              - button "Active" [ref=e46]
              - button "Inactive" [ref=e47]
        - generic [ref=e48]:
          - generic [ref=e49]: group
          - paragraph [ref=e50]: No users yet.
        - generic [ref=e53]:
          - generic [ref=e54]:
            - heading "Add User" [level=2] [ref=e55]
            - button "close" [ref=e56]:
              - generic [ref=e57]: close
          - generic [ref=e58]:
            - generic [ref=e59]:
              - generic [ref=e60]: First Name *
              - textbox "e.g. John" [ref=e61]
            - generic [ref=e62]:
              - generic [ref=e63]: Last Name *
              - textbox "e.g. Smith" [ref=e64]
            - generic [ref=e65]:
              - generic [ref=e66]: Email *
              - textbox "e.g. john.smith@school.com" [ref=e67]
            - generic [ref=e68]:
              - generic [ref=e69]: Role
              - combobox [ref=e70]:
                - option "Student" [selected]
                - option "Teacher"
            - paragraph [ref=e71]: The user will receive an email to set their password.
            - generic [ref=e72]:
              - button "Cancel" [ref=e73]
              - button "Add User" [ref=e74]
  - alert [ref=e75]
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { loginAsAdmin } from '../helpers/auth';
  3   | import { uniqueName, testData } from '../fixtures/test-data';
  4   | import { acceptNextDialog } from '../helpers/ui';
  5   | 
  6   | test.describe('Admin - user management flow', () => {
  7   | 
  8   |   test.beforeEach(async ({ page }) => {
  9   |     await loginAsAdmin(page);
  10  |     await page.goto('/dashboard/admin/users');
  11  |   });
  12  | 
  13  |   // TEST 1 — fix strict mode violation
  14  |   test('admin can navigate to users page and see list/table state', async ({ page }) => {
  15  |     await expect(page.getByRole('heading', { name: /user management/i })).toBeVisible();
  16  | 
  17  |     await expect(page.getByRole('button', { name: /students/i })).toBeVisible();
  18  |     await expect(page.getByRole('button', { name: /teachers/i })).toBeVisible();
  19  |     await expect(page.getByPlaceholder(/search by name or email/i)).toBeVisible();
  20  |     await expect(page.getByRole('button', { name: /add user/i })).toBeVisible();
  21  |   });
  22  | 
  23  |   // --------------------------------------------------
  24  |   // TEST 2 — Search + filtre funcționează
  25  |   // --------------------------------------------------
  26  |   test('admin can search and filter users', async ({ page }) => {
  27  |     const search = page.getByPlaceholder(/search by name or email/i);
  28  | 
  29  |     await expect(search).toBeVisible();
  30  |     await search.fill('roxana');
  31  |     await expect(search).toHaveValue('roxana');
  32  | 
  33  |     // Filtre rol
  34  |     await page.getByRole('button', { name: /students/i }).click();
  35  |     await page.getByRole('button', { name: /teachers/i }).click();
  36  | 
  37  |     // Filtre status
  38  |     await page.getByRole('button', { name: /^active$/i }).click();
  39  |     await page.getByRole('button', { name: /^inactive$/i }).click();
  40  |   });
  41  | 
  42  |   // --------------------------------------------------
  43  |   // TEST 3 — Modalul Add User se deschide și validările funcționează
  44  |   // --------------------------------------------------
  45  |   test('admin can open add user modal and validation works', async ({ page }) => {
  46  |     await page.getByRole('button', { name: /add user/i }).click();
  47  | 
  48  |     await expect(page.getByRole('heading', { name: /add user/i })).toBeVisible();
  49  | 
  50  |     // Apăsăm direct Add User fără completare
  51  |     await page.getByRole('button', { name: /^add user$/i }).click();
  52  | 
  53  |     // Validare: First Name este required (text exact din componentă)
  54  |     await expect(page.getByText(/first name is required\./i)).toBeVisible();
  55  |   });
  56  | 
  57  |   // TEST 4 
  58  |   test('admin can add user and see updated list', async ({ page }) => {
  59  |     const email = `${uniqueName('student').toLowerCase()}@example.com`;
  60  | 
  61  |     await page.getByRole('button', { name: /add user/i }).click();
  62  |     await expect(page.getByRole('heading', { name: /add user/i })).toBeVisible({ timeout: 10_000 });
  63  | 
> 64  |     await page.getByLabel(/first name/i).fill(testData.userFirstName);
      |                                          ^ TimeoutError: locator.fill: Timeout 20000ms exceeded.
  65  |     await page.getByLabel(/last name/i).fill(testData.userLastName);
  66  |     await page.getByLabel(/^email/i).fill(email);
  67  |     await page.getByLabel(/role/i).selectOption('STUDENT');
  68  | 
  69  |     await page.getByRole('button', { name: /^add user$/i }).click();
  70  | 
  71  |     // Așteptăm să se închidă modalul
  72  |     await expect(page.getByRole('heading', { name: /add user/i })).not.toBeVisible({ timeout: 15_000 });
  73  | 
  74  |     // Căutăm userul adăugat
  75  |     await page.getByPlaceholder(/search by name or email/i).fill(email);
  76  |     await expect(page.getByText(email)).toBeVisible({ timeout: 15_000 });
  77  |   });
  78  | 
  79  |   // TEST 5 — admin can add and delete user
  80  |   test('admin can add and then delete a user', async ({ page }) => {
  81  |     const email = `${uniqueName('delete-user').toLowerCase()}@example.com`;
  82  | 
  83  |     await page.getByRole('button', { name: /add user/i }).click();
  84  |     await expect(page.getByRole('heading', { name: /add user/i })).toBeVisible({ timeout: 10_000 });
  85  | 
  86  |     await page.getByLabel(/first name/i).fill('Delete');
  87  |     await page.getByLabel(/last name/i).fill('Candidate');
  88  |     await page.getByLabel(/^email/i).fill(email);
  89  |     await page.getByLabel(/role/i).selectOption('STUDENT');
  90  | 
  91  |     await page.getByRole('button', { name: /^add user$/i }).click();
  92  |     await expect(page.getByRole('heading', { name: /add user/i })).not.toBeVisible({ timeout: 15_000 });
  93  | 
  94  |     // Căutăm userul
  95  |     await page.getByPlaceholder(/search by name or email/i).fill(email);
  96  |     await expect(page.getByText(email)).toBeVisible({ timeout: 15_000 });
  97  | 
  98  |     // Confirm dialog ÎNAINTE de click pe delete
  99  |     page.once('dialog', dialog => dialog.accept());
  100 | 
  101 |     // Click pe butonul delete din rândul userului
  102 |     const row = page.getByRole('row').filter({ hasText: email });
  103 |     await row.getByRole('button', { name: /delete/i }).click();
  104 | 
  105 |     // Userul dispare
  106 |     await expect(page.getByText(email)).not.toBeVisible({ timeout: 15_000 });
  107 |   });
  108 | });
  109 | 
```