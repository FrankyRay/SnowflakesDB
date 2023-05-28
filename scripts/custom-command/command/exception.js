import { world } from "@minecraft/server";
export default class CommandException extends Error {
    constructor(message, player = null, langKey = "", langValue = []) {
        super(message);
        this.name = "CommandException";
        this.printMessage(player, langKey, langValue);
    }
    printMessage(player = null, langKey = "", langValue = []) {
        let text = { rawtext: [{ text: "§c" + this.message }] };
        if (langKey)
            text = { rawtext: [{ text: "§c" }, { translate: langKey }] };
        if (langKey && langValue.length > 0) {
            text.rawtext[1].with = {
                rawtext: langValue.map((val) => {
                    return { text: "" + val };
                }),
            };
        }
        if (!player) {
            text.rawtext.splice(1, 0, { text: "[Debug]" });
            world
                .getDimension("overworld")
                .runCommand(`tellraw @a ${JSON.stringify(text)}`);
        }
        else {
            player.runCommand(`tellraw @s ${JSON.stringify(text)}`);
        }
    }
}
