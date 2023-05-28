import { Player, Vector3 } from "@minecraft/server";

export default function parseCoordinate(
  player: Player,
  input: string
): Vector3 {
  const locOffset: string[] = input.split(" ").map((v) => v.trim());

  //! Too many value
  if (locOffset.length > 3) {
    throw `Too many value`;
  }

  //! Local coordinate mixed with world coordinate
  let localCoord = 0;
  locOffset.forEach((v) => {
    if (v.trim().startsWith("^")) {
      localCoord += 1;
    }
  });
  if (localCoord < 3) {
    throw "Cannot mix world & local coordinates (everything must either use ^ or not).";
  }

  if (localCoord == 3) {
    return localCoordinate(player, locOffset);
  } else {
    return worldCoordinate(player, locOffset);
  }
}

/**
 * Return Vector3 with world coordinate.
 */
function worldCoordinate(player: Player, offset: string[]): Vector3 {
  const newVector = {} as Vector3;

  const axis = ["x", "y", "z"];
  for (let i = 0; i < offset.length; i++) {
    if (offset[i].startsWith("^")) {
      newVector[axis[i]] =
        player.location[axis[i]] + Number(offset[i].slice(1));
    } else {
      newVector[axis[i]] = player.location[axis[i]];
    }
  }

  return newVector;
}

/**
 * Return Vector3 with local coordinate.
 *
 * This code was from [Bedrock Addons](https://discord.com/channels/523663022053392405/1068938635493245069),
 * specifically from [this message](https://discord.com/channels/523663022053392405/1068938635493245069/1069175219538894890)
 * by `WavePlayz#7915`
 */
function localCoordinate(player: Player, offset: string[]): Vector3 {
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

  let xx = xa(d, Number(offset[0].slice(1)));
  let yy = ya(d, Number(offset[1].slice(1)));
  let zz = za(d, Number(offset[2].slice(1)));

  return {
    x: l.x + xx.x + yy.x + zz.x,
    y: l.y + xx.y + yy.y + zz.y,
    z: l.z + xx.z + yy.z + zz.z,
  };
}
