import { world, system, ItemStack } from "@minecraft/server";

class SpawnLocationInfo {
  id = "spawn_location";
  name = "Spawn Location";
  beta = true;
  activate = false;
  display = true;

  constructor() {
    system.runInterval(() => {
      if (!this.activate) return;

      for (const player of world.getPlayers()) {
        // if (!player.hasTag(`se/show/${this.id}`)) return;
        /**
         * @type {ItemStack}
         */
        const item = player
          .getComponent("inventory")
          .container.getItem(player.selectedSlot);
        if (item.typeId !== "minecraft:compass") return;

        let message = `[SE] ${this.name}`;

        const worldSpawn = world.getDefaultSpawnPosition();
        const worldDistance = this.#distance(worldSpawn, player.location);
        message += `\n§a[World] ${Object.values(worldSpawn).join(
          " "
        )} (${worldDistance})`;

        const playerSpawn = player.getSpawnPosition();
        if (playerSpawn) {
          const playerDistance = this.#distance(playerSpawn, player.location);
          message += `§r | §c[Player] ${Object.values(playerSpawn).join(
            " "
          )} (${playerDistance})`;
        }

        player.onScreenDisplay.setActionBar(message);
      }
    });

    // Refreshing "activate" based on scoreboard
    this.#refreshingData();
  }

  /**
   * Calculate distance from set location to player (2D)
   *
   * @param {import("@minecraft/server").Vector3} from
   * Base location
   *
   * @param {import("@minecraft/server").Vector3} to
   * Player location
   *
   * @return {number} How far distance from two location
   */
  #distance(from, to) {
    const { x: spawnX, z: spawnZ } = from;
    const { x: playerX, z: playerZ } = to;

    const sideX = Math.abs(spawnX - Math.floor(playerX));
    const sideZ = Math.abs(spawnZ - Math.floor(playerZ));

    return Math.floor(Math.sqrt(sideX ** 2 + sideZ ** 2));
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

export default new SpawnLocationInfo();
