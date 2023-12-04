import { chromium } from "playwright";
import settings from "./settings.json";
import cookies from "./cookies.json";
import fs from "node:fs";

var prompt = require("prompt-sync")();

console.log("Starting Bot");
const loginURL = "https://www.linkedin.com/login";

(async () => {
  const browser = await chromium.launch({ headless: settings.headless });
  const context = await browser.newContext();
  await context.addCookies(cookies);
  const page = await context.newPage();
  await page.goto(loginURL);

  if (page.url() === loginURL) {
    console.log("Not yet logged in, logging in now...");

    await page.getByLabel("Email or Phone").click();
    await page.getByLabel("Email or Phone").fill(settings?.linkedin?.email);
    await page.getByLabel("Password").click();
    await page.getByLabel("Password").fill(settings?.linkedin?.password);
    await page.getByLabel("Sign in", { exact: true }).click();
    if (await page.getByPlaceholder("Enter code").isVisible()) {
      //Login flagged for 2FA, enter email code to continue
      const code = prompt(
        `Enter the code sent to your email (${settings.linkedin.email}) >> `
      );
      console.log("Submitting code...");
      await page.getByPlaceholder("Enter code").fill(code);
    }

    if (page.url() === "https://linkedin.com/feed") {
      //Success, save login cookie
      fs.writeFileSync(
        "./cookies.json",
        JSON.stringify(await context.cookies())
      );
    }
  }
  // page.pause();
  // await page.screenshot({ path: `./screenshots/${Math.random()}.png` });
  await browser.close();
})();
