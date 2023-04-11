import {
  world,
  system,
  ItemStack,
  Entity,
  EntityInventoryComponent,
  EntityMarkVariantComponent,
  EntityVariantComponent,
} from "@minecraft/server";

class MooshroomInfo {
  public readonly id: string = "mooshroom_info";
  public readonly name: string = "Mooshroom Info";
  public readonly desc: string = "Show mooshroom variant and mark variant";
  public readonly beta: boolean = true;
  public activate: boolean = false;

  #markVariants = [
    { id: "Poppy", effect: "Night Vision", duration: 4 },
    { id: "Cornflower", effect: "Jump Boost", duration: 4 },
    { id: "Tulips", effect: "Weakness", duration: 7 },
    { id: "Azure Bluent", effect: "Blindness", duration: 6 },
    { id: "Lily of the Valley", effect: "Poison", duration: 10 },
    { id: "Dandelion", effect: "Saturation", duration: 0.3 },
    { id: "Blue Orchid", effect: "Saturation", duration: 0.3 },
    { id: "Allium", effect: "Fire Resistance", duration: 2 },
    { id: "Oxeye Daisy", effect: "Regeneration", duration: 6 },
    { id: "Wither Rose", effect: "Wither", duration: 6 },
    { id: "Torchflower", effect: "Night Vision", duration: 4 },
  ];

  constructor() {
    system.runInterval(() => {
      if (!this.activate) return;

      for (const player of world.getPlayers()) {
        const item: ItemStack = (
          player.getComponent("inventory") as EntityInventoryComponent
        ).container.getItem(player.selectedSlot);
        if (item?.typeId !== "minecraft:bowl") return;

        const entity: Entity = player.getEntitiesFromViewDirection({
          maxDistance: 5,
        })[0];
        if (entity?.typeId !== "minecraft:mooshroom") return;
        let message = `[SE] ${this.name}`;

        const variant = (
          entity.getComponent("variant") as EntityVariantComponent
        ).value;
        message += `\n§a${variant ? "Brown" : "Red"} Mooshroom [V:${variant}] `;

        const markVariant = (
          entity.getComponent("mark_variant") as EntityMarkVariantComponent
        ).value;
        const mvData = this.#markVariants[markVariant];
        message += `§r| §c[MV:${markVariant}] ${
          !mvData
            ? "NONE"
            : `${mvData.duration}s ${mvData.effect} (${mvData.id})`
        }`;

        player.onScreenDisplay.setActionBar(message);
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

export default new MooshroomInfo();
