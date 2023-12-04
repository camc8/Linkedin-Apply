import type { Page } from "playwright";
import chalk from "chalk";
import promptSync from "prompt-sync";

/**
 * Get a random number between min and max
 * @param min
 * @param max
 * @returns randomized number
 */
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

/**
 * Create a randomized delay using Page.waitForTimeout()
 * to evade anti-bot protections
 * @param page a playwright Page object
 * @param min optional min
 * @param max optional max
 */
export async function wait(page: Page, min?: number, max?: number) {
  min ? (max = min * 3) : null;
  await page.waitForTimeout(randomInt(min ?? 100, max ?? 500));
}

/**
 * Log messages to console
 * @param message
 * @param level Optional, either "info", "warning", or "error"
 */
export function log(message: string, level?: "info" | "warning" | "error") {
  level === "warning"
    ? console.log(chalk.yellow(message))
    : level === "error"
    ? console.log(chalk.red(message))
    : console.log(chalk.blue(message));
}

export function getUrl(page: Page) {
  return page.url().replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
}

export function urlStartsWith(url: string, page: Page) {
  return getUrl(page).startsWith(url);
}

const ps = promptSync();
export function prompt(message: string) {
  return ps(chalk.bold(chalk.green(message)));
}
