import { system, world } from "@minecraft/server";
import CommandList from "./command_list";
import CommandParse from "./command_parse";
class CustomCommand {
    constructor() {
        this.prefix = "\\";
        this.helpPrefix = "?";
        this.chatEvent();
        this.scriptEvent();
    }
    addCommand(command) {
        CommandList.addCommand(command);
    }
    runCommand(command, player) {
        const data = CommandParse.parseCommand(command, player);
        system.run(() => CommandList.getCommand(data.command.name)?.callback(data));
    }
    runHelpCommand(command, player) {
        const data = CommandList.getHelpCommand(command);
        player.sendMessage(data);
    }
    chatEvent() {
        world.beforeEvents.chatSend.subscribe((event) => {
            if (!event.message.startsWith("\\") && !event.message.startsWith("?"))
                return;
            event.cancel = true;
            event.message.startsWith("\\")
                ? this.runCommand(event.message.slice(1), event.sender)
                : this.runHelpCommand(event.message.slice(1), event.sender);
        });
    }
    scriptEvent() {
        system.events.scriptEventReceive.subscribe((event) => {
            if (event.id !== "command:run" && event.id !== "command:help")
                return;
            event.id === "command:run"
                ? this.runCommand(event.message, event.sourceEntity)
                : this.runHelpCommand(event.message, event.sourceEntity);
        });
    }
}
export default new CustomCommand();
