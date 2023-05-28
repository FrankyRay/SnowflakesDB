import { world, system, ItemStack, MinecraftItemTypes, } from "@minecraft/server";
import { ActionFormData, MessageFormData } from "@minecraft/server-ui";
import deepCopy from "lib/deepCopy";
import "survival-enhancer/main";
const options = [
    // {
    //   name: "Shape Generator",
    //   icon: "",
    //   func: shapeGeneratorMenu,
    // },
    {
        name: "Survival Enhancer Book",
        icon: "",
        func: survivalEnhancerBook,
    },
    {
        name: "Gametest Playground Book",
        icon: "",
        func: gametestPlaygroundBook,
    },
    {
        name: "Block Component [DeepCopy/Test]",
        icon: "",
        func: blockComponent,
    },
    // {
    //   name: "Entity Component [Test]",
    //   icon: "",
    //   func: entityComponent,
    // },
    {
        name: "Test Button",
        icon: "",
        func: testing,
    },
    {
        name: "Console",
        icon: "",
        func: consoleFunc,
    },
    {
        name: "ActionBar Test",
        icon: "",
        func: actionbarTest,
    },
];
world.afterEvents.itemUse.subscribe((event) => {
    if (event.itemStack.typeId !== "minecraft:book" ||
        event.itemStack.getLore().length !== 0)
        return;
    // @ts-ignore
    const player = event.source;
    mainForm(player);
});
function mainForm(player) {
    const form = new ActionFormData()
        .title("Options")
        .body("Select one of this options");
    for (const opt of options) {
        form.button(opt.name, opt.icon);
    }
    form
        .show(player)
        .then((response) => {
        if (response.canceled)
            return;
        options[response.selection].func(player);
    })
        .catch((err) => console.error(err, err.stack));
}
function blockComponent(player) {
    const blockComponentList = [
        "minecraft:inventory",
        "minecraft:lavaContainer",
        "minecraft:piston",
        "minecraft:potionContainer",
        "minecraft:recordPlayer",
        "minecraft:sign",
        "minecraft:snowContainer",
        "minecraft:waterContainer",
    ];
    const block = player.getBlockFromViewDirection({ maxDistance: 20 });
    const deepObject = deepCopy(block);
    for (const compId of blockComponentList) {
        const comp = block.getComponent(compId);
        if (!comp) {
            deepObject[compId] = false;
        }
        else {
            deepObject[compId] = deepCopy(comp);
        }
    }
    new MessageFormData()
        .title("Block Component")
        .body(JSON.stringify(deepObject, null, 2))
        .button1("OK")
        .button2("Cancel")
        .show(player);
}
function testing(player) {
    system.runTimeout(() => {
        const item = player.getComponent("inventory").container.getItem(player.selectedSlot);
        const enc = item.getComponent("enchantments")
            .enchantments;
        let message = `Enchantment ${item.typeId} [Slot: ${enc.slot}]`;
        for (const e of enc) {
            message += `\n${e.type.id} | ${e.level}/${e.type.maxLevel}`;
        }
        console.log(message);
    }, 100);
}
function survivalEnhancerBook(player) {
    const inv = player.getComponent("inventory");
    const item = new ItemStack(MinecraftItemTypes.book, 1);
    item.nameTag = "§rSurvival Enhancer Options";
    item.setLore(["§r§e[Form] Survival Enhancer"]);
    inv.container.addItem(item);
}
function gametestPlaygroundBook(player) {
    const inv = player.getComponent("inventory");
    const item = new ItemStack(MinecraftItemTypes.book, 1);
    item.setLore(["§r§e[Form] Gametest Playground"]);
    inv.container.addItem(item);
}
function consoleFunc(player) {
    console.log("[LOG] console.log()");
    console.warn("[WARN] console.warn()");
    console.error("[ERROR] console.error()");
}
function actionbarTest(player) {
    if (player.hasTag("snowflake:actionbar_test"))
        player.removeTag("snowflake:actionbar_test");
    else
        player.addTag("snowflake:actionbar_test");
}
