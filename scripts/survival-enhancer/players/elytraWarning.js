import { world, system, EquipmentSlot, ItemStack } from "@minecraft/server";

class ElytraWarning {
  id = "elytra_warning";
  name = "Elytra Warning";
  desc = "Show durability while using elytra";
  beta = true;
  activate = false;

  constructor() {
    system.runInterval(() => {
      if (!this.activate) return;

      for (const player of world.getPlayers()) {
        /**
         * @type {ItemStack}
         */
        const chestItem = player
          .getComponent("equipment_inventory")
          .getEquipment(EquipmentSlot.chest);
        if (chestItem?.typeId !== "minecraft:elytra") continue;

        const blockBelow = player.dimension.getBlock({
          x: player.location.x,
          y: player.location.y - 2,
          z: player.location.z,
        });
        if (blockBelow?.typeId !== "minecraft:air") continue;

        const durability = chestItem.getComponent("durability");
        player.onScreenDisplay.setActionBar(
          `[SE] Elytra Warning\nElytra Durability: ${
            durability.damage < durability.maxDurability - 100
              ? durability.damage
              : durability.damage > durability.maxDurability - 30
              ? "§4" + durability.damage + "§r"
              : "§c" + durability.damage + "§r"
          }/${durability.maxDurability}`
        );
      }
    });

    // Refreshing "activate" based on scoreboard
    this.#refreshingData();
  }

  #refreshingData() {
    system.runInterval(() => {
      const survivalObj = world.scoreboard.getObjective("survival_plus");

      const scoreId = world.scoreboard
        .getParticipants()
        .find((tgt) => tgt.displayName === this.id);

      if (!scoreId)
        return world
          .getDimension("overworld")
          .runCommand(`scoreboard players set ${this.id} survival_plus 0`);

      const score = survivalObj.getScore(scoreId);
      this.activate = Boolean(score);
    });
  }
}

export default new ElytraWarning();
