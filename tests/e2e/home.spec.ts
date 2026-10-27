import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");

  // Start every test with clean Planora work data.
  await page.evaluate(() => {
    localStorage.removeItem("planora:tasks");
    localStorage.removeItem("planora:pomodoro-sessions");
    localStorage.removeItem("planora:pomodoro-settings");
  });

  await page.reload();
});

test("opens on Home by default", async ({ page }) => {
  await expect(
    page.getByText("What do you want to move forward today?"),
  ).toBeVisible();

  await expect(
    page.getByRole("button", {
      name: "Home",
    }),
  ).toBeVisible();
});

test("Plan my day navigates to Today", async ({ page }) => {
  await page
    .getByRole("button", {
      name: "Plan my day",
    })
    .click();

  await expect(
    page
      .getByText("Today", {
        exact: true,
      })
      .first(),
  ).toBeVisible();
});

test(
  "Start focusing opens task chooser when there is no current focus task",
  async ({ page }) => {
    // Go to Today.
    await page
      .getByRole("button", {
        name: "Plan my day",
      })
      .click();

    // Create a pending task.
    await page
      .getByRole("button", {
        name: "New Task",
      })
      .click();

    await page
      .getByLabel(/Task title/i)
      .fill("Playwright test task");

    await page
      .getByRole("button", {
        name: "Create Task",
      })
      .click();

    // Return Home.
    await page
      .getByRole("button", {
        name: "Home",
      })
      .click();

    // Start focusing from Home.
    await page
      .getByRole("button", {
        name: "Start focusing",
      })
      .click();

    // The chooser should open instead of redirecting to Today.
    const dialog =
      page.getByRole("dialog");

    await expect(
      dialog,
    ).toBeVisible();

    await expect(
      dialog.getByRole("heading", {
        name: "Choose a task",
      }),
    ).toBeVisible();

    await expect(
      dialog.getByText(
        "Playwright test task",
        {
          exact: true,
        },
      ),
    ).toBeVisible();
  },
);