import { test } from "@playwright/test";

test("Page Screenshot", async ({ page }) => {
  await page.goto("https://playwright.dev/");
  await page.screenshot({ path: `example.png` });
});
