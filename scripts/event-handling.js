import { Logger } from "./log.js";

const logger = new Logger("loot-sheet.js");
// logger.disable();

export function handleEvent(eventType, actor, itemId) {
  logger.logConsole("hanldeEvent", { eventType, actor, itemId });
  // todo
}
