var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MooshroomInfo_markVariants;
import { world, system, } from "@minecraft/server";
class MooshroomInfo {
    constructor() {
        this.id = "mooshroom_info";
        this.name = "Mooshroom Info";
        this.desc = "Show mooshroom variant and mark variant";
        this.beta = true;
        this.activate = false;
        _MooshroomInfo_markVariants.set(this, [
            { id: "Poppy", effect: "Night Vision", duration: 4 },
            { id: "Cornflower", effect: "Jump Boost", duration: 4 },
            { id: "Tulips", effect: "Weakness", duration: 7 },
            { id: "Azure Bluent", effect: "Blindness", duration: 6 },
            { id: "Lily of the Valley", effect: "Poison", duration: 10 },
            { id: "Dandelion", effect: "Saturation", duration: 0.3 },
            { id: "Blue Orchid", effect: "Saturation", duration: 0.3 },
            { id: "Allium", effect: "Fire Resistance", duration: 2 },
            { id: "Oxeye Daisy", effect: "Regeneration", duration: 6 },
            { id: "Wither Rose", effect: "Wither", duration: 6 },
            { id: "Torchflower", effect: "Night Vision", duration: 4 },
        ]);
        system.runInterval(() => {
            if (!this.activate)
                return;
            for (const player of world.getPlayers()) {
                const item = player.getComponent("inventory").container.getItem(player.selectedSlot);
                if (item?.typeId !== "minecraft:bowl")
                    return;
                const entity = player.getEntitiesFromViewDirection({
                    maxDistance: 5,
                })[0];
                if (entity?.typeId !== "minecraft:mooshroom")
                    return;
                let message = `[SE] ${this.name}`;
                const variant = entity.getComponent("variant").value;
                message += `\n§a${variant ? "Brown" : "Red"} Mooshroom [V:${variant}] `;
                const markVariant = entity.getComponent("mark_variant").value;
                const mvData = __classPrivateFieldGet(this, _MooshroomInfo_markVariants, "f")[markVariant];
                message += `§r| §c[MV:${markVariant}] ${!mvData
                    ? "NONE"
                    : `${mvData.duration}s ${mvData.effect} (${mvData.id})`}`;
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
_MooshroomInfo_markVariants = new WeakMap();
export default new MooshroomInfo();
