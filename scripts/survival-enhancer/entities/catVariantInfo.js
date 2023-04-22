import { world, system, } from "@minecraft/server";
class CatVariantInfo {
    constructor() {
        this.id = "cat_variant_inf";
        this.name = "Cat Variant Info";
        this.desc = "Show the variant of cat";
        this.beta = true;
        this.group = "Entity";
        this.version = [1, 0, 0];
        this.activate = false;
        this.variants = [
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
        system.runInterval(() => {
            if (!this.activate)
                return;
            for (const player of world.getPlayers()) {
                const entity = player.getEntitiesFromViewDirection({
                    maxDistance: 5,
                })[0];
                if (entity?.typeId !== "minecraft:cat")
                    continue;
                let message = `[SE] ${this.name}`;
                const variant = entity.getComponent("variant").value;
                message += `\n§a[${variant}/10] §c${this.variants[variant]} Cat`;
                player.onScreenDisplay.setActionBar(message);
            }
        });
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
export default new CatVariantInfo();
