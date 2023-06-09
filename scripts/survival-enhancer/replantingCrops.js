import { world, system, } from "@minecraft/server";
class ReplantingCrops {
    constructor() {
        this.id = "replanting_crops";
        this.name = "Replanting Crops";
        this.desc = "Replanting crops when corresponding seeds is available";
        this.beta = true;
        this.group = "Misc";
        this.version = [1, 1, 0];
        this.activate = false;
        this.plant = {
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
        world.afterEvents.blockBreak.subscribe((evd) => {
            if (!this.activate)
                return;
            const { block, brokenBlockPermutation, player } = evd;
            if (!(brokenBlockPermutation.type.id in this.plant))
                return;
            const expectedItemId = this.plant[brokenBlockPermutation.type.id];
            /**
             * @type {Container}
             */
            const container = player.getComponent("inventory").container;
            const mainItem = container.getItem(player.selectedSlot);
            if (!mainItem.typeId.startsWith("minecraft:") ||
                !mainItem.typeId.endsWith("_hoe"))
                return;
            for (let i = 0; i < container.size; i++) {
                const item = container.getItem(i);
                if (item?.typeId !== expectedItemId)
                    continue;
                if (item.amount === 1) {
                    player.getComponent("inventory").container.setItem(i);
                }
                else {
                    item.amount--;
                    player.getComponent("inventory").container.setItem(i, item);
                }
                block.setType(brokenBlockPermutation.type);
                break;
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
export default new ReplantingCrops();
