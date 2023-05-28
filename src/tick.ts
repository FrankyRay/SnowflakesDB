import { system, world } from "@minecraft/server";

function showInfo() {
  for (const player of world.getPlayers()) {
    if (!player.hasTag("snowflake:actionbar_test")) continue;
    let message = `Player ${player.name}#${player.id}`;

    const data = [
      "isClimbing",
      "isFalling",
      "isFlying",
      "isGliding",
      "isInWater",
      "isJumping",
      "isOnGround",
      "isOp",
      "isSneaking",
      "isSprinting",
      "isSwimming",
    ];

    const reset = "§r | ";
    const IS = (isSomething: string): string =>
      player[isSomething]
        ? "§a" + isSomething.slice(2)
        : "§c" + isSomething.slice(2);

    message +=
      "\n" +
      data
        .map((v) =>
          v !== "isFalling"
            ? IS(v)
            : IS(v) + ` (${player.fallDistance.toFixed(2)})`
        )
        .join(reset);

    player.onScreenDisplay.setActionBar(message);
  }
}

system.runInterval(showInfo);
