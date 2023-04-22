import { world, system, EntityInventoryComponent } from "@minecraft/server";

class TimeDayInfo {
  public readonly id: string = "time_day_info";
  public readonly name: string = "Time Day Info";
  public readonly desc: string = "Show the time value";
  public readonly beta: boolean = true;
  public readonly group: string = "Player";
  public readonly version: number[] = [1, 0, 0];
  public activate: boolean = false;

  constructor() {
    system.runInterval(() => {
      if (!this.activate) return;

      for (const player of world.getPlayers()) {
        const item = (
          player.getComponent("inventory") as EntityInventoryComponent
        ).container.getItem(player.selectedSlot);
        if (item?.typeId !== "minecraft:clock") continue;
        let message = `[SE] ${this.name}`;

        const worldTime = world.getTime();
        const absoluteTime = world.getAbsoluteTime();
        message += `\n§aWorld: ${this.numberToTime(
          worldTime
        )} §r| §cAbsolute: ${this.numberToTime(absoluteTime)}`;

        player.onScreenDisplay.setActionBar(message);
      }
    });

    // Refreshing "activate" based on scoreboard
    this.refreshingData();
  }

  private numberToTime(time: number): string {
    let hour = Math.floor(time / 1000) + 6;
    if (time > 18000) hour -= 18;

    return `${hour <= 10 ? "0" + hour : hour}${
      Math.floor(time / 20) % 2 ? ":" : "."
    }00 ${hour >= 12 ? "PM" : "AM"}`;
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

export default new TimeDayInfo();
