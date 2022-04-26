// import ActorSheet5eNPC from "../../../../systems/dnd5e/module/actor/sheets/npc.js";
import { Logger } from "./log.js";

const logger = new Logger("loot-sheet.js");
// logger.disable();

export class SimpleLootSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "sheet", "actor", "npc"],
    });
  }

  get template() {
    return "modules/simple-lootsheet-5e/templates/loot-sheet.html";
  }

  // async getData(options) {
  //   return super.getData(options);
  // }

  // render(force = false, options = {}) {
  //   logger.logConsole("force", force, "options", options);
  //   super.render(force, options);
  // }
}
