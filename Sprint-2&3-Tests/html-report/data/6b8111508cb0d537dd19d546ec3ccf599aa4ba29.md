# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication >> Admin can log in successfully
- Location: Sprint-2&3-Tests\specs\auth.spec.ts:17:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /welcome to the dashboard, admin/i })
Expected: visible
Timeout: 15000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 15000ms
  - waiting for getByRole('heading', { name: /welcome to the dashboard, admin/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - alert [ref=e2]
  - generic [ref=e4]:
    - complementary [ref=e5]:
      - generic [ref=e6]:
        - img "logo" [ref=e8]
        - button "chevron_left" [ref=e9] [cursor=pointer]:
          - generic [ref=e10]: chevron_left
      - navigation [ref=e11]:
        - list [ref=e13]:
          - listitem [ref=e14]:
            - link "dashboard" [ref=e15] [cursor=pointer]:
              - /url: /dashboard/admin
              - generic [ref=e19]: dashboard
          - listitem [ref=e20]:
            - link "group" [ref=e21] [cursor=pointer]:
              - /url: /dashboard/admin/users
              - generic [ref=e25]: group
          - listitem [ref=e26]:
            - link "school" [ref=e27] [cursor=pointer]:
              - /url: /dashboard/admin/classes
              - generic [ref=e31]: school
          - listitem [ref=e32]:
            - link "settings" [ref=e33] [cursor=pointer]:
              - /url: /dashboard/admin/settings
              - generic [ref=e37]: settings
        - generic [ref=e38]:
          - link "A" [ref=e40] [cursor=pointer]:
            - /url: /dashboard/admin/profile
            - generic [ref=e41]: A
          - button "dark_mode" [ref=e42] [cursor=pointer]:
            - generic [ref=e43]: dark_mode
          - button "logout" [ref=e45] [cursor=pointer]:
            - generic [ref=e46]: logout
    - main [ref=e47]:
      - generic [ref=e48]:
        - generic [ref=e49]:
          - heading "Admin Dashboard" [level=1] [ref=e50]
          - paragraph [ref=e51]: Overview of your organization, key metrics, and quick access to main admin areas.
        - generic [ref=e52]:
          - generic [ref=e53] [cursor=pointer]:
            - paragraph [ref=e54]: Total Students
            - paragraph [ref=e55]: "0"
            - paragraph [ref=e56]: Calculated from the current user list.
          - generic [ref=e57] [cursor=pointer]:
            - paragraph [ref=e58]: Total Teachers
            - paragraph [ref=e59]: "0"
            - paragraph [ref=e60]: Calculated from the current users list.
          - generic [ref=e61] [cursor=pointer]:
            - paragraph [ref=e62]: Total Classes
            - paragraph [ref=e63]: "0"
            - paragraph [ref=e64]: Pending backend support.
          - generic [ref=e65] [cursor=pointer]:
            - paragraph [ref=e66]: Total Courses
            - paragraph [ref=e67]: "0"
            - paragraph [ref=e68]: Based on currently available courses endpoint.
        - generic [ref=e69]:
          - img [ref=e70]
          - paragraph [ref=e72]: 2 issues require your attention
        - generic [ref=e73]:
          - generic [ref=e74]:
            - generic [ref=e75]:
              - generic [ref=e76]:
                - heading "Organization Summary" [level=2] [ref=e77]
                - paragraph [ref=e78]: Basic organization information and quick editing.
              - button "Edit" [ref=e79] [cursor=pointer]
            - generic [ref=e80]:
              - generic [ref=e81]:
                - paragraph [ref=e82]: Organization Name
                - paragraph [ref=e83]: RoTest
              - generic [ref=e84]:
                - paragraph [ref=e85]: Organization Type
                - paragraph [ref=e86]: RO
              - generic [ref=e87]:
                - paragraph [ref=e88]: Country
                - paragraph [ref=e89]: Ro
              - generic [ref=e90]:
                - paragraph [ref=e91]: City
                - paragraph [ref=e92]: Ro
              - generic [ref=e93]:
                - paragraph [ref=e94]: Address
                - paragraph [ref=e95]: ro
              - generic [ref=e96]:
                - paragraph [ref=e97]: Phone Number
                - paragraph [ref=e98]: "124"
          - generic [ref=e99]:
            - generic [ref=e100]:
              - heading "Quick Links" [level=2] [ref=e101]
              - paragraph [ref=e102]: Jump to the main administration areas.
            - generic [ref=e103]:
              - link "Manage Users Create, edit, and manage teachers and students." [ref=e104] [cursor=pointer]:
                - /url: /dashboard/admin/users
                - paragraph [ref=e105]: Manage Users
                - paragraph [ref=e106]: Create, edit, and manage teachers and students.
              - link "Manage Classes View and organize classes in your organization." [ref=e107] [cursor=pointer]:
                - /url: /dashboard/admin/classes
                - paragraph [ref=e108]: Manage Classes
                - paragraph [ref=e109]: View and organize classes in your organization.
              - link "Settings Open organization settings and preferences." [ref=e110] [cursor=pointer]:
                - /url: /dashboard/admin/settings
                - paragraph [ref=e111]: Settings
                - paragraph [ref=e112]: Open organization settings and preferences.
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { clearSession, loginAsAdmin, loginAsTeacher } from '../helpers/auth';
  3  | 
  4  | // --------------------------------------------------
  5  | // SUITĂ DE TESTE: Authentication
  6  | // Această suită verifică toate scenariile de autentificare:
  7  | // - login valid pentru Admin
  8  | // - login valid pentru Teacher
  9  | // - login invalid (email/parolă greșite)
  10 | // --------------------------------------------------
  11 | 
  12 | test.describe('Authentication', () => {
  13 | 
  14 |   // --------------------------------------------------
  15 |   // TEST 1 — Login valid pentru Admin
  16 |   // --------------------------------------------------
  17 |   test('Admin can log in successfully', async ({ page }) => {
  18 | 
  19 |     // Folosim helper-ul care:
  20 |     // - curăță sesiunea
  21 |     // - navighează la /login
  22 |     // - completează email + parolă
  23 |     // - trimite formularul
  24 |     // - așteaptă redirect-ul corect
  25 |     await loginAsAdmin(page);
  26 | 
  27 |     // Verificăm că dashboard-ul Adminului s-a încărcat corect
  28 |     // (heading-ul este stabil și nu depinde de URL exact)
  29 |     await expect(
  30 |       page.getByRole('heading', { name: /welcome to the dashboard, admin/i })
> 31 |     ).toBeVisible();
     |       ^ Error: expect(locator).toBeVisible() failed
  32 |   });
  33 | 
  34 |   // --------------------------------------------------
  35 |   // TEST 2 — Login valid pentru Teacher
  36 |   // --------------------------------------------------
  37 |   test('Teacher can log in successfully', async ({ page }) => {
  38 | 
  39 |     // Login automat ca profesor
  40 |     await loginAsTeacher(page);
  41 | 
  42 |     // Verificăm că dashboard-ul profesorului s-a încărcat corect
  43 |     await expect(
  44 |       page.getByRole('heading', { name: /my courses/i })
  45 |     ).toBeVisible();
  46 |   });
  47 | 
  48 |   // --------------------------------------------------
  49 |   // TEST 3 — Login invalid (email/parolă greșite)
  50 |   // --------------------------------------------------
  51 |   test('Shows error for invalid credentials', async ({ page }) => {
  52 | 
  53 |     // Curățăm sesiunea pentru a evita interferențe
  54 |     await clearSession(page);
  55 | 
  56 |     // Navigăm manual la pagina de login
  57 |     await page.goto('/login');
  58 | 
  59 |     // Completăm email și parolă invalide
  60 |     await page.locator('input[type="email"]').fill('wrong@example.com');
  61 |     await page.locator('input[type="password"]').fill('wrong-password');
  62 | 
  63 |     // Trimitem formularul
  64 |     await page.getByRole('button', { name: /^log in$/i }).click();
  65 | 
  66 |     // Rămânem pe pagina de login
  67 |     await expect(page).toHaveURL(/\/login$/);
  68 | 
  69 |     // Verificăm afișarea unui mesaj de eroare
  70 |     // Folosim un regex robust, pentru că textul exact poate varia
  71 |     await expect(
  72 |       page.getByText(/login failed|invalid|eroare|network|server/i)
  73 |     ).toBeVisible();
  74 |   });
  75 | 
  76 | });
  77 | 
```