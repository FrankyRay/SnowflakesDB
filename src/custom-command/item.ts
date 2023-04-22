import {
  world,
  system,
  Player,
  ItemStack,
  ItemLockMode,
  ItemEnchantsComponent,
  Enchantment,
  MinecraftEnchantmentTypes,
  Vector3,
  EntityInventoryComponent,
} from "@minecraft/server";
import customCommand from "./command";

interface ItemComponent {
  // Default Item Component [Java Syntax]
  CanDestroy: string[];
  CanPlaceOn: string[];
  ItemLock: "lock_in_slot" | "lock_in_inventory";
  KeepOnDeath: {};
  // Default Item Component [Bedrock Syntax]
  "minecraft:can_destroy": { blocks: string[] };
  "minecraft:can_place_on": { blocks: string[] };
  "minecraft:item_lock": { mode: "lock_in_slot" | "lock_in_inventory" };
  "minecraft:keep_on_death": {};
  // Additional Item Component
  Display: {
    Name: string;
    Lore: string[];
  };
  Enchantment: EnchantmentData[];
  ExplorationMap: string /* For Map Only */;
}

interface EnchantmentData {
  id: string;
  lvl?: number;
}

interface CommandResult {
  command: string;
  arguments: {
    selection: "spawn" | "give";
    position?: Vector3;
    item: string;
    amount: number;
    component: ItemComponent;
  };
}

enum EnchantmentId {
  aqua_affinity = "AquaAffinity",
  bane_of_arthropods = "BaneOfArthropods",
  binding = "Binding",
  blast_protection = "BlastProtection",
  channeling = "Channeling",
  depth_strider = "DepthStrider",
  efficiency = "Efficiency",
  feather_falling = "FeatherFalling",
  fire_aspect = "FireAspect",
  fire_protection = "FireProtection",
  flame = "Flame",
  fortune = "Fortune",
  frost_walker = "FrostWalker",
  impaling = "Impaling",
  infinity = "Infinity",
  knockback = "Knockback",
  looting = "Looting",
  loyalty = "Loyalty",
  luck_of_the_sea = "LuckOfTheSea",
  lure = "Lure",
  mending = "Mending",
  multishot = "Multishot",
  piercing = "Piercing",
  power = "Power",
  projectile_protection = "ProjectileProtection",
  protection = "Protection",
  punch = "Punch",
  quick_charge = "QuickCharge",
  respiration = "Respiration",
  riptide = "Riptide",
  sharpness = "Sharpness",
  silk_touch = "SilkTouch",
  smite = "Smite",
  soul_speed = "SoulSpeed",
  swift_sneak = "SwiftSneak",
  thorns = "Thorns",
  unbreaking = "Unbreaking",
  vanishing = "Vanishing",
}

customCommand.addCommand({
  name: "item",
  description:
    "Manipulate or copy items in the inventories of blocks (chest, furnaces, etc.) or entities (players or mobs).",
  operator: true,
  arguments: [
    {
      name: "selection",
      description: "Option of item's command.",
      type: "option",
      choices: [
        {
          name: "give",
          description: "Give the item to entities (players or mobs).",
          // subargument: [
          //   {
          //     name: "target",
          //     description: "The entity to which the item is to be assigned.",
          //     type: "selector",
          //     options: {
          //       type: "player",
          //     },
          //   },
          // ],
        },
        {
          name: "spawn",
          description: "Spawn the item at specific location.",
          subargument: [
            {
              name: "position",
              description: "The location where the item will appear.",
              type: "location",
              options: {
                outputData: "Vector3",
              },
            },
          ],
        },
      ],
    },
    {
      name: "item",
      description: "The item's identifier.",
      type: "item",
      options: { stringify: false },
    },
    {
      name: "amount",
      description: "The item's amount.",
      type: "number",
      options: {
        floatType: false,
        range: { min: 0, max: 256 },
      },
      default: 1,
    },
    {
      name: "components",
      description: "The item's components (Sort of NBT Data).",
      type: "object",
      default: {},
    },
  ],
  callback: itemCommand,
});

function itemCommand(player: Player, data: CommandResult) {
  switch (data.arguments.selection) {
    case "give":
      const itemLeft = (
        player.getComponent("inventory") as EntityInventoryComponent
      ).container.addItem(
        createItem(
          data.arguments.item,
          data.arguments.amount,
          data.arguments.component
        )
      );
      console.log(itemLeft.typeId, itemLeft.amount);
      break;

    case "spawn":
      player.dimension.spawnItem(
        createItem(
          data.arguments.item,
          data.arguments.amount,
          data.arguments.component
        ),
        data.arguments.position
      );
      break;
  }
}

function createItem(
  itemId: string,
  amount: number,
  component: ItemComponent
): ItemStack {
  const item = new ItemStack(itemId, amount);
  const itemSlot = {
    lock_in_slot: ItemLockMode.slot,
    lock_in_inventory: ItemLockMode.inventory,
  };

  item.setCanPlaceOn([
    ...("CanPlaceOn" in component ? component.CanPlaceOn : []),
    ...("minecraft:can_place_on" in component
      ? component["minecraft:can_place_on"].blocks
      : []),
  ]);

  item.setCanDestroy([
    ...("CanDestroy" in component ? component.CanDestroy : []),
    ...("minecraft:can_destroy" in component
      ? component["minecraft:can_destroy"].blocks
      : []),
  ]);

  if (
    "ItemLock" in component &&
    "minecraft:item_lock" in component &&
    component.ItemLock !== component["minecraft:item_lock"].mode
  )
    throw `"ItemLock" and "minecraft:item_lock" has different value`;
  else if ("ItemLock" in component || "minecraft:item_lock" in component)
    item.lockMode =
      itemSlot[component.ItemLock ?? component["minecraft:item_lock"].mode];

  if ("KeepOnDeath" in component || "minecraft:keep_on_death" in component)
    item.keepOnDeath = true;

  item.nameTag = component?.Display?.Name ?? "";
  item.setLore(component?.Display?.Lore ?? []);

  const enchantList = (
    item.getComponent("enchantments") as ItemEnchantsComponent
  ).enchantments;
  for (const enchantData of component?.Enchantment ?? []) {
    enchantList.addEnchantment(
      new Enchantment(
        MinecraftEnchantmentTypes[EnchantmentId[enchantData.id]],
        enchantData.lvl ?? 1
      )
    );
  }
  (item.getComponent("enchantments") as ItemEnchantsComponent).enchantments =
    enchantList;

  return item;
}
