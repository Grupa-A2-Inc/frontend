# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-classes.spec.ts >> Admin - classroom management flow >> admin can search classrooms
- Location: e2e\specs\admin-classes.spec.ts:38:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /welcome to the dashboard, admin/i })
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByRole('heading', { name: /welcome to the dashboard, admin/i })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e13]:
    - complementary [ref=e14]:
      - generic [ref=e15]:
        - img "logo" [ref=e17]
        - button "chevron_left" [ref=e18] [cursor=pointer]:
          - generic [ref=e19]: chevron_left
      - navigation [ref=e20]:
        - list [ref=e22]:
          - listitem [ref=e23]:
            - link "dashboard" [ref=e24] [cursor=pointer]:
              - /url: /dashboard/admin
              - generic [ref=e28]: dashboard
          - listitem [ref=e29]:
            - link "group" [ref=e30] [cursor=pointer]:
              - /url: /dashboard/admin/users
              - generic [ref=e34]: group
          - listitem [ref=e35]:
            - link "school" [ref=e36] [cursor=pointer]:
              - /url: /dashboard/admin/classes
              - generic [ref=e40]: school
          - listitem [ref=e41]:
            - link "settings" [ref=e42] [cursor=pointer]:
              - /url: /dashboard/admin/settings
              - generic [ref=e46]: settings
        - generic [ref=e47]:
          - link "A" [ref=e49] [cursor=pointer]:
            - /url: /dashboard/admin/profile
            - generic [ref=e50]: A
          - button "dark_mode" [ref=e51] [cursor=pointer]:
            - generic [ref=e52]: dark_mode
          - button "logout" [ref=e54] [cursor=pointer]:
            - generic [ref=e55]: logout
    - main [ref=e56]:
      - generic [ref=e57]:
        - generic [ref=e58]:
          - heading "Admin Dashboard" [level=1] [ref=e59]
          - paragraph [ref=e60]: Overview of your organization, key metrics, and quick access to main admin areas.
        - generic [ref=e61]:
          - generic [ref=e62] [cursor=pointer]:
            - paragraph [ref=e63]: Total Students
            - paragraph [ref=e64]: "0"
            - paragraph [ref=e65]: Calculated from the current user list.
          - generic [ref=e66] [cursor=pointer]:
            - paragraph [ref=e67]: Total Teachers
            - paragraph [ref=e68]: "0"
            - paragraph [ref=e69]: Calculated from the current users list.
          - generic [ref=e70] [cursor=pointer]:
            - paragraph [ref=e71]: Total Classes
            - paragraph [ref=e72]: "0"
            - paragraph [ref=e73]: Pending backend support.
          - generic [ref=e74] [cursor=pointer]:
            - paragraph [ref=e75]: Total Courses
            - paragraph [ref=e76]: "0"
            - paragraph [ref=e77]: Based on currently available courses endpoint.
        - generic [ref=e78]:
          - img [ref=e79]
          - paragraph [ref=e81]: 2 issues require your attention
        - generic [ref=e82]:
          - generic [ref=e83]:
            - generic [ref=e84]:
              - generic [ref=e85]:
                - heading "Organization Summary" [level=2] [ref=e86]
                - paragraph [ref=e87]: Basic organization information and quick editing.
              - button "Edit" [ref=e88] [cursor=pointer]
            - generic [ref=e89]:
              - generic [ref=e90]:
                - paragraph [ref=e91]: Organization Name
                - paragraph [ref=e92]: RoTest
              - generic [ref=e93]:
                - paragraph [ref=e94]: Organization Type
                - paragraph [ref=e95]: RO
              - generic [ref=e96]:
                - paragraph [ref=e97]: Country
                - paragraph [ref=e98]: Ro
              - generic [ref=e99]:
                - paragraph [ref=e100]: City
                - paragraph [ref=e101]: Ro
              - generic [ref=e102]:
                - paragraph [ref=e103]: Address
                - paragraph [ref=e104]: ro
              - generic [ref=e105]:
                - paragraph [ref=e106]: Phone Number
                - paragraph [ref=e107]: "124"
          - generic [ref=e108]:
            - generic [ref=e109]:
              - heading "Quick Links" [level=2] [ref=e110]
              - paragraph [ref=e111]: Jump to the main administration areas.
            - generic [ref=e112]:
              - link "Manage Users Create, edit, and manage teachers and students." [ref=e113] [cursor=pointer]:
                - /url: /dashboard/admin/users
                - paragraph [ref=e114]: Manage Users
                - paragraph [ref=e115]: Create, edit, and manage teachers and students.
              - link "Manage Classes View and organize classes in your organization." [ref=e116] [cursor=pointer]:
                - /url: /dashboard/admin/classes
                - paragraph [ref=e117]: Manage Classes
                - paragraph [ref=e118]: View and organize classes in your organization.
              - link "Settings Open organization settings and preferences." [ref=e119] [cursor=pointer]:
                - /url: /dashboard/admin/settings
                - paragraph [ref=e120]: Settings
                - paragraph [ref=e121]: Open organization settings and preferences.
```

# Test source

```ts
  1  | import { Page, expect } from '@playwright/test';
  2  | import { testUsers } from '../fixtures/users';
  3  | 
  4  | // --------------------------------------------------
  5  | // Helper: Curăță sesiunea complet (cookies + localStorage)
  6  | // --------------------------------------------------
  7  | export async function clearSession(page: Page) {
  8  |   await page.context().clearCookies();
  9  | 
  10 |   await page.addInitScript(() => {
  11 |     localStorage.clear();
  12 |   });
  13 | }
  14 | 
  15 | // --------------------------------------------------
  16 | // Helper pentru login automat ca ADMIN
  17 | // Folosește datele din fixtures/users.ts
  18 | // --------------------------------------------------
  19 | export async function loginAsAdmin(page: Page) {
  20 |   await clearSession(page);
  21 | 
  22 |   await page.goto('/login');
  23 | 
  24 |   await page.fill('input[type="email"]', testUsers.admin.email);
  25 |   await page.fill('input[type="password"]', testUsers.admin.password);
  26 | 
  27 |   await page.getByRole('button', { name: /^log in$/i }).click();
  28 | 
  29 |   await page.waitForURL(/dashboard\/admin/);
  30 | 
  31 |   await expect(
  32 |     page.getByRole('heading', { name: /welcome to the dashboard, admin/i })
> 33 |   ).toBeVisible();
     |     ^ Error: expect(locator).toBeVisible() failed
  34 | }
  35 | 
  36 | // --------------------------------------------------
  37 | // Helper pentru login automat ca TEACHER
  38 | // Folosește datele din fixtures/users.ts
  39 | // --------------------------------------------------
  40 | export async function loginAsTeacher(page: Page) {
  41 |   await clearSession(page);
  42 | 
  43 |   await page.goto('/login');
  44 | 
  45 |   await page.fill('input[type="email"]', testUsers.teacher.email);
  46 |   await page.fill('input[type="password"]', testUsers.teacher.password);
  47 | 
  48 |   await page.getByRole('button', { name: /^log in$/i }).click();
  49 | 
  50 |   await page.waitForURL(/dashboard\/teacher/);
  51 | 
  52 |   await expect(
  53 |     page.getByRole('heading', { name: /my courses/i })
  54 |   ).toBeVisible();
  55 | }
  56 | 
```