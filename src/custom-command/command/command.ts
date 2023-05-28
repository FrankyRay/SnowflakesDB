import { Player, system, world } from "@minecraft/server";
import CommandList, { ICustomCommand } from "./command_list";
import CommandParse from "./command_parse";

class CustomCommand {
  prefix = "\\";
  helpPrefix = "?";

  constructor() {
    this.chatEvent();
    this.scriptEvent();
  }

  addCommand(command: ICustomCommand) {
    CommandList.addCommand(command);
  }

  runCommand(command: string, player: Player) {
    const data = CommandParse.parseCommand(command, player);
    system.run(() => CommandList.getCommand(data.command.name)?.callback(data));
  }

  runHelpCommand(command: string, player: Player) {
    const data = CommandList.getHelpCommand(command);
    player.sendMessage(data);
  }

  private chatEvent() {
    world.beforeEvents.chatSend.subscribe((event) => {
      if (!event.message.startsWith("\\") && !event.message.startsWith("?"))
        return;

      event.cancel = true;
      event.message.startsWith("\\")
        ? this.runCommand(event.message.slice(1), event.sender)
        : this.runHelpCommand(event.message.slice(1), event.sender);
    });
  }

  private scriptEvent() {
    system.events.scriptEventReceive.subscribe((event) => {
      if (event.id !== "command:run" && event.id !== "command:help") return;

      event.id === "command:run"
        ? this.runCommand(event.message, event.sourceEntity as Player)
        : this.runHelpCommand(event.message, event.sourceEntity as Player);
    });
  }
}

export default new CustomCommand();
