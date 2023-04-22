import {
  world,
  system,
  EntityInventoryComponent,
  Container,
  Player,
} from "@minecraft/server";

type EntityComp = {
  (
    componentName: "inventory" | "minecraft:inventory"
  ): EntityInventoryComponent;
};

class ReplantingCrops {
  public readonly id: string = "replanting_crops";
  public readonly name: string = "Replanting Crops";
  public readonly desc: string =
    "Replanting crops when corresponding seeds is available";
  public readonly beta: boolean = true;
  public readonly group: string = "Misc";
  public readonly version: number[] = [1, 1, 0];
  public activate: boolean = false;

  private plant: object = {
    "minecraft:wheat": "minecraft:wheat_seeds",
    "minecraft:pumpkin_stem": "minecraft:pumpkin_seeds",
    "minecraft:melon_stem": "minecraft:melon_seeds",
    "minecraft:beetroot": "minecraft:beetroot_seeds",
    "minecraft:potatoes": "minecraft:potato",
    "minecraft:carrots": "minecraft:carrot",
    // Nether Crops
    "minecraft:nether_wart": "minecraft:nether_wart",
    // Next Update [1.20]
    "minecraft:torchflower": "minecraft:torchflower_seeds",
    "minecraft:pitcher_crop": "minecraft:pitcher_pod",
  };

  constructor() {
    world.events.blockBreak.subscribe((evd) => {
      if (!this.activate) return;
      const { block, brokenBlockPermutation, player } = evd;
      if (!(brokenBlockPermutation.type.id in this.plant)) return;

      const expectedItemId = this.plant[brokenBlockPermutation.type.id];
      /**
       * @type {Container}
       */
      const container: Container = (
        player.getComponent("inventory") as EntityInventoryComponent
      ).container;
      const mainItem = container.getItem(player.selectedSlot);
      if (
        !mainItem.typeId.startsWith("minecraft:") ||
        !mainItem.typeId.endsWith("_hoe")
      )
        return;

      for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i);
        if (item?.typeId !== expectedItemId) continue;

        if (item.amount === 1) {
          (
            player.getComponent("inventory") as EntityInventoryComponent
          ).container.setItem(i);
        } else {
          item.amount--;
          (
            player.getComponent("inventory") as EntityInventoryComponent
          ).container.setItem(i, item);
        }
        block.setType(brokenBlockPermutation.type);
        break;
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

export default new ReplantingCrops();
