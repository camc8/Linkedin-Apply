import fs from "node:fs";
import { BrowserContext } from "playwright";

function exitHandler(callback: Function, context?: BrowserContext) {
  process.stdin.resume();
  //   fs.writeFileSync("./cookies.json", JSON.stringify(await context.cookies()));
  callback();
}

process.on("exit", () => {
  exitHandler(() => process.exit(1));
});

process.on("SIGINT", () => {
  exitHandler(() => process.exit(1));
});

process.on("SIGUSR1", () => {
  exitHandler(() => process.exit(1));
});

process.on("SIGUSR2", () => {
  exitHandler(() => process.exit(1));
});

process.on("uncaughtException", () => {
  exitHandler(() => process.exit(-1));
});
