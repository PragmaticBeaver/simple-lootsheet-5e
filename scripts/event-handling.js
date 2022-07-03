import { Logger } from "./log.js";
import { EVENT } from "./constants.js";

const logger = new Logger("loot-sheet.js");
// logger.disable();

export function handleEvent(eventType, eventOrigin, eventData) {
  logger.logConsole("hanldeEvent", {
    eventType,
    eventOrigin,
    eventData,
  });

  const userId = game.data.userId;
  const characterId = game.users.get(userId).data.character;
  const eventTarget = game.actors.get(characterId); // currently selected/active actor of user
  logger.logConsole("eventTarget", eventTarget);

  switch (eventType) {
    case EVENT.loot:
      // remove item from actor and add to actor associated with player
      // todo handle DM/GM
      const itemId = eventData;
      // let item;
      // item = game.items.get(itemName);
      // logger.logConsole("item", item);
      // if (!item) {
      //   const items = [];
      //   game.packs.get("dnd5e.items").index.forEach((item) => {
      //     if (item.name === itemName) {
      //       items.push(item);
      //     }
      //   });
      //   item = items.length > 0 ? items[0] : undefined;
      // }

      // logger.logConsole("item", item);
      // todo spawn instance of item
      // actor.data.items.set(item._id, item);

      const x = eventOrigin.getEmbeddedDocument("Item", itemId);
      logger.logWarn("x", x);
      // const newItem = duplicate(x);
      break;
    case EVENT.lootAll:
      if (eventOrigin?.data?.items.length > 0) {
        return;
      }
      const lootableItems = gatherLootableItems(eventOrigin.data.items);
      logger.logWarn("lootableItems", lootableItems);
      const { originChanges, targetChanges } = transferItems(
        eventOrigin,
        eventTarget,
        lootableItems
      );
      logger.logWarn("changes", originChanges, targetChanges);
      /**
       * todo - research lootAll
       *
       * Gather valid items to loot
       * 1. gather eventOrigin (actor) and eventTarget (actor)
       * 2. gather all Items from eventOrigin
       * 3. loop over items => filter by "item.type == 'equipment'"
       * 4. unequip every item => item.data.equipped = false
       *
       * Move items from eventOrigin to eventTarget
       * 1. gather item from eventOrigin => const sourceItem = source.getEmbeddedDocument("Item", item.id)
       * 2. gather item from eventTarget => 
                    targetItem = destination.getEmbeddedCollection('Item').find(i =>
                    sourceItem.name === i.name
                    && sourceItem.data.data.price === i.data.data.price
                    && sourceItem.data.data.weight === i.data.data.weight
                );
       * 3. eventTarget contains item already?
       * 3-1. YES => update eventTarget quantity => let targetUpdate = { _id: targetItem.id, data: { quantity: parseInt(targetItem.data.data.quantity + quantity) } };
       * 3-2. NO => duplicate eventOrigin item and save temporary =>
                newItem = duplicate(sourceItem);
                newItem.data.quantity = parseInt(quantity);
                newItem.data.equipped = false;
       * 4. check if item from eventOrigin has to be deleted (quantity < 1) => add to deletion queue
       *
       * use queues to update actors
       * 1. loop over each queue and update actors according to the type of queue
       * 2. new Items => return actor.createEmbeddedDocuments("Item", items.data);
       * 3. remove Items => return actor.deleteEmbeddedDocuments("Item", items.data);
       * 4. updated Items => return actor.updateEmbeddedDocuments("Item", updatedItems);
       */
      break;
    case EVENT.remove:
      break;
    default:
      logger.logWarn(`can't handle event "${eventType}"`);
      break;
    // todo
  }
}

function gatherLootableItems(items) {
  const lootableItems = [];
  for (const item of items) {
    logger.logWarn("item", item);
    const invalidItemTypes = ["class", "spell", "feat"];
    const invalidItem = invalidItemTypes.includes(item.type);
    if (invalidItem) {
      continue;
    }
    item.data.equipped = false;
    lootableItems.push(item);
  }
  return lootableItems;
}

function transferItems(origin, target, items) {
  const originChanges = { updatedItems: [], removedItems: [] };
  const targetChanges = { updatedItems: [], addedItems: [] };

  for (const item of items) {
    const originItem = origin.getEmbeddedDocument("Item", item.id);
    const targetItem = target.getEmbeddedCollection("Item").find(
      (i) => originItem.name === i.name
      // &&
      // originItem.data?.data?.price === i.data?.data?.price &&
      // originItem.data?.data?.weight === i.data?.data?.weight
    );
    const itemQuantity = item.data.data.quantity;

    const targetOwnsItemAlready = !!targetItem;
    if (targetOwnsItemAlready) {
      const targetUpdate = {
        _id: targetItem.id,
        data: { quantity: parseInt(targetItem.data.data.quantity + quantity) },
      };
      targetChanges.updatedItems.push(targetUpdate);
    } else {
      const copyOfItem = duplicate(originItem);
      copyOfItem.data.quantity = parseInt(itemQuantity);
      copyOfItem.data.equipped = false;
      targetChanges.addedItems.push(copyOfItem);
    }

    const calculatedQuantity = originItem.data.data.quantity - itemQuantity;

    const shouldBeDeleted = calculatedQuantity <= 0;
    if (shouldBeDeleted) {
      originChanges.removedItems.push(originItem.id); // why only id?
    } else {
      const updatedItem = {
        _id: sourceItem.id,
        data: { quantity: calculatedQuantity },
      };
      originChanges.updatedItems.push(updatedItem);
    }
  }

  return { originChanges, targetChanges };
}
