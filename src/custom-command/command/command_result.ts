import { Player, Vector2, Vector3, world } from "@minecraft/server";

interface ICommandData {
  name: string;
  description: string;
}

export default class CommandResult {
  /** Player class who runs the command */
  player: Player;
  /** Some information about the command */
  command = {} as ICommandData;
  /** Data/argument that provided by player */
  data: Record<string, string | number | boolean | Vector3 | Vector2>;

  constructor(
    name: string,
    description: string,
    player: Player,
    data: Record<string, string | number | boolean | Vector3 | Vector2>
  ) {
    this.player = player;
    this.command["name"] = name;
    this.command["description"] = description;
    this.data = data;
  }
}
