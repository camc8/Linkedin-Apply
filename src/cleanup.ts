import fs from "node:fs";
import { BrowserContext } from "playwright";
import { log } from "./utils";

export default function cleanup() {
  function exitHandler(callback: Function, context?: BrowserContext) {
    process.stdin.resume();
    log("\nExiting...", "warning");
    //   fs.writeFileSync("./cookies.json", JSON.stringify(await context.cookies()));
    callback();
  }

  process.on("exit", () => {
    exitHandler(() => process.exit(1));
  });

  // process.on("SIGINT", () => {
  //   exitHandler(() => process.exit(1));
  // });

  // process.on("SIGUSR1", () => {
  //   exitHandler(() => process.exit(1));
  // });

  // process.on("SIGUSR2", () => {
  //   exitHandler(() => process.exit(1));
  // });

  // process.on("uncaughtException", () => {
  //   exitHandler(() => process.exit(-1));
  // });
}
