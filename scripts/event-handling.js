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
      const itemId = eventData;
      // loots a single item in the inventory of eventTarget
      await lootItem(eventOrigin, eventTarget, itemId);
      break;
    case EVENT.lootAll:
      // loots every item in the inventory of eventTarget
      await lootAllItems(eventOrigin, eventTarget);
      break;
    case EVENT.lootStack:
      // todo
      break;
    case EVENT.remove:
      // todo
      break;
    default:
      logger.logWarn(`can't handle event "${eventType}"`);
      break;
    // todo
  }
}

async function lootItem(eventOrigin, eventTarget, itemId) {
  if (eventOrigin?.data?.items.length > 0 || !itemId) {
    logger.logInfo(`can't loot ${itemId} from ${eventOrigin}`);
    return;
  }
  const item = eventOrigin.data.items.get(itemId);
  if (!item) {
    logger.logInfo(`${itemId} can not be found`);
    return;
  }
  const lootableItems = gatherLootableItems([item]);
  if (lootableItems?.length < 1) {
    logger.logInfo(`${itemId} - ${item} is not lootable`);
    return;
  }

  await updateActors(eventOrigin, eventTarget, lootableItems);
}

async function lootAllItems(eventOrigin, eventTarget) {
  if (eventOrigin?.data?.items.length > 0) {
    logger.logInfo(`${eventOrigin}'s inventory is empty`);
    return;
  }
  const lootableItems = gatherLootableItems(eventOrigin.data.items);
  if (lootableItems?.length < 1) {
    logger.logInfo(`items are not lootable ${eventOrigin.data.items}`);
    return;
  }

  await updateActors(eventOrigin, eventTarget, lootableItems);
}

async function updateActors(eventOrigin, eventTarget, lootableItems) {
  const { originChanges, targetChanges } = calculateItemTransferChanges(
    eventOrigin,
    eventTarget,
    lootableItems
  );
  await updateItems(eventOrigin, eventTarget, originChanges, targetChanges);
}

function gatherLootableItems(items) {
  const lootableItems = [];
  for (const item of items) {
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

function calculateItemTransferChanges(origin, target, items) {
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
        data: {
          quantity: parseInt(targetItem.data.data.quantity + itemQuantity),
        },
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
