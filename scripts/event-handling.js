import { Logger } from "./log.js";
import { EVENT } from "./constants.js";

const logger = new Logger("loot-sheet.js");
// logger.disable();

export async function handleEvent(eventType, eventOrigin, eventData) {
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
      await updateItems(eventOrigin, eventTarget, originChanges, targetChanges);
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

async function updateItems(
  eventOrigin,
  eventTarget,
  originChanges,
  targetChanges
) {
  // eventOrigin update
  const originUpdates = originChanges.updatedItems;
  if (originUpdates.length > 0) {
    await eventOrigin.updateEmbeddedDocuments("Item", originUpdates);
  }

  // eventOrigin remove
  const originRemoves = originChanges.removedItems;
  if (originRemoves.length > 0) {
    await eventOrigin.deleteEmbeddedDocuments("Item", originRemoves);
  }

  // eventTarget update
  const targetUpdates = targetChanges.updatedItems;
  if (targetUpdates.length > 0) {
    await eventTarget.updateEmbeddedDocuments("Item", targetUpdates);
  }

  // eventTarget create
  const targetCreations = targetChanges.addedItems;
  if (targetCreations.length > 0) {
    await eventTarget.createEmbeddedDocuments("Item", targetCreations);
  }
}
