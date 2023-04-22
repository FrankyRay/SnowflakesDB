import { ItemStack, ItemLockMode, Enchantment, MinecraftEnchantmentTypes, } from "@minecraft/server";
import customCommand from "./command";
var EnchantmentId;
(function (EnchantmentId) {
    EnchantmentId["aqua_affinity"] = "AquaAffinity";
    EnchantmentId["bane_of_arthropods"] = "BaneOfArthropods";
    EnchantmentId["binding"] = "Binding";
    EnchantmentId["blast_protection"] = "BlastProtection";
    EnchantmentId["channeling"] = "Channeling";
    EnchantmentId["depth_strider"] = "DepthStrider";
    EnchantmentId["efficiency"] = "Efficiency";
    EnchantmentId["feather_falling"] = "FeatherFalling";
    EnchantmentId["fire_aspect"] = "FireAspect";
    EnchantmentId["fire_protection"] = "FireProtection";
    EnchantmentId["flame"] = "Flame";
    EnchantmentId["fortune"] = "Fortune";
    EnchantmentId["frost_walker"] = "FrostWalker";
    EnchantmentId["impaling"] = "Impaling";
    EnchantmentId["infinity"] = "Infinity";
    EnchantmentId["knockback"] = "Knockback";
    EnchantmentId["looting"] = "Looting";
    EnchantmentId["loyalty"] = "Loyalty";
    EnchantmentId["luck_of_the_sea"] = "LuckOfTheSea";
    EnchantmentId["lure"] = "Lure";
    EnchantmentId["mending"] = "Mending";
    EnchantmentId["multishot"] = "Multishot";
    EnchantmentId["piercing"] = "Piercing";
    EnchantmentId["power"] = "Power";
    EnchantmentId["projectile_protection"] = "ProjectileProtection";
    EnchantmentId["protection"] = "Protection";
    EnchantmentId["punch"] = "Punch";
    EnchantmentId["quick_charge"] = "QuickCharge";
    EnchantmentId["respiration"] = "Respiration";
    EnchantmentId["riptide"] = "Riptide";
    EnchantmentId["sharpness"] = "Sharpness";
    EnchantmentId["silk_touch"] = "SilkTouch";
    EnchantmentId["smite"] = "Smite";
    EnchantmentId["soul_speed"] = "SoulSpeed";
    EnchantmentId["swift_sneak"] = "SwiftSneak";
    EnchantmentId["thorns"] = "Thorns";
    EnchantmentId["unbreaking"] = "Unbreaking";
    EnchantmentId["vanishing"] = "Vanishing";
})(EnchantmentId || (EnchantmentId = {}));
customCommand.addCommand({
    name: "item",
    description: "Manipulate or copy items in the inventories of blocks (chest, furnaces, etc.) or entities (players or mobs).",
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
function itemCommand(player, data) {
    switch (data.arguments.selection) {
        case "give":
            const itemLeft = player.getComponent("inventory").container.addItem(createItem(data.arguments.item, data.arguments.amount, data.arguments.component));
            console.log(itemLeft.typeId, itemLeft.amount);
            break;
        case "spawn":
            player.dimension.spawnItem(createItem(data.arguments.item, data.arguments.amount, data.arguments.component), data.arguments.position);
            break;
    }
}
function createItem(itemId, amount, component) {
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
    if ("ItemLock" in component &&
        "minecraft:item_lock" in component &&
        component.ItemLock !== component["minecraft:item_lock"].mode)
        throw `"ItemLock" and "minecraft:item_lock" has different value`;
    else if ("ItemLock" in component || "minecraft:item_lock" in component)
        item.lockMode =
            itemSlot[component.ItemLock ?? component["minecraft:item_lock"].mode];
    if ("KeepOnDeath" in component || "minecraft:keep_on_death" in component)
        item.keepOnDeath = true;
    item.nameTag = component?.Display?.Name ?? "";
    item.setLore(component?.Display?.Lore ?? []);
    const enchantList = item.getComponent("enchantments").enchantments;
    for (const enchantData of component?.Enchantment ?? []) {
        enchantList.addEnchantment(new Enchantment(MinecraftEnchantmentTypes[EnchantmentId[enchantData.id]], enchantData.lvl ?? 1));
    }
    item.getComponent("enchantments").enchantments =
        enchantList;
    return item;
}
