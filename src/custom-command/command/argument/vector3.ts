import { Player, Vector3, world } from "@minecraft/server";
import CommandException from "../command_exception";

export interface IVec3Argument {
  name: string;
  description?: string;
  type: "vector3";
  options?: {
    /** Allow relative coordinate/tilde notation (~). */
    relativeValue?: boolean;
    /** Allow local coordinate/caret notation (^). */
    localValue?: boolean;
    /** Enable/disable coordinate axis. */
    coordinateAxis?: {
      x?: boolean;
      y?: boolean;
      z?: boolean;
    };
    /** Use zero as unspesified value. Otherwise, use player's current location. */
    zeroDefaultValue?: boolean;
    /** Type of data returned. */
    outputData?: "Vector3" | "Vector" | "string";
  };
  default?: boolean;
}

class Vector3Argument {
  private saveVec3 = {} as { [key: string]: string };
  private dataVec3 = {} as Vector3;

  validate(
    value: string,
    data: IVec3Argument,
    player: Player
  ): [Boolean, Vector3 | null] {
    if (!("x" in this.saveVec3)) {
      this.saveVec3["x"] = value;
      return [false, null];
    } else if (!("y" in this.saveVec3)) {
      this.saveVec3["y"] = value;
      return [false, null];
    } else if (!("z" in this.saveVec3)) {
      this.saveVec3["z"] = value;
    }

    //! Check: Absolute value
    if (
      this.saveVec3.x.startsWith("^") ||
      this.saveVec3.y.startsWith("^") ||
      this.saveVec3.z.startsWith("^")
    )
      this.localCoordinate(data, player);
    else this.worldCoordinate(data, player);

    const result = this.dataVec3;
    this.saveVec3 = {};
    this.dataVec3 = {} as Vector3;
    return [true, result];
  }

  private localCoordinate(data: IVec3Argument, player: Player) {
    if (
      !this.saveVec3.x.startsWith("^") ||
      !this.saveVec3.y.startsWith("^") ||
      !this.saveVec3.z.startsWith("^")
    )
      throw new CommandException(
        `Cannot mix world & local coordinates [@${data.name}]`,
        player
      );

    const localX = Number(this.saveVec3.x.slice(1));
    const localY = Number(this.saveVec3.y.slice(1));
    const localZ = Number(this.saveVec3.z.slice(1));

    const norm = ({ x, y, z }, s) => {
      let l = Math.hypot(x, y, z);
      return {
        x: s * (x / l),
        y: s * (y / l),
        z: s * (z / l),
      };
    };

    const xa = ({ x, y, z }, s) => {
      let m = Math.hypot(x, z);
      let a = {
        x: z,
        y: 0,
        z: -x,
      };

      return norm(a, s);
    };

    const ya = ({ x, y, z }, s) => {
      let m = Math.hypot(x, z);

      let a = {
        x: (x / m) * -y,
        y: m,
        z: (z / m) * -y,
      };

      return norm(a, s);
    };

    const za = (a, s) => {
      return norm(a, s);
    };

    const l = player.location;
    const d = player.getViewDirection();

    let xx = xa(d, localX);
    let yy = ya(d, localY);
    let zz = za(d, localZ);

    this.dataVec3 = {
      x: l.x + xx.x + yy.x + zz.x,
      y: l.y + xx.y + yy.y + zz.y,
      z: l.z + xx.z + yy.z + zz.z,
    };
  }

  private worldCoordinate(data: IVec3Argument, player: Player) {
    const x = this.saveVec3.x.startsWith("~")
      ? player.location.x + Number(this.saveVec3.x.slice(1))
      : Number(this.saveVec3.x);
    const y = this.saveVec3.y.startsWith("~")
      ? player.location.y + Number(this.saveVec3.y.slice(1))
      : Number(this.saveVec3.y);
    const z = this.saveVec3.z.startsWith("~")
      ? player.location.z + Number(this.saveVec3.z.slice(1))
      : Number(this.saveVec3.z);

    this.dataVec3 = { x, y, z };
  }
}

export default new Vector3Argument();
