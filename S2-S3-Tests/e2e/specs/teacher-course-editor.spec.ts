import { test, expect } from "@playwright/test";
import { loginAsTeacher } from "../helpers/auth";

test.describe("Teacher – Course Editor Page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);

    // Navigăm la un curs existent (ID-ul trebuie să existe în seed)
    await page.goto("/dashboard/teacher/courses/1");
  });

  // ------------------------------------------------------------
  // 1. Pagina se încarcă și afișează header-ul cursului
  // ------------------------------------------------------------
  test("loads course header with title, description and stats", async ({ page }) => {
    await expect(page.getByText("Course management")).toBeVisible();

    // Loading state
    await expect(page.getByText("Loading course details...")).toBeVisible();

    // După fetch
    await expect(page.getByText(/chapters/i)).toBeVisible();
    await expect(page.getByText(/lessons/i)).toBeVisible();
    await expect(page.getByText(/tests/i)).toBeVisible();
  });

  // ------------------------------------------------------------
  // 2. Tab switching (Content / Students)
  // ------------------------------------------------------------
  test("can switch between Content and Students tabs", async ({ page }) => {
    // Tab implicit: Content
    await expect(page.getByText("Course Content")).toBeVisible();

    // Switch la Students
    await page.getByRole("button", { name: /students/i }).click();
    await expect(page.getByText("Students by class")).toBeVisible();

    // Înapoi la Content
    await page.getByRole("button", { name: /content/i }).click();
    await expect(page.getByText("Course Content")).toBeVisible();
  });

  // ------------------------------------------------------------
  // 3. ContentTree – expand/collapse capitole
  // ------------------------------------------------------------
  test("can expand and collapse chapters in ContentTree", async ({ page }) => {
    await page.getByRole("button", { name: /content/i }).click();

    // Așteptăm să dispară loading-ul
    await expect(page.getByText("Loading course content...")).toBeHidden();

    // Selectăm primul capitol (fără să depindem de text)
    const firstChapter = page.locator('button:has(span.font-semibold)').first();

    await firstChapter.click();
    await expect(page.getByRole("link", { name: /edit/i }).first()).toBeVisible();

    await firstChapter.click();
    await expect(page.getByRole("link", { name: /edit/i }).first()).not.toBeVisible();
  });

  // ------------------------------------------------------------
  // 4. ContentTree – lecții + teste
  // ------------------------------------------------------------
  test("shows lessons and test links inside expanded chapters", async ({ page }) => {
    await page.getByRole("button", { name: /content/i }).click();

    const chapter = page.locator('button:has(span.font-semibold)').first();
    await chapter.click();

    // Lecție (orice lecție)
    await expect(page.locator("div").filter({ hasText: /edit/i }).first()).toBeVisible();

    // Link Edit lecție
    await expect(page.getByRole("link", { name: /edit/i }).first()).toBeVisible();

    // Test existent sau Create test
    await expect(
      page.locator("a", { hasText: /test|create test/i }).first()
    ).toBeVisible();
  });

  // ------------------------------------------------------------
  // 5. AssignmentControls – assign course to classroom
  // ------------------------------------------------------------
  test("can assign course to a classroom", async ({ page }) => {
    await page.getByRole("button", { name: /students/i }).click();

    const select = page.locator("select").first();
    await select.selectOption({ index: 1 }); // prima clasă reală

    await page.getByRole("button", { name: /assign course/i }).click();

    await expect(
      page.getByText("The course has been successfully assigned.")
    ).toBeVisible();
  });

  // ------------------------------------------------------------
  // 6. StudentsByClass – search + sort
  // ------------------------------------------------------------
  test("can search and sort students", async ({ page }) => {
    await page.getByRole("button", { name: /students/i }).click();

    // Search (fără să depindem de nume din seed)
    const search = page.getByPlaceholder("Search student...");
    await search.fill("a"); // orice literă → returnează rezultate

    await expect(page.locator("p.font-medium").first()).toBeVisible();

    // Sort
    await page.getByRole("combobox").nth(1).selectOption("averageScore");
    await page.getByRole("combobox").nth(2).selectOption("desc");

    await expect(page.getByText(/average score/i)).toBeVisible();
  });

  // ------------------------------------------------------------
  // 7. StudentsByClass – empty state
  // ------------------------------------------------------------
  test("shows empty state when no students match search", async ({ page }) => {
    await page.getByRole("button", { name: /students/i }).click();

    const search = page.getByPlaceholder("Search student...");
    await search.fill("zzzzzzzzzz");

    await expect(
      page.getByText("No students available for display.")
    ).toBeVisible();
  });
});
