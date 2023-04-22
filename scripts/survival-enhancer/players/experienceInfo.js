import { world, system, MinecraftBlockTypes } from "@minecraft/server";
class ExperienceInfo {
    constructor() {
        this.id = "experience_info";
        this.name = "Experience Info";
        this.desc = "Show the amount of experience you have";
        this.beta = true;
        this.group = "Player";
        this.version = [1, 0, 0];
        this.activate = false;
        system.runInterval(() => {
            if (!this.activate)
                return;
            for (const player of world.getPlayers()) {
                // if (!player.hasTag(`se/show/${this.id}`)) return;
                const block = player.getBlockFromViewDirection({
                    maxDistance: 5,
                });
                if (block?.type !== MinecraftBlockTypes.anvil)
                    continue;
                let message = `[SE] ${this.name}`;
                const currentXp = player.xpEarnedAtCurrentLevel;
                const requiredXp = player.totalXpNeededForNextLevel;
                const totalXp = player.getTotalXp();
                const totalLevel = player.addLevels(0);
                message += `\nLevel: ${totalLevel} | Experience: ${totalXp} [ ${currentXp} / ${requiredXp} ]`;
                player.onScreenDisplay.setActionBar(message);
            }
        });
        // Refreshing "activate" based on scoreboard
        this.refreshingData();
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
export default new ExperienceInfo();
