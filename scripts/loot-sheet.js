// import ActorSheet5eNPC from "../../../../systems/dnd5e/module/actor/sheets/npc.js";
import { Logger } from "./log.js";
import { handleEvent } from "./event-handling.js";

const logger = new Logger("loot-sheet.js");
// logger.disable();

export class SimpleLootSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "sheet", "actor", "npc"],
    });
  }

  // return HTML template to render
  get template() {
    return "modules/simple-lootsheet-5e/templates/loot-sheet.hbs";
  }

  // render(force = false, options = {}) {
  //   logger.logConsole("force", force, "options", options);
  //   super.render(force, options);
  // }

  // set and mutate model of view
  // async getData() {
  //   const data = await super.getData();
  //   logger.logWarn("data", data);
  //   return data;
  // }

  // register dynamic functionality (buttons, events, and so on)
  async activateListeners(html) {
    super.activateListeners(html);

    const app = document.querySelector(`#${this.id}`);
    logger.logConsole("app", app);
    if (!app) {
      return;
    }

    // register button onclick events
    const buttons = app.querySelectorAll(".sls-btn");
    for (const btn of buttons) {
      btn.onclick = async (event) => {
        const { eventtype: eventType, itemid: itemId } =
          event.currentTarget.dataset;
        // gather global itemId
        const itemKeys = Array.from(this.actor.data.items.keys());
        const item = this.actor.data.items.get(itemKeys[itemId]);
        await handleEvent(eventType, this.actor, item.id);
      };
    }
  }
}
