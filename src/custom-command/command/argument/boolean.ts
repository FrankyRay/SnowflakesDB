import { Player, world } from "@minecraft/server";
import CommandException from "../command_exception";

export interface IBooleanArgument {
  name: string;
  description?: string;
  type: "boolean";
  options?: {};
  default?: boolean;
}

class BooleanArgument {
  private booleanValue = ["false", "true"];

  validate(value: string, data: IBooleanArgument, player: Player) {
    if (!this.booleanValue.includes(value))
      throw new CommandException(
        `Invalid boolean [@${data.name}]`,
        player,
        "commands.generic.boolean.invalid",
        [value]
      );

    return value === "true";
  }
}

export default new BooleanArgument();
