import { world, } from "@minecraft/server";
import CustomCommand from "./command/command";
// Extension
// import "./item";
CustomCommand.addCommand({
    name: "test",
    description: "Used for test purposes ~ Testing 'vector3' argument type",
    arguments: [
        {
            name: "coodinate",
            description: "Vector3 test",
            type: "vector3",
        },
    ],
    callback(data) {
        console.log("Test is run successfully", JSON.stringify(data));
        world.sendMessage("Test is working");
    },
});
// customCommand.addCommand({
//   name: "gtpg",
//   description: "Give GAMETEST PLAYGROUND book",
//   arguments: [],
//   callback(player, data) {
//     const inv = player.getComponent("inventory") as EntityInventoryComponent;
//     const item = new ItemStack(MinecraftItemTypes.book, 1);
//     item.setLore(["§r§e[Form] Gametest Playground"]);
//     inv.container.addItem(item);
//   },
// });
// customCommand.addCommand({
//   name: "enc",
//   description: "",
//   arguments: [],
//   callback(player: Player, data) {
//     const item = (
//       player.getComponent("inventory") as EntityInventoryComponent
//     ).container.getItem(player.selectedSlot);
//     const enc = (item.getComponent("enchantments") as ItemEnchantsComponent)
//       .enchantments;
//     for (const e of enc) {
//       console.warn(e.type.id, e.type.maxLevel, e.level);
//     }
//   },
// });
