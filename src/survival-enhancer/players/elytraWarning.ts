import {
  world,
  system,
  EquipmentSlot,
  ItemStack,
  EntityEquipmentInventoryComponent,
  ItemDurabilityComponent,
} from "@minecraft/server";

class ElytraWarning {
  public readonly id: string = "elytra_warning";
  public readonly name: string = "Elytra Warning";
  public readonly desc: string = "Show durability while using elytra";
  public readonly beta: boolean = true;
  public readonly group: string = "Player";
  public readonly version: number[] = [1, 0, 0];
  public activate: boolean = false;

  constructor() {
    system.runInterval(() => {
      if (!this.activate) return;

      for (const player of world.getPlayers()) {
        const chestItem: ItemStack = (
          player.getComponent(
            "equipment_inventory"
          ) as EntityEquipmentInventoryComponent
        ).getEquipment(EquipmentSlot.chest);
        if (chestItem?.typeId !== "minecraft:elytra") continue;

        const blockBelow = player.dimension.getBlock({
          x: player.location.x,
          y: player.location.y - 2,
          z: player.location.z,
        });
        if (blockBelow?.typeId !== "minecraft:air") continue;

        const durability = chestItem.getComponent(
          "durability"
        ) as ItemDurabilityComponent;
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
    this.refreshingData();
  }

  private refreshingData() {
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
