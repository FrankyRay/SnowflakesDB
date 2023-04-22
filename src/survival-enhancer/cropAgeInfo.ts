import {
  world,
  system,
  EntityInventoryComponent,
  Container,
  Player,
} from "@minecraft/server";

interface Plant {
  blockstate: string;
  harvestable: number;
}

class CropAgeInfo {
  public readonly id: string = "crop_age_info";
  public readonly name: string = "Crop Age Info";
  public readonly desc: string = "Show the age of the crops when holding hoe";
  public readonly beta: boolean = true;
  public readonly group: string = "Misc";
  public readonly version: number[] = [0, 1, 0];
  public activate: boolean = false;

  private plant: object = {
    "minecraft:wheat": {
      blockstate: "growth",
      harvestable: 7,
    },
    "minecraft:pumpkin_stem": {
      blockstate: "growth",
      harvestable: 7,
    },
    "minecraft:melon_stem": {
      blockstate: "growth",
      harvestable: 7,
    },
    "minecraft:beetroot": {
      blockstate: "growth",
      harvestable: 7,
    },
    "minecraft:potatoes": {
      blockstate: "growth",
      harvestable: 7,
    },
    "minecraft:carrots": {
      blockstate: "growth",
      harvestable: 7,
    },
    // Nether Crops
    "minecraft:nether_wart": {
      blockstate: "growth",
      harvestable: 3,
    },
    // Next Update [1.20]
    "minecraft:torchflower": {
      blockstate: "growth",
      harvestable: 1,
    },
    "minecraft:pitcher_crop": {
      blockstate: "growth",
      harvestable: 1,
    },
  };

  constructor() {
    system.runInterval(() => {
      if (!this.activate) return;

      for (const player of world.getPlayers()) {
        const item = (
          player.getComponent("inventory") as EntityInventoryComponent
        ).container.getItem(player.selectedSlot);
        if (
          !item.typeId.startsWith("minecraft:") ||
          !item.typeId.endsWith("hoe")
        )
          continue;

        const block = player.getBlockFromViewDirection({ maxDistance: 5 });
        if (!(block?.typeId in this.plant)) continue;
        let message = `[SE] ${this.name}`;

        const perm = block.permutation.getProperty(
          this.plant[block.typeId].blockstate
        );
        message += `\nType: ${block.typeId} | Age: ${
          perm < this.plant[block.typeId].harvestable
        }`;
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

export default new CropAgeInfo();
