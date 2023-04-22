import {
  world,
  system,
  Entity,
  EntityVariantComponent,
} from "@minecraft/server";

class CatVariantInfo {
  public readonly id: string = "cat_variant_inf";
  public readonly name: string = "Cat Variant Info";
  public readonly desc: string = "Show the variant of cat";
  public readonly beta: boolean = true;
  public readonly group: string = "Entity";
  public readonly version: number[] = [1, 0, 0];
  public activate: boolean = false;

  private variants = [
    "White",
    "Tuxedo",
    "Red",
    "Siamese",
    "British",
    "Calico",
    "Persian",
    "Ragdoll",
    "Tabby",
    "Black",
    "Jellie",
  ];

  constructor() {
    system.runInterval(() => {
      if (!this.activate) return;

      for (const player of world.getPlayers()) {
        const entity: Entity = player.getEntitiesFromViewDirection({
          maxDistance: 5,
        })[0];
        if (entity?.typeId !== "minecraft:cat") continue;
        let message = `[SE] ${this.name}`;

        const variant = (
          entity.getComponent("variant") as EntityVariantComponent
        ).value;
        message += `\n§a[${variant}/10] §c${this.variants[variant]} Cat`;

        player.onScreenDisplay.setActionBar(message);
      }
    });

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

export default new CatVariantInfo();
