import { world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import spawnExplosion from "./spawn/explosion";
world.afterEvents.itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    if (item.typeId !== "minecraft:book" ||
        !item.getLore().find((lore) => lore === "§r§e[Form] Gametest Playground"))
        return;
    gametestPlayground(player);
});
function gametestPlayground(player) {
    const optionForm = new ActionFormData()
        .title("GameTest Playground")
        // .body("Gametest form playground for testing")
        .button("Show Component")
        .button("Spawn Explosion");
    optionForm.show(player).then((result) => {
        if (result.canceled)
            return;
        switch (result.selection) {
            case 1:
                spawnExplosion(player);
                break;
        }
    });
}
