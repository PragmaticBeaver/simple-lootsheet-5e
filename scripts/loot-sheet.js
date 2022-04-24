import ActorSheet5eNPC from "../../../../systems/dnd5e/module/actor/sheets/npc.js";

export class SimpleLootSheet extends ActorSheet5eNPC {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["dnd5e", "sheet", "actor", "npc"],
    });
  }

  get template() {
    return "modules/simple-lootsheet-5e/templates/loot-sheet.html";
  }

  getData(options) {
    return super.getData(options);
  }
}
