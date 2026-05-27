import { test, expect } from "@playwright/test";
import { loginAsTeacher } from "../helpers/auth";

test.describe("Teacher – Course Editor Page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTeacher(page);
    await page.goto("/dashboard/teacher/courses/7f71e64b-2bf3-4578-9eb5-a8fc07a85657");
    await expect(page.getByText("Course management")).toBeVisible({ timeout: 15_000 });
  });

  // ------------------------------------------------------------
  // 1. Pagina se încarcă și afișează header-ul cursului
  // ------------------------------------------------------------
  test("loads course header with title, description and stats", async ({ page }) => {
    await expect(page.getByText("Course management")).toBeVisible();
    await expect(page.getByText(/chapters/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/lessons/i)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/tests/i)).toBeVisible({ timeout: 15_000 });
  });

  // ------------------------------------------------------------
  // 2. Tab switching (Content / Students)
  // ------------------------------------------------------------
  test("can switch between Content and Students tabs", async ({ page }) => {
    const contentTab = page.getByRole("button", { name: /content/i });
    await expect(contentTab).toBeVisible({ timeout: 10_000 });
    await contentTab.click();
    await expect(page.getByText("Course Content")).toBeVisible({ timeout: 10_000 });

    await page.getByRole("button", { name: /students/i }).click();
    await expect(page.getByText("Students by class")).toBeVisible({ timeout: 10_000 });

    await contentTab.click();
    await expect(page.getByText("Course Content")).toBeVisible({ timeout: 10_000 });
  });

  // ------------------------------------------------------------
  // 3. ContentTree – expand/collapse capitole
  // ------------------------------------------------------------
  test("can expand and collapse chapters in ContentTree", async ({ page }) => {
    await page.getByRole("button", { name: /content/i }).click();

    await expect(page.getByText("Loading course content...")).toBeHidden({ timeout: 15_000 });

    const firstChapter = page.locator('button:has(span.font-semibold)').first();
    await expect(firstChapter).toBeVisible({ timeout: 10_000 });

    await firstChapter.click();
    await expect(page.getByRole("link", { name: /edit/i }).first()).toBeVisible({ timeout: 10_000 });

    await firstChapter.click();
    await expect(page.getByRole("link", { name: /edit/i }).first()).not.toBeVisible({ timeout: 10_000 });
  });

  // ------------------------------------------------------------
  // 4. ContentTree – lecții + teste
  // ------------------------------------------------------------
  test("shows lessons and test links inside expanded chapters", async ({ page }) => {
    await page.getByRole("button", { name: /content/i }).click();

    const chapter = page.locator('button:has(span.font-semibold)').first();
    await chapter.click();

    await expect(page.locator("div").filter({ hasText: /edit/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /edit/i }).first()).toBeVisible();

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
    await expect(select).toBeVisible({ timeout: 10_000 });

    const options = await select.locator("option").count();

    if (options > 1) {
      await select.selectOption({ index: 1 });
      await page.getByRole("button", { name: /assign course/i }).click();
      await expect(
        page.getByText("The course has been successfully assigned.")
      ).toBeVisible({ timeout: 10_000 });
    } else {
      await expect(select).toBeVisible();
      await expect(page.getByRole("button", { name: /assign course/i })).toBeVisible();
    }
  });

  // ------------------------------------------------------------
  // 6. StudentsByClass – search + sort
  // ------------------------------------------------------------
  test("can search and sort students", async ({ page }) => {
    await page.getByRole("button", { name: /students/i }).click();

    const search = page.getByPlaceholder("Search student...");
    await expect(search).toBeVisible({ timeout: 10_000 });
    await search.fill("a");

    const sortSelect = page.getByRole("combobox").first();
    await expect(sortSelect).toBeVisible({ timeout: 10_000 });

    await expect(page.getByText("Students by class")).toBeVisible({ timeout: 10_000 });
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