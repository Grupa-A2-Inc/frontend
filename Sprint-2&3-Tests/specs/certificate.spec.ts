import { expect, test, type Page, type Route } from "@playwright/test";

const COURSE_ID = "11111111-1111-4111-8111-111111111111";
const OTHER_COURSE_ID = "22222222-2222-4222-8222-222222222222";
const ENROLLMENT_ID = "33333333-3333-4333-8333-333333333333";
const BASE_URL = process.env.E2E_BASE_URL ?? "https://frontend-teal-five-57.vercel.app";

const student = {
  id: "44444444-4444-4444-8444-444444444444",
  firstName: "Certificate",
  lastName: "Student",
  email: "certificate.student@example.com",
  role: "STUDENT",
  status: "ACTIVE",
  organizationId: "55555555-5555-4555-8555-555555555555",
  organizationName: "AdaptiveTutor Academy",
  organizationType: "School",
  country: "Romania",
  city: "Bucharest",
  organizationPhoneNumber: "+40700000000",
  organizationAddress: "Certificate Street",
};

type EnrollmentOptions = {
  completed?: boolean;
  completedAt?: string | null;
};

function enrollmentCourse({
  completed = true,
  completedAt = completed ? "2026-05-25T10:00:00.000Z" : null,
}: EnrollmentOptions = {}) {
  return {
    unrollmentId: ENROLLMENT_ID,
    courseId: COURSE_ID,
    courseTitle: "Advanced Algebra",
    courseCategory: "Mathematics",
    enrolledAt: "2026-05-01T10:00:00.000Z",
    progressPercent: completed ? 100 : 40,
    completedAt,
  };
}

function courseDetails(visibility: "PUBLIC" | "PRIVATE") {
  return {
    id: COURSE_ID,
    title: "Advanced Algebra",
    description: "Build algebra mastery.",
    category: "Mathematics",
    status: "PUBLISHED",
    visibility,
    createdAt: "2026-05-01T10:00:00.000Z",
    chapters: [],
  };
}

async function json(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

async function seedStudentSession(page: Page) {
  await page.context().addCookies([
    { name: "accessToken", value: "e2e-student-token", url: BASE_URL },
    { name: "role", value: "STUDENT", url: BASE_URL },
  ]);

  await page.addInitScript((user) => {
    localStorage.setItem("accessToken", "e2e-student-token");
    localStorage.setItem("user", JSON.stringify(user));
  }, student);
}

async function mockDashboard(
  page: Page,
  options: { completed?: boolean; completedAt?: string | null; visibility?: "PUBLIC" | "PRIVATE" } = {}
) {
  const { completed = true, completedAt, visibility = "PUBLIC" } = options;

  await page.route("**/api/v1/students/me/courses?*", async (route) => {
    await json(route, {
      content: [enrollmentCourse({ completed, completedAt })],
      totalPages: 1,
      totalElements: 1,
      numberOfElements: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false,
    });
  });

  await page.route("**/api/v1/courses/public?*", async (route) => {
    await json(route, {
      content: [],
      totalPages: 0,
      totalElements: 0,
      numberOfElements: 0,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: true,
    });
  });

  await page.route(`**/api/v1/courses/${COURSE_ID}/full-view`, async (route) => {
    await json(route, courseDetails(visibility));
  });
}

test.describe("Student certificate PDF", () => {
  test.beforeEach(async ({ page }) => {
    await seedStudentSession(page);
  });

  test("downloads a certificate for a completed public course card", async ({ page }) => {
    await mockDashboard(page);
    await page.route(`**/api/v1/enrollments/${ENROLLMENT_ID}/certificat`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/pdf",
        body: Buffer.from("%PDF-1.4 AdaptiveTutor certificate"),
      });
    });

    await page.goto("/dashboard/student");
    const button = page.getByRole("button", { name: "Download certificate" });
    await expect(button).toBeVisible();

    const downloadPromise = page.waitForEvent("download");
    await button.click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe("AdaptiveTutor-Advanced-Algebra-certificate.pdf");
  });

  test("does not request a certificate for a completed private course", async ({ page }) => {
    let certificateRequests = 0;
    await mockDashboard(page, { visibility: "PRIVATE" });
    await page.route(`**/api/v1/enrollments/${ENROLLMENT_ID}/certificat`, async (route) => {
      certificateRequests += 1;
      await route.fulfill({ status: 200, body: "" });
    });

    await page.goto("/dashboard/student");
    await expect(
      page.getByRole("button", { name: "Certificate unavailable for private courses" })
    ).toBeDisabled();
    expect(certificateRequests).toBe(0);
  });

  test("hides certificate on an unfinished card and explains it in course overview", async ({
    page,
  }) => {
    await mockDashboard(page, {
      completed: false,
      completedAt: "2026-05-25T10:00:00.000Z",
    });

    await page.goto("/dashboard/student");
    await expect(page.getByText("Download certificate")).toHaveCount(0);

    await page.goto(`/dashboard/student/courses/${COURSE_ID}`);
    await expect(
      page.getByText("Complete this course to unlock your certificate")
    ).toBeVisible();
  });

  test("finds a completed enrollment on a later page from direct course access", async ({
    page,
  }) => {
    const requestedPages: string[] = [];
    await page.route(`**/api/v1/courses/${COURSE_ID}/full-view`, async (route) => {
      await json(route, courseDetails("PUBLIC"));
    });
    await page.route("**/api/v1/students/me/courses?*", async (route) => {
      const pageNumber = new URL(route.request().url()).searchParams.get("page") ?? "0";
      requestedPages.push(pageNumber);
      const content =
        pageNumber === "1"
          ? [enrollmentCourse()]
          : [
              {
                ...enrollmentCourse(),
                unrollmentId: "66666666-6666-4666-8666-666666666666",
                courseId: OTHER_COURSE_ID,
              },
            ];

      await json(route, {
        content,
        totalPages: 2,
        totalElements: 2,
        numberOfElements: 1,
        size: 50,
        number: Number(pageNumber),
        first: pageNumber === "0",
        last: pageNumber === "1",
        empty: false,
      });
    });

    await page.goto(`/dashboard/student/courses/${COURSE_ID}`);
    await expect(page.getByRole("button", { name: "Download certificate" })).toBeVisible();
    expect(requestedPages).toContain("0");
    expect(requestedPages).toContain("1");
    expect(requestedPages.indexOf("1")).toBeGreaterThan(requestedPages.indexOf("0"));
  });

  for (const response of [
    { status: 403, message: "This certificate is not available for this course." },
    { status: 404, message: "Your course enrollment could not be found." },
  ]) {
    test(`shows a retry action when download responds with ${response.status}`, async ({
      page,
    }) => {
      await mockDashboard(page);
      await page.route(`**/api/v1/enrollments/${ENROLLMENT_ID}/certificat`, async (route) => {
        await route.fulfill({ status: response.status, contentType: "application/json", body: "{}" });
      });

      await page.goto("/dashboard/student");
      await page.getByRole("button", { name: "Download certificate" }).click();

      await expect(page.locator('p[role="alert"]')).toContainText(response.message);
      await expect(page.getByRole("button", { name: "Retry certificate" })).toBeVisible();
    });
  }
});
