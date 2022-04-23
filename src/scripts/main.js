import { Logger } from "./log.js";

const logger = new Logger("main.js");
// logger.disable();

Hooks.on("ready", () => {
  logger.logConsole("simple-lootsheet-5e | starting ...");
});
