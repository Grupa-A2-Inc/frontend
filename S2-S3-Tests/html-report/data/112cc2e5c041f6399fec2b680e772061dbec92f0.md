# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-users.spec.ts >> Admin - user management flow >> admin can navigate to users page and see list/table state
- Location: e2e\specs\admin-users.spec.ts:16:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.waitForURL: Test timeout of 30000ms exceeded.
=========================== logs ===========================
waiting for navigation until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - img "Edu Illustration" [ref=e4]
    - generic [ref=e6]:
      - heading "Welcome back!" [level=1] [ref=e7]
      - paragraph [ref=e8]: Log in to continue your learning journey
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]: Email
          - textbox "e.g. student@school.com" [ref=e12]: roxanaioanab12@gmail.com
        - generic [ref=e13]:
          - generic [ref=e14]:
            - generic [ref=e15]: Password
            - link "Forgot password?" [ref=e16] [cursor=pointer]:
              - /url: /forgot-password
          - textbox "Enter your password" [ref=e17]: roxana123
        - paragraph [ref=e18]: "could not execute statement [ERROR: duplicate key value violates unique constraint \"refresh_token_token_hash_key\" Detail: Key (token_hash)=(7e9ec0e8c91987d3439369608b5070d82752495ecc55e812144dc130cbdb316e) already exists.] [insert into refresh_token (created_at,expires_at,revoked_at,token_hash,user_id,id) values (?,?,?,?,?,?)]; SQL [insert into refresh_token (created_at,expires_at,revoked_at,token_hash,user_id,id) values (?,?,?,?,?,?)]; constraint [refresh_token_token_hash_key]"
        - button "Log in" [ref=e19]
      - paragraph [ref=e20]:
        - text: Don't have an account?
        - link "Create account" [ref=e21] [cursor=pointer]:
          - /url: /register
  - button "Open Next.js Dev Tools" [ref=e27] [cursor=pointer]:
    - img [ref=e28]
  - alert [ref=e31]
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
> 29 |   await page.waitForURL(/dashboard\/admin/);
     |              ^ Error: page.waitForURL: Test timeout of 30000ms exceeded.
  30 | 
  31 |   await expect(
  32 |     page.getByRole('heading', { name: /welcome to the dashboard, admin/i })
  33 |   ).toBeVisible();
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