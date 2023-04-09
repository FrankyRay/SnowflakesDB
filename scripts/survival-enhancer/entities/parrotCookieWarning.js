import { world, system, ItemStack } from "@minecraft/server";

class ParrotCookieWarning {
  id = "parrot_cookie_warning";
  name = "Parrot Cookie Warning";
  desc = "Show notification to player when trying to give parrot a cookie";
  beta = true;
  activate = false;

  constructor() {
    system.runInterval(() => {
      if (!this.activate) return;

      for (const player of world.getPlayers()) {
        /**
         * @type {ItemStack}
         */
        const item = player
          .getComponent("inventory")
          .container.getItem(player.selectedSlot);
        if (item?.typeId !== "minecraft:cookie") return;

        const entity = player.getEntitiesFromViewDirection({
          maxDistance: 5,
        })[0];
        if (entity?.typeId !== "minecraft:parrot") return;
        let message = `[SE] ${this.name}\n§4[WARNING] §cDon't give cookie to parrot, you monster!`;

        player.onScreenDisplay.setActionBar(message);
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

export default new ParrotCookieWarning();
