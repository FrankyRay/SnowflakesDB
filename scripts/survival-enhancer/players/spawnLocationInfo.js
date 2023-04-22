import { world, system, } from "@minecraft/server";
class SpawnLocationInfo {
    constructor() {
        this.id = "spawn_location";
        this.name = "Spawn Location";
        this.desc = "Show the location of world/player spawn point";
        this.beta = false;
        this.group = "Player";
        this.version = [1, 0, 0];
        this.activate = false;
        system.runInterval(() => {
            if (!this.activate)
                return;
            for (const player of world.getPlayers()) {
                // if (!player.hasTag(`se/show/${this.id}`)) return;
                const item = player.getComponent("inventory").container.getItem(player.selectedSlot);
                if (item?.typeId !== "minecraft:compass")
                    continue;
                let message = `[SE] ${this.name}`;
                const worldSpawn = world.getDefaultSpawnPosition();
                const worldDistance = this.distance(worldSpawn, player.location);
                message += `\n§a[World] ${Object.values(worldSpawn).join(" ")} (${worldDistance})`;
                const playerSpawn = player.getSpawnPosition();
                if (playerSpawn) {
                    const playerDistance = this.distance(playerSpawn, player.location);
                    message += `§r | §c[Player] ${Object.values(playerSpawn).join(" ")} (${playerDistance})`;
                }
                player.onScreenDisplay.setActionBar(message);
            }
        });
        // Refreshing "activate" based on scoreboard
        this.refreshingData();
    }
    distance(from, to) {
        const distance2 = this.distance2D(from, to);
        const distance3 = this.distance3D(from, to);
        return `2D: ${distance2} | 3D: ${distance3}`;
    }
    /**
     * Calculate distance from set location to player (2D)
     */
    distance2D(from, to) {
        const { x: spawnX, z: spawnZ } = from;
        const { x: playerX, z: playerZ } = to;
        const sideX = Math.abs(spawnX - Math.floor(playerX));
        const sideZ = Math.abs(spawnZ - Math.floor(playerZ));
        return Math.floor(Math.sqrt(sideX ** 2 + sideZ ** 2));
    }
    /**
     * Calculate distance from set location to player (3D)
     */
    distance3D(from, to) {
        const { x: spawnX, y: spawnY, z: spawnZ } = from;
        const { x: playerX, y: playerY, z: playerZ } = to;
        const sideX = Math.abs(spawnX - Math.floor(playerX));
        const sideY = Math.abs(spawnY - Math.floor(playerY));
        const sideZ = Math.abs(spawnZ - Math.floor(playerZ));
        return Math.floor(Math.sqrt(sideX ** 2 + sideY ** 2 + sideZ ** 2));
    }
    refreshingData() {
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
