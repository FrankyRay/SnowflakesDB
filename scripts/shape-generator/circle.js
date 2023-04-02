import {
  world,
  Vector,
  Player,
  Block,
  MinecraftBlockTypes,
} from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

/**
 * Create circle
 *
 * @param {Player} player
 * Player
 */
export default function circleGenerator(player) {
  const circleForm = new ModalFormData()
    .title("Circle Generator")
    .textField(
      "Location §8[Optional]\n(Default on player's position)",
      "Location"
    )
    .textField("Block Type", "Block ID")
    .slider("Radius", 1, 10, 1)
    .toggle("Hollow\n§8[§cFill§8/§aHollow§8]", false);

  circleForm
    .show(player)
    .then((response) => {
      if (response.canceled) return;

      const [loc, block, radius, hollow] = response.formValues;

      let location = {
        x: Math.floor(player.location.x),
        y: Math.floor(player.location.y),
        z: Math.floor(player.location.z),
      };
      if (loc) {
        const vec3 = loc.split(" ");
        location = {
          x: Math.floor(vec3[0]),
          y: Math.floor(vec3[1]),
          z: Math.floor(vec3[2]),
        };
      }

      console.warn("Running!");
      circleFormation(location, radius, hollow, block, player);
      player.onScreenDisplay.setActionBar(
        `Done! Creating ${
          hollow ? "hollowed " : ""
        }circle with radius of [${radius}] centered at [${Object.values(
          location
        ).join(" ")}]`
      );
    })
    .catch((err) => console.error(err, err.stack));
}

/**
 * Generate circle
 *
 * @param {Vector|import("@minecraft/server").Vector3} c
 * The center position of circle
 *
 * @param {Number} r
 * The radius of circle
 *
 * @param {Boolean} h
 * Whether the circle is hollow or not
 *
 * @param {Block} b
 * Block identifier
 *
 * @param {Player} p
 * Player class
 */
function circleFormation(c, r, h, b, p) {
  for (let x = c.x - r; x <= c.x + r; x++) {
    for (let z = c.z - r; z <= c.z + r; z++) {
      p.onScreenDisplay.setActionBar(`Testing [${x} | ${z}]`);
      const eq = (x - c.x) ** 2 + (z - c.z) ** 2;

      if (eq > r ** 2) continue;

      // Hollow
      if (h && eq < r ** 2 - r * 2) continue;

      world
        .getDimension("overworld")
        .getBlock(new Vector(x, c.y, z))
        .setType(MinecraftBlockTypes.get(b));
    }
  }
}
