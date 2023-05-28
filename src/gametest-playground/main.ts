import { Player, world } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";
import spawnExplosion from "./spawn/explosion";

world.afterEvents.itemUse.subscribe((event) => {
  const player = event.source as Player;
  const item = event.itemStack;
  if (
    item.typeId !== "minecraft:book" ||
    !item.getLore().find((lore) => lore === "§r§e[Form] Gametest Playground")
  )
    return;

  gametestPlayground(player);
});

function gametestPlayground(player: Player): void {
  const optionForm = new ActionFormData()
    .title("GameTest Playground")
    // .body("Gametest form playground for testing")
    .button("Show Component")
    .button("Spawn Explosion");

  optionForm.show(player).then((result) => {
    if (result.canceled) return;

    switch (result.selection) {
      case 1:
        spawnExplosion(player);
        break;
    }
  });
}
