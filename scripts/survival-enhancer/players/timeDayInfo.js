import { world, system } from "@minecraft/server";
class TimeDayInfo {
    constructor() {
        this.id = "time_day_info";
        this.name = "Time Day Info";
        this.desc = "Show the time value";
        this.beta = true;
        this.group = "Player";
        this.version = [1, 0, 0];
        this.activate = false;
        system.runInterval(() => {
            if (!this.activate)
                return;
            for (const player of world.getPlayers()) {
                const item = player.getComponent("inventory").container.getItem(player.selectedSlot);
                if (item?.typeId !== "minecraft:clock")
                    continue;
                let message = `[SE] ${this.name}`;
                const worldTime = world.getTime();
                const absoluteTime = world.getAbsoluteTime();
                message += `\n§aWorld: ${this.numberToTime(worldTime)} §r| §cAbsolute: ${absoluteTime}`;
                player.onScreenDisplay.setActionBar(message);
            }
        });
        // Refreshing "activate" based on scoreboard
        this.refreshingData();
    }
    numberToTime(time) {
        let hour = Math.floor(time / 1000) + 6;
        if (hour >= 24)
            hour -= 24;
        let minute = Math.floor((time - (hour - 6) * 1000) / 10) % 100;
        let midday = !!(Math.floor(hour / 12) % 2) ? "PM" : "AM";
        let hour12 = hour % 12 === 0 ? 12 : hour % 12;
        return `${("" + hour12).padStart(2, "0")}:${("" + minute).padStart(2, "0")} ${midday}`;
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
export default new TimeDayInfo();
