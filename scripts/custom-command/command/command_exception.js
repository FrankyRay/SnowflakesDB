import { system, world } from "@minecraft/server";
export default class CommandException extends Error {
    constructor(message, player = undefined, langKey = "", langValue = []) {
        super(message);
        this.name = "CustomCommandException";
        this.printMessage(player, langKey, langValue);
    }
    printMessage(player, langKey, langValue) {
        const text = {
            rawtext: [{ text: "§c" }, { text: this.message }],
        };
        if (langKey)
            text.rawtext?.splice(1, 1, { translate: langKey });
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
            }
            else {
                player.runCommand(`tellraw @s ${JSON.stringify(text)}`);
            }
        });
    }
}
