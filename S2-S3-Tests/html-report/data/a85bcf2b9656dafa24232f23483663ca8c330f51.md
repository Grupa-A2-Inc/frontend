# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: teacher-course-editor.spec.ts >> Teacher – Course Editor Page >> can search and sort students
- Location: e2e\specs\teacher-course-editor.spec.ts:102:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByText(/average score/i)
Expected: visible
Received: hidden
Timeout:  10000ms

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText(/average score/i)
    13 × locator resolved to <option value="averageScore">Average score</option>
       - unexpected value "hidden"

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
          - generic [ref=e50]:
            - generic [ref=e51]:
              - generic [ref=e52]:
                - heading "Assignment controls" [level=2] [ref=e53]
                - paragraph [ref=e54]: Assign the course to a classroom. In the backend, course access is linked through classroom assignment.
              - generic [ref=e55]:
                - img [ref=e56]
                - generic [ref=e58]: Unauthorized. Please sign in again.
              - generic [ref=e59]:
                - combobox [ref=e60]:
                  - option "Select a classroom" [selected]
                - button "Assign course" [disabled] [ref=e61]:
                  - img [ref=e62]
                  - text: Assign course
            - generic [ref=e63]:
              - generic [ref=e64]:
                - generic [ref=e65]:
                  - img [ref=e67]
                  - generic [ref=e72]:
                    - heading "Students by class" [level=2] [ref=e73]
                    - paragraph [ref=e74]: 0 students displayed in 0 classes.
                - generic [ref=e75]:
                  - generic [ref=e76]:
                    - img
                    - textbox "Search student..." [active] [ref=e77]: a
                  - combobox [ref=e78]:
                    - option "Name / email"
                    - option "Progress"
                    - option "Average score" [selected]
                    - option "Passed tests"
                  - combobox [ref=e79]:
                    - option "Asc"
                    - option "Desc" [selected]
              - generic [ref=e80]: Unauthorized. Please sign in again.
              - generic [ref=e81]:
                - paragraph [ref=e82]: No students available for display.
                - paragraph [ref=e83]: Assign the course to a class or modify the search filter.
  - button "Open Next.js Dev Tools" [ref=e89] [cursor=pointer]:
    - img [ref=e90]
  - alert [ref=e93]
```

# Test source

```ts
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
  32  |     await expect(page.getByText("Course Content")).toBeVisible();
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
> 115 |     await expect(page.getByText(/average score/i)).toBeVisible();
      |                                                    ^ Error: expect(locator).toBeVisible() failed
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