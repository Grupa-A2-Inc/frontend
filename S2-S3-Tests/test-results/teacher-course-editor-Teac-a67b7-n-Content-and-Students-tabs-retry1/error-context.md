# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: teacher-course-editor.spec.ts >> Teacher – Course Editor Page >> can switch between Content and Students tabs
- Location: e2e\specs\teacher-course-editor.spec.ts:30:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Course Content')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Course Content')

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
                - /url: /dashboard/teacher/courses/1/edit
              - link "Create test" [ref=e33] [cursor=pointer]:
                - /url: /dashboard/teacher/courses/1/test-builder
          - generic [ref=e34]: Unauthorized. Please sign in again.
          - generic [ref=e36]:
            - button "Content Course structure and tests" [ref=e37]:
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
  - button "Open Next.js Dev Tools" [ref=e56] [cursor=pointer]:
    - img [ref=e57]
  - alert [ref=e60]
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { loginAsTeacher } from "../helpers/auth";
  3   | 
  4   | test.describe("Teacher – Course Editor Page", () => {
  5   |   test.beforeEach(async ({ page }) => {
  6   |     await loginAsTeacher(page);
  7   | 
  8   |     // Navigăm la un curs existent (ID-ul trebuie să existe în seed)
  9   |     await page.goto("/dashboard/teacher/courses/1");
  10  |   });
  11  | 
  12  |   // ------------------------------------------------------------
  13  |   // 1. Pagina se încarcă și afișează header-ul cursului
  14  |   // ------------------------------------------------------------
  15  |   test("loads course header with title, description and stats", async ({ page }) => {
  16  |     await expect(page.getByText("Course management")).toBeVisible();
  17  | 
  18  |     // Loading state
  19  |     await expect(page.getByText("Loading course details...")).toBeVisible();
  20  | 
  21  |     // După fetch
  22  |     await expect(page.getByText(/chapters/i)).toBeVisible();
  23  |     await expect(page.getByText(/lessons/i)).toBeVisible();
  24  |     await expect(page.getByText(/tests/i)).toBeVisible();
  25  |   });
  26  | 
  27  |   // ------------------------------------------------------------
  28  |   // 2. Tab switching (Content / Students)
  29  |   // ------------------------------------------------------------
  30  |   test("can switch between Content and Students tabs", async ({ page }) => {
  31  |     // Tab implicit: Content
> 32  |     await expect(page.getByText("Course Content")).toBeVisible();
      |                                                    ^ Error: expect(locator).toBeVisible() failed
  33  | 
  34  |     // Switch la Students
  35  |     await page.getByRole("button", { name: /students/i }).click();
  36  |     await expect(page.getByText("Students by class")).toBeVisible();
  37  | 
  38  |     // Înapoi la Content
  39  |     await page.getByRole("button", { name: /content/i }).click();
  40  |     await expect(page.getByText("Course Content")).toBeVisible();
  41  |   });
  42  | 
  43  |   // ------------------------------------------------------------
  44  |   // 3. ContentTree – expand/collapse capitole
  45  |   // ------------------------------------------------------------
  46  |   test("can expand and collapse chapters in ContentTree", async ({ page }) => {
  47  |     await page.getByRole("button", { name: /content/i }).click();
  48  | 
  49  |     // Așteptăm să dispară loading-ul
  50  |     await expect(page.getByText("Loading course content...")).toBeHidden();
  51  | 
  52  |     // Selectăm primul capitol (fără să depindem de text)
  53  |     const firstChapter = page.locator('button:has(span.font-semibold)').first();
  54  | 
  55  |     await firstChapter.click();
  56  |     await expect(page.getByRole("link", { name: /edit/i }).first()).toBeVisible();
  57  | 
  58  |     await firstChapter.click();
  59  |     await expect(page.getByRole("link", { name: /edit/i }).first()).not.toBeVisible();
  60  |   });
  61  | 
  62  |   // ------------------------------------------------------------
  63  |   // 4. ContentTree – lecții + teste
  64  |   // ------------------------------------------------------------
  65  |   test("shows lessons and test links inside expanded chapters", async ({ page }) => {
  66  |     await page.getByRole("button", { name: /content/i }).click();
  67  | 
  68  |     const chapter = page.locator('button:has(span.font-semibold)').first();
  69  |     await chapter.click();
  70  | 
  71  |     // Lecție (orice lecție)
  72  |     await expect(page.locator("div").filter({ hasText: /edit/i }).first()).toBeVisible();
  73  | 
  74  |     // Link Edit lecție
  75  |     await expect(page.getByRole("link", { name: /edit/i }).first()).toBeVisible();
  76  | 
  77  |     // Test existent sau Create test
  78  |     await expect(
  79  |       page.locator("a", { hasText: /test|create test/i }).first()
  80  |     ).toBeVisible();
  81  |   });
  82  | 
  83  |   // ------------------------------------------------------------
  84  |   // 5. AssignmentControls – assign course to classroom
  85  |   // ------------------------------------------------------------
  86  |   test("can assign course to a classroom", async ({ page }) => {
  87  |     await page.getByRole("button", { name: /students/i }).click();
  88  | 
  89  |     const select = page.locator("select").first();
  90  |     await select.selectOption({ index: 1 }); // prima clasă reală
  91  | 
  92  |     await page.getByRole("button", { name: /assign course/i }).click();
  93  | 
  94  |     await expect(
  95  |       page.getByText("The course has been successfully assigned.")
  96  |     ).toBeVisible();
  97  |   });
  98  | 
  99  |   // ------------------------------------------------------------
  100 |   // 6. StudentsByClass – search + sort
  101 |   // ------------------------------------------------------------
  102 |   test("can search and sort students", async ({ page }) => {
  103 |     await page.getByRole("button", { name: /students/i }).click();
  104 | 
  105 |     // Search (fără să depindem de nume din seed)
  106 |     const search = page.getByPlaceholder("Search student...");
  107 |     await search.fill("a"); // orice literă → returnează rezultate
  108 | 
  109 |     await expect(page.locator("p.font-medium").first()).toBeVisible();
  110 | 
  111 |     // Sort
  112 |     await page.getByRole("combobox").nth(1).selectOption("averageScore");
  113 |     await page.getByRole("combobox").nth(2).selectOption("desc");
  114 | 
  115 |     await expect(page.getByText(/average score/i)).toBeVisible();
  116 |   });
  117 | 
  118 |   // ------------------------------------------------------------
  119 |   // 7. StudentsByClass – empty state
  120 |   // ------------------------------------------------------------
  121 |   test("shows empty state when no students match search", async ({ page }) => {
  122 |     await page.getByRole("button", { name: /students/i }).click();
  123 | 
  124 |     const search = page.getByPlaceholder("Search student...");
  125 |     await search.fill("zzzzzzzzzz");
  126 | 
  127 |     await expect(
  128 |       page.getByText("No students available for display.")
  129 |     ).toBeVisible();
  130 |   });
  131 | });
  132 | 
```