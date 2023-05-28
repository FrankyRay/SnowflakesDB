import { Player, Vector2, world } from "@minecraft/server";
import CommandException from "../command_exception";

export interface IVec2Argument {
  name: string;
  description?: string;
  type: "vector2";
  options?: {
    /** Allow relative coordinate/tilde notation (~). */
    relativeValue?: boolean;
  };
  default?: boolean;
}

class Vector2Argument {
  private saveVec2 = {} as { [key: string]: string };
  private dataVec2 = {} as Vector2;
  private rangeVec2 = {
    x: 180,
    y: 90,
  };

  validate(
    value: string,
    data: IVec2Argument,
    player: Player
  ): [Boolean, Vector2 | null] {
    if (!("x" in this.saveVec2)) {
      this.saveVec2["x"] = value;
      return [false, null];
    } else if (!("y" in this.saveVec2)) {
      this.saveVec2["y"] = value;
    }

    const x = this.saveVec2.x.startsWith("~")
      ? player.location.x + Number(this.saveVec2.x.slice(1))
      : Number(this.saveVec2.x);
    const y = this.saveVec2.y.startsWith("~")
      ? player.location.y + Number(this.saveVec2.y.slice(1))
      : Number(this.saveVec2.y);

    if (x > 180 || x < -180 || y > 90 || y < 90)
      throw new CommandException(
        `Rotation out of range [@${data.name}]`,
        player,
        "commands.generic.rotationError"
      );

    this.dataVec2 = { x, y };
    const result = this.dataVec2;
    this.saveVec2 = {};
    this.dataVec2 = {} as Vector2;
    return [true, result];
  }
}

export default new Vector2Argument();
