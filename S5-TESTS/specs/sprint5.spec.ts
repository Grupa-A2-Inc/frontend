import { test, expect, Page } from "@playwright/test";

function url(path: string) {
  return path;
}

const STUDENT_EMAIL = "dfdavidqd7@gmail.com";
const STUDENT_PASSWORD = "studentdoe123";
const TEACHER_EMAIL = "roxana.basarab7@gmail.com";
const TEACHER_PASSWORD = "teacher123";

async function login(page: Page, email: string, password: string) {
  await page.context().clearCookies();
  await page.goto(url("/login"), { waitUntil: "domcontentloaded" });

  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  await page.locator('input[type="email"]').waitFor({ state: "visible", timeout: 10000 });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  await Promise.all([
    page.waitForURL(/dashboard/, { timeout: 30000 }),
    page.locator('button[type="submit"]').click(),
  ]);
}

async function getFirstTeacherCourseUrl(page: Page): Promise<string> {
  await page.goto(url("/dashboard/teacher"), { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

  const links = await page.locator('a[href*="/dashboard/teacher/courses/"]').all();

  for (const link of links) {
    const href = (await link.getAttribute("href")) ?? "";
    const segment = href.split("/courses/")[1]?.split("/")[0] ?? "";
    if (segment.length >= 32) return href;
  }

  return "";
}

async function getFirstStudentCourseUrl(page: Page): Promise<string> {
  await page.goto(url("/dashboard/student"), { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});

  const view = page.locator("text=View").first();

  if ((await view.count()) === 0) return "";

  await view.click();
  await page.waitForURL(/\/dashboard\/student\/courses\//, { timeout: 15000 });

  return new URL(page.url()).pathname;
}

test.describe("Sprint 5 E2E — Teacher Generated Test Flow", () => {
  test("teacher: course page has Create test", async ({ page }) => {
    await login(page, TEACHER_EMAIL, TEACHER_PASSWORD);

    const courseHref = await getFirstTeacherCourseUrl(page);
    expect(courseHref).toBeTruthy();

    await page.goto(url(courseHref), { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("link", { name: /create test/i })).toBeVisible({
      timeout: 15000,
    });
  });

  test("teacher: Create test navigates to test-builder", async ({ page }) => {
    await login(page, TEACHER_EMAIL, TEACHER_PASSWORD);

    const courseHref = await getFirstTeacherCourseUrl(page);
    expect(courseHref).toBeTruthy();

    await page.goto(url(courseHref), { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /create test/i }).click();

    await expect(page).toHaveURL(/test-builder/, { timeout: 15000 });
  });

  test("teacher: test-builder shows AI Test Editor", async ({ page }) => {
    await login(page, TEACHER_EMAIL, TEACHER_PASSWORD);

    const courseHref = await getFirstTeacherCourseUrl(page);
    expect(courseHref).toBeTruthy();

    await page.goto(url(`${courseHref}/test-builder`), { waitUntil: "domcontentloaded" });

    await expect(page.getByText(/ai test editor/i)).toBeVisible({ timeout: 15000 });
  });

  test("teacher: test-builder shows Generate AI button", async ({ page }) => {
    await login(page, TEACHER_EMAIL, TEACHER_PASSWORD);

    const courseHref = await getFirstTeacherCourseUrl(page);
    expect(courseHref).toBeTruthy();

    await page.goto(url(`${courseHref}/test-builder`), { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("button", { name: /generate ai/i })).toBeVisible({
      timeout: 15000,
    });
  });

  test("teacher: test-builder shows source content selector", async ({ page }) => {
    await login(page, TEACHER_EMAIL, TEACHER_PASSWORD);

    const courseHref = await getFirstTeacherCourseUrl(page);
    expect(courseHref).toBeTruthy();

    await page.goto(url(`${courseHref}/test-builder`), { waitUntil: "domcontentloaded" });

    await expect(page.getByText(/source content/i)).toBeVisible({ timeout: 15000 });
    await expect(page.locator("select").first()).toBeVisible({ timeout: 15000 });
  });

  test("teacher: test-builder shows question count input", async ({ page }) => {
    await login(page, TEACHER_EMAIL, TEACHER_PASSWORD);

    const courseHref = await getFirstTeacherCourseUrl(page);
    expect(courseHref).toBeTruthy();

    await page.goto(url(`${courseHref}/test-builder`), { waitUntil: "domcontentloaded" });

    await expect(page.getByText(/questions/i)).toBeVisible({ timeout: 15000 });
    await expect(page.locator('input[type="number"]')).toBeVisible({ timeout: 15000 });
  });

  test("teacher: Back to course works from test-builder", async ({ page }) => {
    await login(page, TEACHER_EMAIL, TEACHER_PASSWORD);

    const courseHref = await getFirstTeacherCourseUrl(page);
    expect(courseHref).toBeTruthy();

    await page.goto(url(`${courseHref}/test-builder`), { waitUntil: "domcontentloaded" });
    await page.getByRole("link", { name: /back to course/i }).click();

    await expect(page).toHaveURL(
      new RegExp(courseHref.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      { timeout: 15000 }
    );
  });

  test("teacher: Students tab shows Assignment controls", async ({ page }) => {
    await login(page, TEACHER_EMAIL, TEACHER_PASSWORD);

    const courseHref = await getFirstTeacherCourseUrl(page);
    expect(courseHref).toBeTruthy();

    await page.goto(url(courseHref), { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /students/i }).click();

    await expect(page.getByText(/assignment controls/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("button", { name: /assign course/i })).toBeVisible({
      timeout: 15000,
    });
  });

  test("teacher: Students tab shows Students by class", async ({ page }) => {
    await login(page, TEACHER_EMAIL, TEACHER_PASSWORD);

    const courseHref = await getFirstTeacherCourseUrl(page);
    expect(courseHref).toBeTruthy();

    await page.goto(url(courseHref), { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: /students/i }).click();

    await expect(page.getByText(/students by class/i)).toBeVisible({ timeout: 15000 });
  });


  test("student: can view test results only after submitted attempt exists", async ({ page }) => {
    test.skip(true, "No submitted test attempt available for this student yet");
  });

  test("student: can open Take Test if published test exists", async ({ page }) => {
    await login(page, STUDENT_EMAIL, STUDENT_PASSWORD);

    const courseHref = await getFirstStudentCourseUrl(page);

    if (!courseHref) {
      test.skip(true, "No courses assigned to student");
      return;
    }

    await page.goto(url(courseHref), { waitUntil: "domcontentloaded" });

    const takeTestLink = page.getByRole("link", { name: /take test/i });

    if ((await takeTestLink.count()) === 0) {
      test.skip(true, "No published test available for this student course");
      return;
    }

    await takeTestLink.first().click();

    await expect(page).toHaveURL(/\/take/, { timeout: 15000 });
  });

  

  test("teacher: analytics page should open after a published test exists", async ({ page }) => {
    test.skip(true, "No published test available yet for analytics flow");
  });

  test("teacher: AI generation creates draft questions - expected backend issue", async ({
    page,
  }) => {
    await login(page, TEACHER_EMAIL, TEACHER_PASSWORD);

    const courseHref = await getFirstTeacherCourseUrl(page);
    expect(courseHref).toBeTruthy();

    await page.goto(url(`${courseHref}/test-builder`), {
      waitUntil: "domcontentloaded",
    });

    // Fail rapid, fără să aștepte AI-ul real
    expect(
      false,
      "AI generation currently remains PENDING / not fully integrated"
    ).toBeTruthy();
  });

  test("student: Take Test button is available after published test - expected missing data", async ({
    page,
  }) => {
    await login(page, STUDENT_EMAIL, STUDENT_PASSWORD);

    const courseHref = await getFirstStudentCourseUrl(page);

    if (!courseHref) {
      test.skip(true, "No courses assigned to student");
      return;
    }

    await page.goto(url(courseHref), { waitUntil: "domcontentloaded" });

    const takeTestLink = page.getByRole("link", { name: /take test/i });

    // Fail rapid dacă nu există test publicat
    expect(
      await takeTestLink.count(),
      "No published Take Test button found"
    ).toBeGreaterThan(0);
  });

  test("student: submit test should redirect to results page", async ({ page }) => {
    test.skip(true, "No published test/attempt available for this student yet");
  });

  test("teacher: generated questions should appear after AI generation", async () => {
    expect(false).toBeTruthy();
  });
});