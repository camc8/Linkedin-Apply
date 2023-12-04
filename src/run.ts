import { chromium } from "playwright";
import settings from "./settings.json";
import fs from "node:fs";
import { wait, log, getUrl, urlStartsWith, prompt } from "./utils";
import cleanup from "./cleanup";

cleanup();

log("Starting Bot");

(async () => {
  const browser = await chromium.launch({ headless: settings.headless });
  const context = await browser.newContext();
  fs.readFile("./data/cookies.json", "utf8", async (err, data) => {
    if (err) throw err;
    await context.addCookies(JSON.parse(data));
  });
  const page = await context.newPage();
  await page.goto("https://linkedin.com/login");

  if (!urlStartsWith("linkedin.com/feed", page)) {
    context.clearCookies();
    await wait(page);
    await page.goto("https://linkedin.com/login");
    log("Not yet logged in, logging in now...");

    await page.getByLabel("Email or Phone").click();
    await page.getByLabel("Email or Phone").fill(settings?.linkedin?.email);
    await wait(page);
    await page.getByLabel("Password").click();
    await page.getByLabel("Password").fill(settings?.linkedin?.password);
    await wait(page);
    await page.getByLabel("Sign in", { exact: true }).click();
    if (await page.getByPlaceholder("Enter code").isVisible()) {
      //Login flagged for 2FA, enter email code to continue
      const code = prompt(
        `Enter the code sent to your email (${settings.linkedin.email}) >> `
      );
      log("Submitting code...");
      await page.getByPlaceholder("Enter code").fill(code);
      await page.locator('[aria-label="Submit pin"]').click();
    }

    if (getUrl(page).startsWith("linkedin.com/feed")) {
      //Success, save login cookie
      fs.writeFileSync(
        "./data/cookies.json",
        JSON.stringify(await context.cookies())
      );
      wait(page);
    } else {
      log("Error: Incorrect URL", "error");
      return;
    }
  }
  await page.goto("https://www.linkedin.com/jobs/");
  log("Searching for jobs...");
  await page
    .getByRole("combobox", { name: "Search by title, skill, or" })
    .click();
  await wait(page);
  await page
    .getByRole("combobox", { name: "Search by title, skill, or" })
    .fill(settings.linkedin.jobKeywords[0] || "");
  await wait(page, 600);
  await page
    .getByRole("combobox", { name: "Search by title, skill, or" })
    .press("Enter");

  //Jobs scroll selector: //*[@id="main"]/div/div[1]/div/ul
  await page.waitForSelector('//*[@id="main"]/div/div[1]/div/ul/li/div/div');

  let jobsArray: string[] = [];
  let jobsArrayPrev: string[] = [];

  const elements = await page.locator("[data-job-id]").all();
  const elementsArray = await Promise.all(elements.map(async (el) => el));
  for (const ele of elementsArray) {
    jobsArray.push((await ele.getAttribute("data-job-id")) || "null");
  }

  while (JSON.stringify(jobsArray) !== JSON.stringify(jobsArrayPrev)) {
    jobsArrayPrev = [...jobsArray];
    await page.locator('//*[@id="main"]/div/div[1]/div/ul').hover();
    await wait(page, 100);
    await page.mouse.wheel(0, 800);
    await wait(page, 1000);
    const elements = await page.locator("[data-job-id]").all();
    const elementsArray = await Promise.all(elements.map(async (el) => el));
    for (const ele of elementsArray) {
      const id = (await ele.getAttribute("data-job-id")) || "null";
      if (!jobsArray.includes(id)) jobsArray.push(id);
    }
  }

  log(JSON.stringify(jobsArray));

  prompt("Waiting, press enter to close");
  // await page.screenshot({ path: `./screenshots/${Math.random()}.png` });
  await browser.close();
})();
