import { Player, RawMessage, system, world } from "@minecraft/server";

export default class CommandException extends Error {
  constructor(
    message: string,
    player: Player | undefined = undefined,
    langKey: string = "",
    langValue: any[] = []
  ) {
    super(message);
    this.name = "CustomCommandException";
    this.printMessage(player, langKey, langValue);
  }

  private printMessage(
    player: Player | undefined,
    langKey: string,
    langValue: any[]
  ) {
    const text: RawMessage = {
      rawtext: [{ text: "§c" }, { text: this.message }],
    };
    if (langKey) text.rawtext?.splice(1, 1, { translate: langKey });

    if (langKey && langValue.length > 0) {
      text.rawtext?.splice(1, 1, {
        translate: langKey,
        with: {
          rawtext: langValue.map((val) => {
            return { text: "" + val };
          }),
        },
      });
    }

    system.run(() => {
      if (!player) {
        text.rawtext?.splice(1, 0, { text: "[Debug]" });
        world
          .getDimension("overworld")
          .runCommand(`tellraw @a ${JSON.stringify(text)}`);
      } else {
        player.runCommand(`tellraw @s ${JSON.stringify(text)}`);
      }
    });
  }
}
