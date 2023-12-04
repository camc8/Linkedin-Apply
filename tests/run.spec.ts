import { test } from "@playwright/test";
import getJobs from "../src/getJobs";

test("Page Screenshot", async ({ page }) => {
  test.setTimeout(10000000);
  await page.goto("https://playwright.dev/");
  await page.waitForSelector(".fake");
  await page.screenshot({ path: "screenshots/" });
  await getJobs(page);
});
