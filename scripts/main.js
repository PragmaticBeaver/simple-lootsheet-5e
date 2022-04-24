import { Logger } from "./log.js";
import { SimpleLootSheet } from "./loot-sheet.js";

const logger = new Logger("main.js");
// logger.disable();

logger.logConsole("test");

Hooks.on("init", function () {
  logger.logConsole("simple-lootsheet-5e | initializing ...");

  Actors.registerSheet("dnd5e", SimpleLootSheet, {
    types: ["npc"],
    makeDefault: false,
    label: "Simple Loot Sheet",
  });
});

Hooks.on("ready", () => {
  logger.logConsole("simple-lootsheet-5e | starting ...");
});
