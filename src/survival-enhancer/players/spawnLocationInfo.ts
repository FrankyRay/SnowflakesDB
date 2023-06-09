import {
  world,
  system,
  ItemStack,
  EntityInventoryComponent,
  Vector3,
} from "@minecraft/server";

class SpawnLocationInfo {
  public readonly id = "spawn_location";
  public readonly name = "Spawn Location";
  public readonly desc = "Show the location of world/player spawn point";
  public readonly beta = false;
  public readonly group: string = "Player";
  public readonly version: number[] = [1, 0, 0];
  public activate = false;

  constructor() {
    system.runInterval(() => {
      if (!this.activate) return;

      for (const player of world.getPlayers()) {
        // if (!player.hasTag(`se/show/${this.id}`)) return;
        const item: ItemStack = (
          player.getComponent("inventory") as EntityInventoryComponent
        ).container.getItem(player.selectedSlot);
        if (item?.typeId !== "minecraft:compass") continue;

        let message = `[SE] ${this.name}`;

        const worldSpawn: Vector3 = world.getDefaultSpawnPosition();
        const worldDistance = this.distance(worldSpawn, player.location);
        message += `\n§a[World] ${Object.values(worldSpawn).join(
          " "
        )} (${worldDistance})`;

        const playerSpawn: Vector3 = player.getSpawnPosition();
        if (playerSpawn) {
          const playerDistance = this.distance(playerSpawn, player.location);
          message += `§r | §c[Player] ${Object.values(playerSpawn).join(
            " "
          )} (${playerDistance})`;
        }

        player.onScreenDisplay.setActionBar(message);
      }
    });

    // Refreshing "activate" based on scoreboard
    this.refreshingData();
  }

  private distance(from: Vector3, to: Vector3): string {
    const distance2 = this.distance2D(from, to);
    const distance3 = this.distance3D(from, to);

    return `2D: ${distance2} | 3D: ${distance3}`;
  }

  /**
   * Calculate distance from set location to player (2D)
   */
  private distance2D(from: Vector3, to: Vector3): number {
    const { x: spawnX, z: spawnZ } = from;
    const { x: playerX, z: playerZ } = to;

    const sideX = Math.abs(spawnX - Math.floor(playerX));
    const sideZ = Math.abs(spawnZ - Math.floor(playerZ));

    return Math.floor(Math.sqrt(sideX ** 2 + sideZ ** 2));
  }

  /**
   * Calculate distance from set location to player (3D)
   */
  private distance3D(from: Vector3, to: Vector3): number {
    const { x: spawnX, y: spawnY, z: spawnZ } = from;
    const { x: playerX, y: playerY, z: playerZ } = to;

    const sideX = Math.abs(spawnX - Math.floor(playerX));
    const sideY = Math.abs(spawnY - Math.floor(playerY));
    const sideZ = Math.abs(spawnZ - Math.floor(playerZ));

    return Math.floor(Math.sqrt(sideX ** 2 + sideY ** 2 + sideZ ** 2));
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

export default new SpawnLocationInfo();
