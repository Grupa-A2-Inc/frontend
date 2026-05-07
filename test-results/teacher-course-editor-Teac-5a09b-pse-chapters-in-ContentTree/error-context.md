# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: teacher-course-editor.spec.ts >> Teacher – Course Editor Page >> can expand and collapse chapters in ContentTree
- Location: Sprint-2&3-Tests\specs\teacher-course-editor.spec.ts:40:7

# Error details

```
Error: expect(locator).not.toBeVisible() failed

Locator:  getByRole('link', { name: /edit/i }).first()
Expected: not visible
Received: visible
Timeout:  10000ms

Call log:
  - Expect "not toBeVisible" with timeout 10000ms
  - waiting for getByRole('link', { name: /edit/i }).first()
    13 × locator resolved to <a href="/dashboard/teacher/courses/7f71e64b-2bf3-4578-9eb5-a8fc07a85657/edit" class="rounded-xl border border-brand-border bg-brand-card px-4 py-2 text-sm font-semibold text-brand-text shadow-sm transition hover:bg-brand-bg">Edit course</a>
       - unexpected value "visible"

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
      - main [ref=e22]:
        - generic [ref=e23]:
          - generic [ref=e24]:
            - generic [ref=e25]:
              - link "Back to my courses" [ref=e26] [cursor=pointer]:
                - /url: /dashboard/teacher
                - img [ref=e27]
                - text: Back to my courses
              - heading "Course management" [level=1] [ref=e29]
              - paragraph [ref=e30]: Manage content, tests, and student access for the selected course.
            - generic [ref=e31]:
              - link "Edit course" [ref=e32] [cursor=pointer]:
                - /url: /dashboard/teacher/courses/7f71e64b-2bf3-4578-9eb5-a8fc07a85657/edit
              - link "Create test" [ref=e33] [cursor=pointer]:
                - /url: /dashboard/teacher/courses/7f71e64b-2bf3-4578-9eb5-a8fc07a85657/test-builder
          - generic [ref=e34]: Unauthorized. Please sign in again.
          - generic [ref=e36]:
            - button "Content Course structure and tests" [active] [ref=e37]:
              - img [ref=e39]
              - generic [ref=e41]:
                - generic [ref=e42]: Content
                - text: Course structure and tests
            - button "Students Classes, students, results, and access" [ref=e43]:
              - img [ref=e45]
              - generic [ref=e48]:
                - generic [ref=e49]: Students
                - text: Classes, students, results, and access
          - generic [ref=e50]: Unauthorized. Please sign in again.
  - alert [ref=e51]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { loginAsTeacher } from "../helpers/auth";
  3   | 
  4   | test.describe("Teacher – Course Editor Page", () => {
  5   |   test.beforeEach(async ({ page }) => {
  6   |     await loginAsTeacher(page);
  7   |     await page.goto("/dashboard/teacher/courses/7f71e64b-2bf3-4578-9eb5-a8fc07a85657");
  8   |     await expect(page.getByText("Course management")).toBeVisible({ timeout: 15_000 });
  9   |   });
  10  | 
  11  |   // ------------------------------------------------------------
  12  |   // 1. Pagina se încarcă și afișează header-ul cursului
  13  |   // ------------------------------------------------------------
  14  |   test("loads course header with title, description and stats", async ({ page }) => {
  15  |     await expect(page.getByText("Course management")).toBeVisible();
  16  |     await expect(page.getByText(/chapters/i)).toBeVisible({ timeout: 15_000 });
  17  |     await expect(page.getByText(/lessons/i)).toBeVisible({ timeout: 15_000 });
  18  |     await expect(page.getByText(/tests/i)).toBeVisible({ timeout: 15_000 });
  19  |   });
  20  | 
  21  |   // ------------------------------------------------------------
  22  |   // 2. Tab switching (Content / Students)
  23  |   // ------------------------------------------------------------
  24  |   test("can switch between Content and Students tabs", async ({ page }) => {
  25  |     const contentTab = page.getByRole("button", { name: /content/i });
  26  |     await expect(contentTab).toBeVisible({ timeout: 10_000 });
  27  |     await contentTab.click();
  28  |     await expect(page.getByText("Course Content")).toBeVisible({ timeout: 10_000 });
  29  | 
  30  |     await page.getByRole("button", { name: /students/i }).click();
  31  |     await expect(page.getByText("Students by class")).toBeVisible({ timeout: 10_000 });
  32  | 
  33  |     await contentTab.click();
  34  |     await expect(page.getByText("Course Content")).toBeVisible({ timeout: 10_000 });
  35  |   });
  36  | 
  37  |   // ------------------------------------------------------------
  38  |   // 3. ContentTree – expand/collapse capitole
  39  |   // ------------------------------------------------------------
  40  |   test("can expand and collapse chapters in ContentTree", async ({ page }) => {
  41  |     await page.getByRole("button", { name: /content/i }).click();
  42  | 
  43  |     await expect(page.getByText("Loading course content...")).toBeHidden({ timeout: 15_000 });
  44  | 
  45  |     const firstChapter = page.locator('button:has(span.font-semibold)').first();
  46  |     await expect(firstChapter).toBeVisible({ timeout: 10_000 });
  47  | 
  48  |     await firstChapter.click();
  49  |     await expect(page.getByRole("link", { name: /edit/i }).first()).toBeVisible({ timeout: 10_000 });
  50  | 
  51  |     await firstChapter.click();
> 52  |     await expect(page.getByRole("link", { name: /edit/i }).first()).not.toBeVisible({ timeout: 10_000 });
      |                                                                         ^ Error: expect(locator).not.toBeVisible() failed
  53  |   });
  54  | 
  55  |   // ------------------------------------------------------------
  56  |   // 4. ContentTree – lecții + teste
  57  |   // ------------------------------------------------------------
  58  |   test("shows lessons and test links inside expanded chapters", async ({ page }) => {
  59  |     await page.getByRole("button", { name: /content/i }).click();
  60  | 
  61  |     const chapter = page.locator('button:has(span.font-semibold)').first();
  62  |     await chapter.click();
  63  | 
  64  |     await expect(page.locator("div").filter({ hasText: /edit/i }).first()).toBeVisible();
  65  |     await expect(page.getByRole("link", { name: /edit/i }).first()).toBeVisible();
  66  | 
  67  |     await expect(
  68  |       page.locator("a", { hasText: /test|create test/i }).first()
  69  |     ).toBeVisible();
  70  |   });
  71  | 
  72  |   // ------------------------------------------------------------
  73  |   // 5. AssignmentControls – assign course to classroom
  74  |   // ------------------------------------------------------------
  75  |   test("can assign course to a classroom", async ({ page }) => {
  76  |     await page.getByRole("button", { name: /students/i }).click();
  77  | 
  78  |     const select = page.locator("select").first();
  79  |     await expect(select).toBeVisible({ timeout: 10_000 });
  80  | 
  81  |     const options = await select.locator("option").count();
  82  | 
  83  |     if (options > 1) {
  84  |       await select.selectOption({ index: 1 });
  85  |       await page.getByRole("button", { name: /assign course/i }).click();
  86  |       await expect(
  87  |         page.getByText("The course has been successfully assigned.")
  88  |       ).toBeVisible({ timeout: 10_000 });
  89  |     } else {
  90  |       await expect(select).toBeVisible();
  91  |       await expect(page.getByRole("button", { name: /assign course/i })).toBeVisible();
  92  |     }
  93  |   });
  94  | 
  95  |   // ------------------------------------------------------------
  96  |   // 6. StudentsByClass – search + sort
  97  |   // ------------------------------------------------------------
  98  |   test("can search and sort students", async ({ page }) => {
  99  |     await page.getByRole("button", { name: /students/i }).click();
  100 | 
  101 |     const search = page.getByPlaceholder("Search student...");
  102 |     await expect(search).toBeVisible({ timeout: 10_000 });
  103 |     await search.fill("a");
  104 | 
  105 |     const sortSelect = page.getByRole("combobox").first();
  106 |     await expect(sortSelect).toBeVisible({ timeout: 10_000 });
  107 | 
  108 |     await expect(page.getByText("Students by class")).toBeVisible({ timeout: 10_000 });
  109 |   });
  110 | 
  111 |   // ------------------------------------------------------------
  112 |   // 7. StudentsByClass – empty state
  113 |   // ------------------------------------------------------------
  114 |   test("shows empty state when no students match search", async ({ page }) => {
  115 |     await page.getByRole("button", { name: /students/i }).click();
  116 | 
  117 |     const search = page.getByPlaceholder("Search student...");
  118 |     await search.fill("zzzzzzzzzz");
  119 | 
  120 |     await expect(
  121 |       page.getByText("No students available for display.")
  122 |     ).toBeVisible();
  123 |   });
  124 | });
```